#!/usr/bin/env node
/**
 * 把 design/ 里的六块画板拍成 README 用的预览图（docs/design/*.png）。
 * 画板改了之后重跑一次，别让 README 里的图和源文件说的不是一回事。
 *
 * 依赖：本机 Chrome（CDP 驱动），2 倍图，宽度按画板自己的 1280 设计宽度。
 *
 *   node dev/make-design-shots.mjs
 */

import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const SRC = join(ROOT, 'design/project')
const OUT = join(ROOT, 'docs/design')
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const BOARDS = [
  ['01-main', 'Main.dc.html'],
  ['02-plugins', 'Step2-plugins.dc.html'],
  ['03-done', 'Step3-done.dc.html'],
  ['04-brand', 'Brand.dc.html'],
  ['05-splash', 'Splash.dc.html'],
  ['06-install', 'InstallDialog.dc.html'],
]

await mkdir(OUT, { recursive: true })

const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=9353', '--user-data-dir=/tmp/xthings-shots-profile',
  '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let tab
for (let i = 0; i < 50; i++) {
  try {
    const list = await (await fetch('http://127.0.0.1:9353/json/list')).json()
    tab = list.find((item) => item.type === 'page')
    if (tab) break
  } catch {}
  await sleep(200)
}
if (!tab) throw new Error('Chrome 没起来')

const ws = new WebSocket(tab.webSocketDebuggerUrl)
await new Promise((r) => ws.addEventListener('open', r))
let id = 0
const pend = new Map()
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pend.has(message.id)) { pend.get(message.id)(message.result); pend.delete(message.id) }
})
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })

await send('Page.enable')
await send('Runtime.enable')

for (const [name, file] of BOARDS) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 2, mobile: false })
  await send('Page.navigate', { url: `file://${SRC}/${file}` })
  await sleep(1200)
  const metrics = await send('Runtime.evaluate', {
    expression: `(() => { const el = document.querySelector('x-dc > div'); const r = el.getBoundingClientRect(); return { w: Math.ceil(r.width), h: Math.ceil(r.height) } })()`,
    returnByValue: true,
  })
  const { w, h } = metrics.result.value
  const shot = await send('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: h, scale: 1 },
  })
  await writeFile(`${OUT}/${name}.png`, Buffer.from(shot.data, 'base64'))
  console.log(`✓ ${name}.png ${w * 2}×${h * 2}`)
}

ws.close()
chrome.kill()
