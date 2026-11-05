#!/usr/bin/env node
/**
 * 设计画布自检。画布是 6 个 .dc.html + 一份 canvas.json，最容易坏的地方是
 * "canvas.json 里登记了，文件却没跟着提交"，以及相对路径写错。
 *
 *   node dev/check-design.mjs
 */

import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = new URL('../design/', import.meta.url).pathname
const PROJECT = join(ROOT, 'project')

const problems = []
const fail = (message) => problems.push(message)

let canvas
try {
  canvas = JSON.parse(await readFile(join(PROJECT, 'canvas.json'), 'utf8'))
} catch (error) {
  console.error(`✗ canvas.json 读不到或解析失败：${error.message}`)
  process.exit(1)
}

if (!canvas.boards || typeof canvas.boards !== 'object') fail('canvas.json 缺 boards')
if (!Array.isArray(canvas.order)) fail('canvas.json 缺 order')

const boards = Object.keys(canvas.boards ?? {})
if (boards.length === 0) fail('boards 是空的')

for (const name of boards) {
  const path = join(PROJECT, name)
  try {
    const info = await stat(path)
    if (!info.isFile()) fail(`${name} 不是文件`)
    if (info.size < 500) fail(`${name} 只有 ${info.size} 字节，像是空壳`)
    const html = await readFile(path, 'utf8')
    if (!html.trimStart().startsWith('<!doctype')) fail(`${name} 不是完整 HTML`)
    if (!html.includes('</html>')) fail(`${name} 没有 </html>`)
  } catch {
    fail(`${name} 在 canvas.json 里登记了，但 project/ 下没有这个文件`)
  }
}

for (const name of canvas.order ?? []) {
  if (!boards.includes(name)) fail(`order 里的 ${name} 不在 boards 里`)
}

const registered = new Set(canvas.order ?? [])
for (const name of boards) {
  if (!registered.has(name)) fail(`${name} 没进 order，画布里看不到它`)
}

if (problems.length) {
  console.error(`✗ ${problems.length} 个问题：`)
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(`✓ ${boards.length} 块画板都在，顺序和登记一致`)
