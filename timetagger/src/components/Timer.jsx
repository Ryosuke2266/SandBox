import { useState } from 'react'
import { formatClock } from '../lib/time.js'
import TagText from './TagText.jsx'

export default function Timer({ running, now, recentTags, onStart, onStop, onUpdateRunning }) {
  const [ds, setDs] = useState('')

  if (running) {
    return (
      <section className="card timer running">
        <div className="timer-main">
          <div className="timer-clock">{formatClock((now - running.t1) / 1000)}</div>
          <input
            className="timer-input"
            value={running.ds}
            placeholder="作業内容 #タグ"
            onChange={(e) => onUpdateRunning(e.target.value)}
          />
          <button className="btn btn-stop" onClick={onStop}>
            ■ 停止
          </button>
        </div>
        <div className="timer-preview">
          <TagText text={running.ds} />
        </div>
      </section>
    )
  }

  const start = (e) => {
    e.preventDefault()
    onStart(ds.trim())
    setDs('')
  }

  const addTag = (tag) => setDs((cur) => (cur.includes(tag) ? cur : `${cur.trim()} ${tag}`.trim()))

  return (
    <section className="card timer">
      <form className="timer-main" onSubmit={start}>
        <div className="timer-clock muted">0:00:00</div>
        <input
          className="timer-input"
          value={ds}
          placeholder="何をしますか？ 例: 資料作成 #仕事 #projectA"
          onChange={(e) => setDs(e.target.value)}
          autoFocus
        />
        <button className="btn btn-start" type="submit">
          ▶ 開始
        </button>
      </form>
      {recentTags.length > 0 && (
        <div className="tag-suggest">
          {recentTags.map((t) => (
            <TagText key={t} text={t} onTagClick={addTag} />
          ))}
        </div>
      )}
    </section>
  )
}
