// Record shape: { id, t1: ms, t2: ms | null (running), ds: string }

export const UNTAGGED = '#untagged'

const TAG_RE = /#[\p{L}\p{N}_\-/]+/gu

export function parseTags(ds) {
  const found = (ds || '').match(TAG_RE) || []
  return [...new Set(found.map((t) => t.toLowerCase()))]
}

export function tagsOrUntagged(ds) {
  const tags = parseTags(ds)
  return tags.length ? tags : [UNTAGGED]
}

export function tagColor(tag) {
  let h = 0
  for (const ch of tag) h = (h * 31 + ch.codePointAt(0)) >>> 0
  return `hsl(${h % 360}, 60%, 45%)`
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Duration formatting
export function formatClock(sec) {
  sec = Math.max(0, Math.floor(sec))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatHM(sec) {
  sec = Math.max(0, Math.round(sec))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function formatTime(ms) {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function formatDate(ms) {
  const d = new Date(ms)
  const wd = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} (${wd})`
}

// Value for <input type="datetime-local">
export function toLocalInput(ms) {
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function fromLocalInput(value) {
  const ms = new Date(value).getTime()
  return Number.isNaN(ms) ? null : ms
}

// Periods
export function startOfDay(ms) {
  const d = new Date(ms)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function periodRange(kind, anchor) {
  const d = new Date(startOfDay(anchor))
  if (kind === 'week') {
    const offset = (d.getDay() + 6) % 7 // Monday start
    d.setDate(d.getDate() - offset)
    const start = d.getTime()
    d.setDate(d.getDate() + 7)
    return [start, d.getTime()]
  }
  if (kind === 'month') {
    d.setDate(1)
    const start = d.getTime()
    d.setMonth(d.getMonth() + 1)
    return [start, d.getTime()]
  }
  const start = d.getTime()
  d.setDate(d.getDate() + 1)
  return [start, d.getTime()]
}

export function shiftAnchor(kind, anchor, step) {
  const d = new Date(anchor)
  if (kind === 'week') d.setDate(d.getDate() + 7 * step)
  else if (kind === 'month') {
    d.setDate(1)
    d.setMonth(d.getMonth() + step)
  } else d.setDate(d.getDate() + step)
  return d.getTime()
}

export function periodLabel(kind, anchor) {
  const [start, end] = periodRange(kind, anchor)
  const d = new Date(start)
  if (kind === 'month') return `${d.getFullYear()}年${d.getMonth() + 1}月`
  if (kind === 'week') return `${formatDate(start)} – ${formatDate(end - 1)}`
  return formatDate(start)
}

// Seconds of a record that fall inside [start, end)
export function overlapSeconds(rec, start, end, now) {
  const t2 = rec.t2 ?? now
  const a = Math.max(rec.t1, start)
  const b = Math.min(t2, end)
  return b > a ? (b - a) / 1000 : 0
}

export function recordsInRange(records, start, end, now) {
  return records.filter((r) => r.t1 < end && (r.t2 ?? now) > start)
}

export function matchesFilter(rec, tagFilter) {
  if (!tagFilter.length) return true
  const tags = tagsOrUntagged(rec.ds)
  return tagFilter.every((t) => tags.includes(t))
}

// Totals per tag. A record with several tags counts toward each of them,
// so the sum over tags can exceed the period total.
export function summarizeByTag(records, start, end, now) {
  const totals = new Map()
  let total = 0
  for (const r of records) {
    const sec = overlapSeconds(r, start, end, now)
    if (!sec) continue
    total += sec
    for (const t of tagsOrUntagged(r.ds)) totals.set(t, (totals.get(t) || 0) + sec)
  }
  const rows = [...totals.entries()]
    .map(([tag, seconds]) => ({ tag, seconds }))
    .sort((a, b) => b.seconds - a.seconds)
  return { total, rows }
}

// Group records by the local day they start on, newest first
export function groupByDay(records) {
  const groups = new Map()
  for (const r of [...records].sort((a, b) => b.t1 - a.t1)) {
    const key = startOfDay(r.t1)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(r)
  }
  return [...groups.entries()].map(([day, items]) => ({ day, items }))
}

function csvCell(v) {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCSV(records, now) {
  const header = ['start', 'end', 'duration_hours', 'tags', 'description']
  const lines = [...records]
    .sort((a, b) => a.t1 - b.t1)
    .map((r) => {
      const t2 = r.t2 ?? now
      return [
        new Date(r.t1).toISOString(),
        r.t2 == null ? '' : new Date(r.t2).toISOString(),
        ((t2 - r.t1) / 3600000).toFixed(2),
        parseTags(r.ds).join(' '),
        r.ds,
      ]
        .map(csvCell)
        .join(',')
    })
  return [header.join(','), ...lines].join('\n')
}
