import { useState } from 'react'

export default function NumberPicker({ range, onSubmit, disabled }) {
  const [selected, setSelected] = useState(null)
  const cols = range <= 10 ? 5 : range <= 20 ? 5 : range <= 30 ? 6 : range <= 50 ? 7 : 10

  const handleSubmit = () => {
    if (selected == null || disabled) return
    onSubmit(selected)
    setSelected(null)
  }

  return (
    <div>
      <div
        className="num-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: range }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={`num-btn ${selected === n ? 'selected' : ''}`}
            onClick={() => !disabled && setSelected(selected === n ? null : n)}
            disabled={disabled}
          >
            {n}
          </button>
        ))}
      </div>
      <button
        className="btn btn-primary btn-full mt-md"
        onClick={handleSubmit}
        disabled={selected == null || disabled}
      >
        {disabled ? 'En attente…' : `Confirmer le ${selected ?? '?'}`}
      </button>
    </div>
  )
}
