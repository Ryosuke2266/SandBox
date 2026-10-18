import { formatDate, formatHM, formatTime, groupByDay, overlapSeconds, periodRange } from '../lib/time.js'
import TagText from './TagText.jsx'

export default function RecordList({ records, now, onEdit, onResume, onTagClick }) {
  if (!records.length) {
    return <p className="card empty">この期間の記録はありません。</p>
  }

  return (
    <section className="record-list">
      {groupByDay(records).map(({ day, items }) => {
        const [start, end] = periodRange('day', day)
        const dayTotal = items.reduce((sum, r) => sum + overlapSeconds(r, start, end, now), 0)
        return (
          <div key={day} className="card day">
            <div className="day-header">
              <span>{formatDate(day)}</span>
              <span className="muted">{formatHM(dayTotal)}</span>
            </div>
            {items.map((r) => (
              <div key={r.id} className={`record ${r.t2 == null ? 'is-running' : ''}`}>
                <div className="record-time">
                  {formatTime(r.t1)} – {r.t2 == null ? '実行中' : formatTime(r.t2)}
                </div>
                <div className="record-ds">
                  <TagText text={r.ds} onTagClick={onTagClick} />
                </div>
                <div className="record-dur">{formatHM(((r.t2 ?? now) - r.t1) / 1000)}</div>
                <div className="record-actions">
                  {r.t2 != null && (
                    <button className="icon-btn" title="同じ内容で再開" onClick={() => onResume(r.ds)}>
                      ▶
                    </button>
                  )}
                  <button className="icon-btn" title="編集" onClick={() => onEdit(r)}>
                    ✎
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </section>
  )
}
