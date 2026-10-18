const KEY = 'timetagger.records.v1'

export function loadRecords() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(data) ? data.filter(isValidRecord) : []
  } catch {
    return []
  }
}

export function saveRecords(records) {
  try {
    localStorage.setItem(KEY, JSON.stringify(records))
  } catch {
    // Storage unavailable (private mode, quota); keep working in memory
  }
}

export function isValidRecord(r) {
  return (
    r &&
    typeof r.id === 'string' &&
    typeof r.t1 === 'number' &&
    (r.t2 === null || (typeof r.t2 === 'number' && r.t2 >= r.t1)) &&
    typeof r.ds === 'string'
  )
}

export function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
