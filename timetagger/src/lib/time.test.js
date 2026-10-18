import { describe, expect, it } from 'vitest'
import { UNTAGGED, overlapSeconds, parseTags, periodRange, recordsInRange, summarizeByTag, toCSV } from './time.js'

const H = 3600000

describe('parseTags', () => {
  it('extracts unique lowercase tags including Japanese', () => {
    expect(parseTags('会議 #Work #仕事 #work, #proj/a')).toEqual(['#work', '#仕事', '#proj/a'])
  })
  it('returns empty for no tags', () => {
    expect(parseTags('nothing here')).toEqual([])
  })
})

describe('periodRange', () => {
  it('week starts on Monday', () => {
    const wed = new Date(2026, 9, 14, 15).getTime() // Wed Oct 14 2026
    const [s, e] = periodRange('week', wed)
    expect(new Date(s).getDay()).toBe(1)
    expect(new Date(s).getDate()).toBe(12)
    expect(new Date(e).getDate()).toBe(19)
  })
  it('month covers whole month', () => {
    const [s, e] = periodRange('month', new Date(2026, 1, 10).getTime())
    expect(new Date(s).getDate()).toBe(1)
    expect(new Date(e).getMonth()).toBe(2)
  })
})

describe('overlap & summary', () => {
  const base = new Date(2026, 9, 18, 0).getTime()
  const records = [
    { id: 'a', t1: base + 9 * H, t2: base + 11 * H, ds: '開発 #work #projA' },
    { id: 'b', t1: base + 23 * H, t2: base + 25 * H, ds: '夜更かし' }, // crosses midnight
    { id: 'c', t1: base + 13 * H, t2: null, ds: '#work' }, // running
  ]
  const [s, e] = periodRange('day', base)
  const now = base + 14 * H

  it('clips to the range and counts running records up to now', () => {
    expect(overlapSeconds(records[1], s, e, now)).toBe(3600)
    expect(overlapSeconds(records[2], s, e, now)).toBe(3600)
  })

  it('totals per tag, untagged bucket', () => {
    const { total, rows } = summarizeByTag(records, s, e, now)
    expect(total).toBe(4 * 3600)
    expect(rows).toEqual([
      { tag: '#work', seconds: 3 * 3600 },
      { tag: '#proja', seconds: 2 * 3600 },
      { tag: UNTAGGED, seconds: 3600 },
    ])
  })

  it('filters records in range', () => {
    const [ns, ne] = periodRange('day', base + 24 * H)
    expect(recordsInRange(records, ns, ne, now).map((r) => r.id)).toEqual(['b'])
  })

  it('exports CSV with escaping', () => {
    const csv = toCSV([{ id: 'x', t1: base, t2: base + H, ds: 'a, "b" #t' }], now)
    expect(csv.split('\n')[1]).toMatch(/,1\.00,#t,"a, ""b"" #t"$/)
  })
})
