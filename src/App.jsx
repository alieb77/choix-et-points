import { useState } from 'react'
import Home from './pages/Home'
import GameRoom from './pages/GameRoom'

export default function App() {
  const [session, setSession] = useState(null) // { roomCode, playerName }

  const handleJoin = (roomCode, playerName) => {
    setSession({ roomCode, playerName })
  }

  const handleLeave = () => {
    setSession(null)
  }

  if (!session) {
    return <Home onJoin={handleJoin} />
  }

  return (
    <GameRoom
      roomCode={session.roomCode}
      playerName={session.playerName}
      onLeave={handleLeave}
    />
  )
}
