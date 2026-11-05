#!/usr/bin/env node
/**
 * 重新生成 README 里的启动动画预览（docs/splash.gif）。
 *
 * 为什么是 GIF：GitHub 的 README 不执行脚本，Lottie JSON 在那边就是一坨文本，
 * 只有 GIF/PNG 这类位图会动。所以把 assets/launch.json 逐帧渲染出来再拼成 GIF。
 *
 * 依赖：本机 Chrome（用 CDP 驱动）+ ffmpeg（做调色板和压缩）。
 *
 *   node dev/make-preview.mjs
 */

import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const FPS = 20          // GIF 用 20fps 够看，体积也小
const HOLD_FRAMES = 12  // 末帧定格 600ms
const FRAMES_DIR = '/tmp/xthings-splash-frames'
const PAGE = '/tmp/xthings-splash-frames.html'

const lottie = await readFile(join(ROOT, 'assets/lottie.min.js'), 'utf8')
const data = await readFile(join(ROOT, 'assets/launch.json'), 'utf8')

await writeFile(PAGE, `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#fff}#box{width:800px;height:500px}</style>
<script>${lottie}</script></head><body><div id="box"></div>
<script>
const box = document.getElementById('box')
window.__a = lottie.loadAnimation({ container: box, renderer: 'svg', loop: false, autoplay: false, animationData: ${data} })
window.__seek = (frame) => { window.__a.goToAndStop(frame, true); return box.querySelectorAll('svg').length }
window.__ready = true
</script></body></html>`)

await rm(FRAMES_DIR, { recursive: true, force: true })
await mkdir(FRAMES_DIR, { recursive: true })

const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=9351', '--user-data-dir=/tmp/xthings-preview-profile',
  '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank',
], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let tab
for (let i = 0; i < 50; i++) {
  try {
    const list = await (await fetch('http://127.0.0.1:9351/json/list')).json()
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
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 560, deviceScaleFactor: 2, mobile: false })
await send('Page.navigate', { url: `file://${PAGE}` })
await sleep(2200)

const loaded = await send('Runtime.evaluate', { expression: 'window.__a && window.__a.isLoaded', returnByValue: true })
if (loaded.result.value !== true) throw new Error('Lottie 没加载起来（container 参数漏了？）')

const clip = { x: 0, y: 0, width: 800, height: 500, scale: 1 }
const shots = []
for (let frame = 0; frame < 180; frame += 60 / FPS) {
  await send('Runtime.evaluate', { expression: `window.__seek(${frame})`, returnByValue: true })
  const shot = await send('Page.captureScreenshot', { format: 'png', clip })
  shots.push(shot.data)
}
for (let i = 0; i < HOLD_FRAMES; i++) shots.push(shots.at(-1))

for (const [index, base64] of shots.entries()) {
  await writeFile(`${FRAMES_DIR}/f${String(index).padStart(3, '0')}.png`, Buffer.from(base64, 'base64'))
}
ws.close()
chrome.kill()

const gif = join(ROOT, 'docs/splash.gif')
await new Promise((resolve, reject) => {
  const ffmpeg = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(FPS), '-i', `${FRAMES_DIR}/f%03d.png`,
    '-vf', 'scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle',
    '-loop', '0', gif,
  ], { stdio: 'inherit' })
  ffmpeg.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg 退出码 ' + code))))
})

console.log(`✓ ${shots.length} 帧 → ${gif}（${(shots.length / FPS).toFixed(1)} 秒）`)
