import { AVATAR_COLORS, calcParams } from '../lib/game'

export default function Scoreboard({ players, winScore }) {
  const MIN = -30
  const RANGE = winScore + 30

  return (
    <div>
      <div className="section-label">Scores</div>
      <div className="flex flex-col" style={{ gap: 10 }}>
        {players.map((p, i) => {
          const color = AVATAR_COLORS[p.color_index % AVATAR_COLORS.length]
          const pct = Math.max(0, Math.min(100, ((p.score - MIN) / RANGE) * 100))
          const barColor = p.score >= 0 ? '#4ade80' : '#f87171'
          const scoreColor = p.score >= winScore * 0.7 ? '#4ade80' : p.score <= -10 ? '#f87171' : 'var(--text)'

          return (
            <div
              key={p.id}
              className="player-row"
              style={{ opacity: p.eliminated ? 0.4 : 1, transition: 'opacity 0.3s' }}
            >
              <div
                className="avatar"
                style={{ background: color.bg, color: color.text }}
              >
                {p.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex justify-between items-center">
                  <span style={{ fontSize: 14, fontWeight: 500 }}>
                    {p.name}
                    {p.eliminated && (
                      <span className="tag tag-elim" style={{ marginLeft: 6, fontSize: 10 }}>éliminé</span>
                    )}
                    {!p.eliminated && p.online === false && (
                      <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text3)' }}>hors ligne</span>
                    )}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Syne', color: scoreColor }}>
                    {p.score > 0 ? '+' : ''}{p.score}
                  </span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
