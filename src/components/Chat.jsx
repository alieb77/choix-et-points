import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { AVATAR_COLORS } from '../lib/game'

export default function Chat({ roomId, playerName, players }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  const myPlayer = players.find(p => p.name === playerName)
  const myColor = myPlayer ? AVATAR_COLORS[myPlayer.color_index % AVATAR_COLORS.length] : AVATAR_COLORS[0]

  useEffect(() => {
    if (!roomId) return

    // Fetch last 50 messages
    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => setMessages(data || []))

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [roomId])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim().slice(0, 20)
    if (!text || !roomId) return
    setInput('')
    await supabase.from('messages').insert({
      room_id: roomId,
      player_name: playerName,
      text,
    })
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  const getColor = (name) => {
    const p = players.find(pl => pl.name === name)
    return p ? AVATAR_COLORS[p.color_index % AVATAR_COLORS.length] : AVATAR_COLORS[0]
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '1rem' }}>
      <div className="section-label" style={{ marginBottom: 8 }}>Chat</div>

      {/* Messages */}
      <div style={{
        height: 160,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        marginBottom: 10,
        paddingRight: 4,
      }}
        className="log"
      >
        {messages.length === 0 && (
          <span style={{ fontSize: 12, color: 'var(--text3)', margin: 'auto' }}>Aucun message…</span>
        )}
        {messages.map(msg => {
          const c = getColor(msg.player_name)
          const isMe = msg.player_name === playerName
          return (
            <div key={msg.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 6,
              flexDirection: isMe ? 'row-reverse' : 'row',
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: c.bg, color: c.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, flexShrink: 0,
                fontFamily: 'Syne, sans-serif',
              }}>
                {msg.player_name[0].toUpperCase()}
              </div>
              <div style={{
                background: isMe ? 'rgba(108,99,255,0.2)' : 'var(--bg3)',
                borderRadius: 8,
                padding: '4px 8px',
                maxWidth: '75%',
              }}>
                {!isMe && (
                  <div style={{ fontSize: 10, color: c.text, fontWeight: 700, marginBottom: 1, fontFamily: 'Syne, sans-serif' }}>
                    {msg.player_name}
                  </div>
                )}
                <div style={{ fontSize: 13, color: 'var(--text)', wordBreak: 'break-word' }}>
                  {msg.text}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder="Max 20 caractères…"
          value={input}
          onChange={e => setInput(e.target.value.slice(0, 20))}
          onKeyDown={handleKey}
          maxLength={20}
          style={{ flex: 1, fontSize: 13, padding: '6px 10px' }}
        />
        <button
          className="btn btn-primary"
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{ padding: '6px 14px', fontSize: 13 }}
        >
          →
        </button>
      </div>
      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4, textAlign: 'right' }}>
        {input.length}/20
      </div>
    </div>
  )
}
