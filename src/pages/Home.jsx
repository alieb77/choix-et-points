import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/game'

export default function Home({ onJoin }) {
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createRoom = async () => {
    if (!name.trim()) return setError('Entrez votre prénom.')
    setLoading(true)
    setError('')
    const roomCode = generateRoomCode()
    const { error: err } = await supabase.from('rooms').insert({
      code: roomCode,
      status: 'lobby',
      turn: 0,
      host_name: name.trim(),
    })
    if (err) { setError('Erreur lors de la création.'); setLoading(false); return }
    onJoin(roomCode, name.trim())
  }

  const joinRoom = async () => {
    if (!name.trim()) return setError('Entrez votre prénom.')
    if (!code.trim()) return setError('Entrez le code de la salle.')
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .single()
    if (err || !data) { setError('Salle introuvable.'); setLoading(false); return }
    if (data.status === 'finished') { setError('Cette partie est terminée.'); setLoading(false); return }
    onJoin(data.code, name.trim())
  }

  return (
    <div className="app" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
      <div className="fade-in" style={{ width: '100%' }}>
        {/* Logo */}
        <div className="text-center mb-lg" style={{ paddingTop: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #6c63ff, #a78bfa)',
            marginBottom: '1rem', fontSize: 28,
          }}>🎲</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Choix & Points
          </h1>
          <p className="text-muted mt-sm" style={{ fontSize: 14 }}>
            Bluffez. Devinez. Survivez.
          </p>
        </div>

        {!mode ? (
          <div className="flex flex-col gap-sm">
            <button className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: 16 }}
              onClick={() => setMode('create')}>
              Créer une salle
            </button>
            <button className="btn btn-secondary btn-full" style={{ padding: '14px', fontSize: 16 }}
              onClick={() => setMode('join')}>
              Rejoindre une salle
            </button>

            <div className="card mt-lg" style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Règles</div>
              Départ : 10 pts · Victoire adaptée · Élimination : −30 pts<br />
              Choisissez un nombre en secret. Soyez le seul → vous gagnez ces points.
              Doublon → tout le monde perd ces points. La plage s'adapte au nombre de joueurs.
            </div>
          </div>
        ) : (
          <div className="card fade-in">
            <button className="btn btn-secondary text-sm mb-md"
              onClick={() => { setMode(null); setError('') }}>
              ← Retour
            </button>

            <div className="section-label">
              {mode === 'create' ? 'Créer une salle' : 'Rejoindre une salle'}
            </div>

            <div className="flex flex-col gap-sm mt-sm">
              <input
                type="text"
                placeholder="Votre prénom"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
                autoFocus
              />
              {mode === 'join' && (
                <input
                  type="text"
                  placeholder="Code de la salle (ex: XK9TM)"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  style={{ letterSpacing: '0.15em', fontFamily: 'Syne', fontWeight: 700 }}
                />
              )}
              {error && (
                <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>
              )}
              <button
                className="btn btn-primary btn-full mt-sm"
                onClick={mode === 'create' ? createRoom : joinRoom}
                disabled={loading}
              >
                {loading ? 'Chargement...' : mode === 'create' ? 'Créer la salle' : 'Rejoindre'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
