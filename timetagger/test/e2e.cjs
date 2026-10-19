// End-to-end check of timetagger.html in Chromium over file://.
// Native file pickers can't be driven headlessly, so they are replaced by an in-memory fake handle.
// Run: NODE_PATH=$(npm root -g) node test/e2e.cjs
const { chromium } = require('playwright')
const path = require('path')
const assert = require('assert/strict')

const URL = 'file://' + path.resolve(__dirname, '../timetagger.html')

const FAKE_FS = (initial) => {
  window.__file = { content: initial, lastModified: 1, locked: false }
  const handle = {
    name: 'log.csv',
    queryPermission: async () => 'granted',
    requestPermission: async () => 'granted',
    getFile: async () => {
      const f = new File([window.__file.content], 'log.csv')
      Object.defineProperty(f, 'lastModified', { value: window.__file.lastModified })
      return f
    },
    createWritable: async () => {
      if (window.__file.locked) throw new DOMException('locked', 'NoModificationAllowedError')
      let buf = ''
      return {
        write: async (s) => { buf += s },
        close: async () => { window.__file.content = buf; window.__file.lastModified++ },
      }
    },
  }
  window.showOpenFilePicker = async () => [handle]
  window.showSaveFilePicker = async () => handle
}

const csv = (page) => page.evaluate(() => window.__file.content)
const H = 3600000

;(async () => {
  const browser = await chromium.launch()
  const errors = []
  const newPage = async (init, arg) => {
    const ctx = await browser.newContext({ acceptDownloads: true })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('dialog', (d) => d.accept())
    if (init) await page.addInitScript(init, arg)
    await page.goto(URL)
    return page
  }

  // 1. New CSV, timer start/stop, tags written to file
  {
    const page = await newPage(FAKE_FS, '')
    await page.click('#stNew')
    await page.waitForFunction(() => window.__file.content.startsWith('\uFEFFid,start'))
    await page.fill('#timerInput', '資料作成 #仕事 #projA')
    await page.press('#timerInput', 'Enter')
    await page.waitForSelector('.timer.running')
    await page.fill('#timerInput', '資料作成, "最終版" #仕事 #projA')
    await page.waitForTimeout(1200)
    await page.click('#btnStop')
    await page.waitForFunction(() => window.__file.content.includes(',0.00,'))
    const lines = (await csv(page)).split('\r\n')
    assert.equal(lines[0], '\uFEFFid,start,end,duration_hours,tags,description')
    assert.match(lines[1], /^\w+,\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,\d{4}-\d\d-\d\d \d\d:\d\d:\d\d,0\.00,#仕事 #proja,"資料作成, ""最終版"" #仕事 #projA"$/)
    assert.match(await page.textContent('#fileStatus'), /log\.csv に保存済み/)
    console.log('ok   new file + timer writes CSV')

    // Manual record via editor
    await page.click('#btnAdd')
    await page.fill('#edDs', '会議 #仕事')
    await page.click('#editorForm button[type=submit]')
    await page.waitForFunction(() => window.__file.content.includes('会議 #仕事'))
    assert.match(await page.textContent('#report'), /#仕事.*1h 00m/s)
    console.log('ok   manual add via editor, report totals')

    // Tag filter
    await page.click('#report [data-tag="#proja"]')
    assert.equal(await page.locator('.record').count(), 1)
    await page.click('#btnClearFilter')
    assert.equal(await page.locator('.record').count(), 2)
    console.log('ok   tag filter')

    // Locked file (e.g. open in Excel) -> error + retry
    await page.evaluate(() => (window.__file.locked = true))
    await page.click('[data-act="resume"] >> nth=0')
    await page.waitForSelector('#fileStatus.error')
    await page.evaluate(() => (window.__file.locked = false))
    await page.click('#btnRetry')
    await page.waitForFunction(() => window.__file.content.split('\r\n').length === 5)
    assert.match(await page.textContent('#fileStatus'), /保存済み/)
    console.log('ok   write failure shows retry, retry saves')
  }

  // 2. Open existing CSV written by Excel (slash dates, no seconds, no id, a running row)
  {
    const d = new Date()
    const ymd = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    const text = `id,start,end,duration_hours,tags,description\r\n,${ymd} 9:00,${ymd} 10:30,1.5,#a,"作業 #a"\r\n,${ymd} 11:00,,,,実行中 #b\r\n`
    const page = await newPage(FAKE_FS, text)
    await page.click('#stOpen')
    await page.waitForSelector('.timer.running')
    assert.equal(await page.inputValue('#timerInput'), '実行中 #b')
    assert.match(await page.textContent('#report'), /#a\s*1h 30m/)
    assert.equal(await page.locator('.record').count(), 2)
    console.log('ok   reads Excel-style CSV, resumes running record')
  }

  // 3. Browser without File System Access API: load + download
  {
    const page = await newPage(() => { delete window.showOpenFilePicker; delete window.showSaveFilePicker })
    assert.equal(await page.isVisible('#startNoFs'), true)
    await page.setInputFiles('#fileInput', {
      name: 'old.csv', mimeType: 'text/csv',
      buffer: Buffer.from('id,start,end,description\nx1,2026-01-05 09:00:00,2026-01-05 12:00:00,#old\n'),
    })
    await page.waitForSelector('#startScreen', { state: 'hidden' })
    await page.fill('#timerInput', 'テスト #new')
    await page.press('#timerInput', 'Enter')
    assert.match(await page.textContent('#fileStatus'), /未保存/)
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#btnDownload')])
    assert.equal(dl.suggestedFilename(), 'old.csv')
    const body = require('fs').readFileSync(await dl.path(), 'utf8')
    assert.match(body, /x1,2026-01-05 09:00:00,2026-01-05 12:00:00,3\.00,#old,#old/)
    assert.match(body, /テスト #new/)
    console.log('ok   fallback mode: load CSV, download CSV')

    // Reload: data kept in browser storage
    await page.reload()
    await page.click('#stLocal')
    assert.equal(await page.isVisible('.timer.running'), true)
    console.log('ok   fallback mode survives reload')
  }

  await browser.close()
  assert.deepEqual(errors, [])
  console.log('all passed, no page errors')
})().catch((e) => { console.error(e); process.exit(1) })
