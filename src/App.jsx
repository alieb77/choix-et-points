import { useState, useEffect } from 'react'
import Home from './pages/Home'
import GameRoom from './pages/GameRoom'

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('cep-session')
    return saved ? JSON.parse(saved) : null
  })

  const handleJoin = (roomCode, playerName) => {
    const s = { roomCode, playerName }
    localStorage.setItem('cep-session', JSON.stringify(s))
    setSession(s)
  }

  const handleLeave = () => {
    localStorage.removeItem('cep-session')
    setSession(null)
  }

  if (!session) return <Home onJoin={handleJoin} />

  return (
    <GameRoom
      roomCode={session.roomCode}
      playerName={session.playerName}
      onLeave={handleLeave}
    />
  )
}