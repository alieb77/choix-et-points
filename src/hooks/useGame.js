import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { calcParams } from '../lib/game'

export function useGame(roomCode, playerName) {
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [myPlayer, setMyPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const myPlayerIdRef = useRef(null)

  // Subscribe to room + players realtime
  useEffect(() => {
    if (!roomCode || !playerName) return

    let roomChannel
    let playersChannel

    const init = async () => {
      setLoading(true)

      // Fetch room
      const { data: roomData, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single()

      if (roomErr || !roomData) {
        setError('Salle introuvable.')
        setLoading(false)
        return
      }
      setRoom(roomData)

      // Upsert player
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('name', playerName)

      let playerId
      if (existingPlayers && existingPlayers.length > 0) {
        playerId = existingPlayers[0].id
        await supabase
          .from('players')
          .update({ online: true })
          .eq('id', playerId)
      } else {
        // Count existing to assign color index
        const { count } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', roomData.id)

        const { data: newPlayer, error: insertErr } = await supabase
          .from('players')
          .insert({
            room_id: roomData.id,
            name: playerName,
            score: 10,
            eliminated: false,
            online: true,
            color_index: count || 0,
          })
          .select()
          .single()

        if (insertErr) {
          setError('Erreur lors de la connexion à la salle.')
          setLoading(false)
          return
        }
        playerId = newPlayer.id
      }

      myPlayerIdRef.current = playerId

      // Fetch all players
      const { data: allPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .order('created_at')

      setPlayers(allPlayers || [])
      setMyPlayer(allPlayers?.find(p => p.id === playerId) || null)
      setLoading(false)

      // Realtime: room changes
      roomChannel = supabase
        .channel(`room:${roomData.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomData.id}`,
        }, payload => {
          setRoom(payload.new)
        })
        .subscribe()

      // Realtime: player changes
      playersChannel = supabase
        .channel(`players:${roomData.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomData.id}`,
        }, async () => {
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('room_id', roomData.id)
            .order('created_at')
          setPlayers(data || [])
          setMyPlayer(data?.find(p => p.id === myPlayerIdRef.current) || null)
        })
        .subscribe()
    }

    init()

    // Cleanup: mark offline
    const handleUnload = () => {
      if (myPlayerIdRef.current) {
        supabase.from('players').update({ online: false }).eq('id', myPlayerIdRef.current)
      }
    }
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      handleUnload()
      if (roomChannel) supabase.removeChannel(roomChannel)
      if (playersChannel) supabase.removeChannel(playersChannel)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [roomCode, playerName])

  const submitChoice = useCallback(async (number) => {
    if (!myPlayerIdRef.current || !room) return
    await supabase
      .from('players')
      .update({ current_choice: number, has_chosen: true })
      .eq('id', myPlayerIdRef.current)
  }, [room])

  const startGame = useCallback(async () => {
    if (!room) return
    await supabase
      .from('rooms')
      .update({ status: 'playing', turn: 1 })
      .eq('id', room.id)
  }, [room])

  const revealAndScore = useCallback(async () => {
    if (!room || !players.length) return
    const activePlayers = players.filter(p => !p.eliminated)
    const counts = {}
    activePlayers.forEach(p => {
      if (p.current_choice != null) {
        counts[p.current_choice] = (counts[p.current_choice] || 0) + 1
      }
    })

    const { range, winScore } = calcParams(players.length)

    const updates = []
    let winnerId = null

    for (const p of activePlayers) {
      const choice = p.current_choice
      if (choice == null) continue
      const unique = counts[choice] === 1
      const delta = unique ? +choice : -choice
      const newScore = p.score + delta
      const eliminated = newScore <= -30
      const finalScore = eliminated ? -30 : newScore

      updates.push(
        supabase.from('players').update({
          score: finalScore,
          eliminated,
          has_chosen: false,
          current_choice: null,
          last_choice: choice,
          last_delta: delta,
        }).eq('id', p.id)
      )

      if (finalScore >= winScore) winnerId = p.id
    }

    await Promise.all(updates.map(u => u))

    // Check if game over
    const remainingActive = activePlayers.filter(p => {
      const up = updates.find(u => u) // rough check
      return true
    })

    const newStatus = winnerId ? 'finished' : 'reveal'
    await supabase.from('rooms').update({
      status: newStatus,
      winner_id: winnerId || null,
    }).eq('id', room.id)
  }, [room, players])

  const nextTurn = useCallback(async () => {
    if (!room) return
    // Re-fetch players to check eliminations
    const { data: freshPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)

    const active = freshPlayers?.filter(p => !p.eliminated) || []
    const { winScore } = calcParams(freshPlayers?.length || 2)
    const winner = active.find(p => p.score >= winScore)

    if (winner || active.length <= 1) {
      await supabase.from('rooms').update({
        status: 'finished',
        winner_id: winner?.id || active[0]?.id || null,
      }).eq('id', room.id)
    } else {
      await supabase.from('rooms').update({
        status: 'playing',
        turn: (room.turn || 1) + 1,
      }).eq('id', room.id)
    }
  }, [room])

  return {
    room,
    players,
    myPlayer,
    myPlayerId: myPlayerIdRef.current,
    loading,
    error,
    submitChoice,
    startGame,
    revealAndScore,
    nextTurn,
  }
}
