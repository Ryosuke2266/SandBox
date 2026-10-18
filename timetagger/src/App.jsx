import { useEffect, useMemo, useRef, useState } from 'react'
import Timer from './components/Timer.jsx'
import RecordList from './components/RecordList.jsx'
import RecordEditor from './components/RecordEditor.jsx'
import Report from './components/Report.jsx'
import TagText from './components/TagText.jsx'
import {
  matchesFilter,
  newId,
  parseTags,
  periodLabel,
  periodRange,
  recordsInRange,
  shiftAnchor,
  summarizeByTag,
  toCSV,
} from './lib/time.js'
import { downloadFile, isValidRecord, loadRecords, saveRecords } from './lib/storage.js'
import './App.css'

const PERIODS = [
  ['day', '日'],
  ['week', '週'],
  ['month', '月'],
]

function useNow(intervalMs) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export default function App() {
  const [records, setRecords] = useState(loadRecords)
  const [period, setPeriod] = useState('week')
  const [anchor, setAnchor] = useState(Date.now())
  const [tagFilter, setTagFilter] = useState([])
  const [editing, setEditing] = useState(null)
  const fileInput = useRef(null)

  const running = records.find((r) => r.t2 == null)
  const now = useNow(running ? 1000 : 30000)

  useEffect(() => saveRecords(records), [records])

  // Reflect the running timer in the tab title
  useEffect(() => {
    document.title = running ? `▶ ${running.ds || '計測中'} - TimeTagger` : 'TimeTagger'
  }, [running])

  const [start, end] = periodRange(period, anchor)
  const visible = useMemo(
    () => recordsInRange(records, start, end, now).filter((r) => matchesFilter(r, tagFilter)),
    [records, start, end, now, tagFilter],
  )
  const summary = useMemo(() => summarizeByTag(visible, start, end, now), [visible, start, end, now])

  const recentTags = useMemo(() => {
    const seen = []
    for (const r of [...records].sort((a, b) => b.t1 - a.t1)) {
      for (const t of parseTags(r.ds)) if (!seen.includes(t)) seen.push(t)
      if (seen.length >= 10) break
    }
    return seen.slice(0, 10)
  }, [records])

  const stopRunning = (list, at) => list.map((r) => (r.t2 == null ? { ...r, t2: Math.max(at, r.t1) } : r))

  const startTimer = (ds) => {
    const at = Date.now()
    setRecords((list) => [...stopRunning(list, at), { id: newId(), t1: at, t2: null, ds }])
  }

  const stopTimer = () => setRecords((list) => stopRunning(list, Date.now()))

  const updateRunning = (ds) => setRecords((list) => list.map((r) => (r.t2 == null ? { ...r, ds } : r)))

  const saveRecord = (rec) => {
    setRecords((list) => {
      // Only one record may be running at a time
      let next = rec.t2 == null ? stopRunning(list.filter((r) => r.id !== rec.id), Date.now()) : list
      if (!rec.id) return [...next, { ...rec, id: newId() }]
      if (rec.t2 == null) return [...next, rec]
      return next.map((r) => (r.id === rec.id ? rec : r))
    })
    setEditing(null)
  }

  const deleteRecord = (id) => {
    setRecords((list) => list.filter((r) => r.id !== id))
    setEditing(null)
  }

  const toggleTag = (tag) =>
    setTagFilter((cur) => (cur.includes(tag) ? cur.filter((t) => t !== tag) : [...cur, tag]))

  const exportCSV = () => downloadFile(`timetagger-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(visible, now), 'text/csv')

  const exportJSON = () =>
    downloadFile(`timetagger-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(records, null, 2), 'application/json')

  const importJSON = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const incoming = (Array.isArray(data) ? data : []).filter(isValidRecord)
      if (!incoming.length) return alert('有効な記録が見つかりませんでした')
      setRecords((list) => {
        const byId = new Map(list.map((r) => [r.id, r]))
        for (const r of incoming) byId.set(r.id, r)
        // Keep at most one running record after merge (the latest one)
        const merged = [...byId.values()]
        const runningOnes = merged.filter((r) => r.t2 == null).sort((a, b) => b.t1 - a.t1)
        const at = Date.now()
        return merged.map((r) => (r.t2 == null && r !== runningOnes[0] ? { ...r, t2: Math.max(at, r.t1) } : r))
      })
      alert(`${incoming.length} 件の記録を読み込みました`)
    } catch {
      alert('JSON ファイルを読み込めませんでした')
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span className="logo">⏱</span> TimeTagger
        </h1>
        <div className="header-actions">
          <button className="btn" onClick={() => setEditing({ id: null, t1: Date.now() - 3600000, t2: Date.now(), ds: '' })}>
            ＋ 手動で追加
          </button>
          <button className="btn" onClick={exportCSV} title="表示中の期間をCSV出力">
            CSV
          </button>
          <button className="btn" onClick={exportJSON} title="全データをバックアップ">
            バックアップ
          </button>
          <button className="btn" onClick={() => fileInput.current.click()} title="バックアップから復元">
            復元
          </button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={importJSON} />
        </div>
      </header>

      <Timer
        key={running?.id ?? 'idle'}
        running={running}
        now={now}
        recentTags={recentTags}
        onStart={startTimer}
        onStop={stopTimer}
        onUpdateRunning={updateRunning}
      />

      <nav className="period-nav card">
        <div className="segmented">
          {PERIODS.map(([k, label]) => (
            <button key={k} className={period === k ? 'active' : ''} onClick={() => setPeriod(k)}>
              {label}
            </button>
          ))}
        </div>
        <div className="period-step">
          <button className="icon-btn" onClick={() => setAnchor((a) => shiftAnchor(period, a, -1))}>
            ‹
          </button>
          <span className="period-label">{periodLabel(period, anchor)}</span>
          <button className="icon-btn" onClick={() => setAnchor((a) => shiftAnchor(period, a, 1))}>
            ›
          </button>
          <button className="btn btn-small" onClick={() => setAnchor(Date.now())}>
            今日
          </button>
        </div>
      </nav>

      {tagFilter.length > 0 && (
        <div className="filter-bar">
          <span className="muted">絞り込み:</span>
          {tagFilter.map((t) => (
            <TagText key={t} text={t} onTagClick={toggleTag} />
          ))}
          <button className="btn btn-small" onClick={() => setTagFilter([])}>
            解除
          </button>
        </div>
      )}

      <main className="layout">
        <Report summary={summary} tagFilter={tagFilter} onTagClick={toggleTag} />
        <RecordList records={visible} now={now} onEdit={setEditing} onResume={startTimer} onTagClick={toggleTag} />
      </main>

      {editing && (
        <RecordEditor
          record={editing}
          now={now}
          onSave={saveRecord}
          onDelete={deleteRecord}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
