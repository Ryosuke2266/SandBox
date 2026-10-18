import { useState } from 'react'
import { fromLocalInput, toLocalInput } from '../lib/time.js'

export default function RecordEditor({ record, now, onSave, onDelete, onClose }) {
  const isNew = !record.id
  const [ds, setDs] = useState(record.ds)
  const [t1, setT1] = useState(toLocalInput(record.t1))
  const [t2, setT2] = useState(toLocalInput(record.t2 ?? now))
  const [running, setRunning] = useState(record.t2 == null)
  const [error, setError] = useState('')

  const save = (e) => {
    e.preventDefault()
    const start = fromLocalInput(t1)
    const end = running ? null : fromLocalInput(t2)
    if (start == null || (!running && end == null)) return setError('日時を正しく入力してください')
    if (!running && end <= start) return setError('終了は開始より後にしてください')
    if (running && start > now) return setError('実行中の記録は未来に開始できません')
    onSave({ ...record, ds: ds.trim(), t1: start, t2: end })
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal card" onSubmit={save}>
        <h2>{isNew ? '記録を追加' : '記録を編集'}</h2>
        <label>
          説明
          <input value={ds} onChange={(e) => setDs(e.target.value)} placeholder="作業内容 #タグ" autoFocus />
        </label>
        <label>
          開始
          <input type="datetime-local" value={t1} onChange={(e) => setT1(e.target.value)} required />
        </label>
        <label>
          終了
          <input
            type="datetime-local"
            value={t2}
            onChange={(e) => setT2(e.target.value)}
            disabled={running}
          />
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={running} onChange={(e) => setRunning(e.target.checked)} />
          実行中（終了時刻なし）
        </label>
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          {!isNew && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => confirm('この記録を削除しますか？') && onDelete(record.id)}
            >
              削除
            </button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            キャンセル
          </button>
          <button type="submit" className="btn btn-primary">
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
