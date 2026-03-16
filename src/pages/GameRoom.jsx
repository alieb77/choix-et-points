import { useGame } from '../hooks/useGame'
import { calcParams, AVATAR_COLORS } from '../lib/game'
import Scoreboard from '../components/Scoreboard'
import NumberPicker from '../components/NumberPicker'
import Chat from '../components/Chat'

export default function GameRoom({ roomCode, playerName, onLeave }) {
  const { room, players, myPlayer, loading, error, submitChoice, startGame, revealAndScore, nextTurn } = useGame(roomCode, playerName)

  if (loading) return (
    <div className="app" style={{ justifyContent: 'center' }}>
      <p className="text-muted pulse">Connexion à la salle…</p>
    </div>
  )

  if (error) return (
    <div className="app" style={{ justifyContent: 'center', maxWidth: 400 }}>
      <div className="card text-center">
        <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
        <button className="btn btn-secondary" onClick={onLeave}>Retour</button>
      </div>
    </div>
  )

  if (!room) return null

  const totalPlayers = players.length
  const { range, winScore } = calcParams(totalPlayers)
  const activePlayers = players.filter(p => !p.eliminated)
  const isHost = room.host_name === playerName

  if (room.status === 'lobby') {
    return (
      <div className="app" style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div className="fade-in" style={{ width: '100%', paddingTop: '1.5rem' }}>
          <div className="text-center mb-lg">
            <div className="section-label" style={{ marginBottom: 8 }}>Code de la salle</div>
            <div className="room-code" onClick={() => navigator.clipboard?.writeText(roomCode)} style={{ cursor: 'pointer' }}>
              {roomCode}
            </div>
            <p className="text-muted text-sm mt-sm">Partagez ce code avec vos amis</p>
          </div>

          <div className="card mb-md">
            <div className="section-label">Joueurs ({totalPlayers})</div>
            <div className="flex flex-col mt-sm" style={{ gap: 10 }}>
              {players.map(p => (
                <div key={p.id} className="player-row">
                  <div className="avatar" style={{
                    background: AVATAR_COLORS[p.color_index % AVATAR_COLORS.length].bg,
                    color: AVATAR_COLORS[p.color_index % AVATAR_COLORS.length].text,
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 14, flex: 1 }}>{p.name}</span>
                  {room.host_name === p.name && (
                    <span className="tag" style={{ background: 'rgba(108,99,255,0.2)', color: '#a78bfa', fontSize: 11 }}>hôte</span>
                  )}
                  <span className={`dot ${p.online !== false ? 'dot-green' : 'dot-gray'}`} />
                </div>
              ))}
            </div>
            {totalPlayers >= 2 && (
              <div className="card mt-md" style={{ background: 'var(--bg3)', padding: '0.75rem 1rem', fontSize: 12, color: 'var(--text2)' }}>
                Plage : <strong style={{ color: 'var(--text)' }}>1-{range}</strong> &nbsp;·&nbsp;
                Victoire : <strong style={{ color: 'var(--text)' }}>{winScore} pts</strong> &nbsp;·&nbsp;
                Elimination : <strong style={{ color: 'var(--danger)' }}>-30 pts</strong>
              </div>
            )}
          </div>

          {isHost ? (
            <button className="btn btn-primary btn-full" style={{ padding: 14, fontSize: 16 }} onClick={startGame} disabled={totalPlayers < 2}>
              {totalPlayers < 2 ? 'En attente de joueurs...' : `Lancer la partie (${totalPlayers} joueurs)`}
            </button>
          ) : (
            <div className="card text-center" style={{ color: 'var(--text2)', fontSize: 14 }}>
              <span className="pulse">En attente que l'hote lance la partie...</span>
            </div>
          )}

          <div className="mt-md">
            <Chat roomId={room?.id} playerName={playerName} players={players} />
          </div>

          <button className="btn btn-secondary btn-full mt-sm text-sm" onClick={onLeave}>Quitter</button>
        </div>
      </div>
    )
  }

  if (room.status === 'playing') {
    const alreadyChosen = myPlayer?.has_chosen
    const waitingFor = activePlayers.filter(p => !p.has_chosen && !p.eliminated).length
    const allChosen = waitingFor === 0

    return (
      <div className="app" style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <div className="fade-in" style={{ width: '100%', paddingTop: '1rem' }}>
          <div className="flex justify-between items-center mb-md">
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Choix & Points</h1>
            <span className="text-muted text-sm">Tour {room.turn}</span>
          </div>

          <div className="info-pills">
            <span className="info-pill">Plage <strong> 1-{range}</strong></span>
            <span className="info-pill">Victoire <strong> {winScore} pts</strong></span>
            <span className="info-pill">Joueurs actifs <strong> {activePlayers.length}</strong></span>
          </div>

          <div className="card mb-md">
            <Scoreboard players={players} winScore={winScore} />
          </div>

          <div className="card mb-md">
            {alreadyChosen ? (
              <div className="text-center" style={{ padding: '1rem 0' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
                <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>Choix enregistré !</p>
                <p className="text-muted text-sm mt-sm pulse">En attente de {waitingFor} joueur{waitingFor > 1 ? 's' : ''}...</p>
                {isHost && allChosen && (
                  <button className="btn btn-success mt-md" onClick={revealAndScore}>Révéler les choix →</button>
                )}
              </div>
            ) : myPlayer?.eliminated ? (
              <div className="text-center" style={{ padding: '1rem 0' }}>
                <p style={{ color: 'var(--warn)', fontFamily: 'Syne', fontWeight: 700 }}>Vous etes éliminé</p>
                <p className="text-muted text-sm mt-sm">Regardez les autres jouer...</p>
              </div>
            ) : (
              <>
                <div className="section-label mb-md">Choisissez votre nombre</div>
                <NumberPicker range={range} onSubmit={submitChoice} disabled={alreadyChosen} />
              </>
            )}
          </div>

          <div className="card mb-md">
            <div className="section-label">Statut des joueurs</div>
            <div className="flex flex-col mt-sm" style={{ gap: 8 }}>
              {activePlayers.map(p => (
                <div key={p.id} className="flex items-center gap-sm">
                  <span className={`dot ${p.has_chosen ? 'dot-green' : 'dot-gray'}`} />
                  <span className="text-sm" style={{ flex: 1 }}>{p.name}</span>
                  <span className="text-xs text-muted">{p.has_chosen ? 'Pret ✓' : 'En train de choisir...'}</span>
                </div>
              ))}
            </div>
            {isHost && allChosen && (
              <button className="btn btn-success btn-full mt-md" onClick={revealAndScore}>Tous prets — Révéler →</button>
            )}
          </div>

          <Chat roomId={room?.id} playerName={playerName} players={players} />
        </div>
      </div>
    )
  }

  if (room.status === 'reveal') {
    return (
      <div className="app" style={{ maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <div className="fade-in" style={{ width: '100%', paddingTop: '1rem' }}>
          <div className="flex justify-between items-center mb-md">
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Révélation</h1>
            <span className="text-muted text-sm">Tour {room.turn}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: '1rem' }}>
            {activePlayers.map(p => {
              const color = AVATAR_COLORS[p.color_index % AVATAR_COLORS.length]
              const isWin = p.last_delta > 0
              return (
                <div key={p.id} className="card pop" style={{ flex: '1 1 120px', textAlign: 'center', padding: '1rem' }}>
                  <div className="avatar" style={{ background: color.bg, color: color.text, margin: '0 auto 8px' }}>
                    {p.name[0].toUpperCase()}
                  </div>
                  <div style={{ fontFamily: 'Syne', fontSize: 13, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 32, color: isWin ? '#4ade80' : '#f87171' }}>
                    {p.last_choice}
                  </div>
                  <span className={`tag ${isWin ? 'tag-win' : 'tag-lose'}`}>
                    {p.last_delta > 0 ? '+' : ''}{p.last_delta}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="card mb-md">
            <Scoreboard players={players} winScore={winScore} />
          </div>

          {isHost ? (
            <button className="btn btn-primary btn-full mb-md" style={{ padding: 14 }} onClick={nextTurn}>Tour suivant →</button>
          ) : (
            <div className="card text-center text-muted text-sm mb-md">
              <span className="pulse">En attente de l'hote...</span>
            </div>
          )}

          <Chat roomId={room?.id} playerName={playerName} players={players} />
        </div>
      </div>
    )
  }

  if (room.status === 'finished') {
    const winner = players.find(p => p.id === room.winner_id)
    const winColor = winner ? AVATAR_COLORS[winner.color_index % AVATAR_COLORS.length] : null
    const iWon = winner?.name === playerName

    return (
      <div className="app" style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <div className="fade-in text-center" style={{ width: '100%', paddingTop: '2rem' }}>
          {winner ? (
            <div className="card mb-md" style={{ border: '1px solid rgba(74,222,128,0.3)', background: 'rgba(74,222,128,0.05)', padding: '2rem' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{iWon ? '🏆' : '🎉'}</div>
              <div className="avatar pop" style={{ background: winColor.bg, color: winColor.text, margin: '0 auto 12px', width: 56, height: 56, fontSize: 20 }}>
                {winner.name[0].toUpperCase()}
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ade80' }}>
                {iWon ? 'Vous avez gagné !' : `${winner.name} gagne !`}
              </h2>
              <p className="text-muted mt-sm">{winner.score} points · Tour {room.turn}</p>
            </div>
          ) : (
            <div className="card mb-md" style={{ border: '1px solid rgba(248,113,113,0.3)', padding: '2rem' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💀</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>Tous éliminés !</h2>
            </div>
          )}

          <div className="card mb-md">
            <Scoreboard players={players} winScore={winScore} />
          </div>

          <div className="mb-md">
            <Chat roomId={room?.id} playerName={playerName} players={players} />
          </div>

          <button className="btn btn-secondary btn-full" onClick={onLeave}>Retour à l'accueil</button>
        </div>
      </div>
    )
  }

  return null
}
