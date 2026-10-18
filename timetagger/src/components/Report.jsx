import { formatHM, tagColor } from '../lib/time.js'

export default function Report({ summary, tagFilter, onTagClick }) {
  const { total, rows } = summary
  const max = rows[0]?.seconds || 1

  return (
    <section className="card report">
      <div className="report-total">
        <span className="muted">合計</span>
        <strong>{formatHM(total)}</strong>
      </div>
      {rows.length === 0 && <p className="muted">データがありません</p>}
      {rows.map(({ tag, seconds }) => (
        <button
          key={tag}
          className={`report-row ${tagFilter.includes(tag) ? 'active' : ''}`}
          onClick={() => onTagClick(tag)}
          title="クリックで絞り込み"
        >
          <span className="report-tag" style={{ color: tagColor(tag) }}>
            {tag}
          </span>
          <span className="report-bar">
            <span style={{ width: `${(seconds / max) * 100}%`, background: tagColor(tag) }} />
          </span>
          <span className="report-val">{formatHM(seconds)}</span>
        </button>
      ))}
    </section>
  )
}
