import { tagColor } from '../lib/time.js'

// Renders a description with its #tags as colored, clickable chips
export default function TagText({ text, onTagClick }) {
  if (!text) return <span className="muted">(説明なし)</span>
  const parts = text.split(/(#[\p{L}\p{N}_\-/]+)/u)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('#') ? (
          <button
            key={i}
            type="button"
            className="tag"
            style={{ '--tag': tagColor(part.toLowerCase()) }}
            onClick={() => onTagClick?.(part.toLowerCase())}
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}
