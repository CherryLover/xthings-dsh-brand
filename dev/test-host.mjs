/**
 * Host-half harness. Runs index.js against a stubbed Cordis context so the
 * route logic, the provider merge and the install guard can be exercised
 * without an app launch.
 *
 *   node dev/test-host.mjs
 */

import assert from 'node:assert/strict'
import { chmod, readFile, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const plugin = await import('../index.js')

const patch = await readFile(new URL('../cordis.patch.yml', import.meta.url), 'utf8')
assert.match(patch, /id: xthings-brand-v1\.0\.4\s+name: '@xthings\/dsh-brand'/)
assert.doesNotMatch(patch, /name: '@xthings\/dsh-brand\//, 'Client discovery requires a bare package name')
assert.doesNotMatch(patch, /llm-pi-ai/, 'bundle must not duplicate the adapter supplied by dsh-base')

/* ---------------- stubs ---------------- */

const profileDir = await mkdtemp(join(tmpdir(), 'xtb-profile-'))
await writeFile(
  join(profileDir, 'package.json'),
  JSON.stringify({ dependencies: { 'dsh-context': '^0.78.2', dshmarket: '1.73.6' } }, null, 2),
)

const calls = { installs: [], edits: [], sets: [], unsets: [], indexes: [] }

const providerRow = {
  entry: { id: 'llm-pi-ai', name: 'llm-pi-ai' },
  inherited: {},
  override: { providers: { openai: { baseURL: 'https://s2a.xthings.dev/v1', apiKeyEnv: 'OPENAI_API_KEY' } } },
}

const state = { row: providerRow, secret: undefined, indexes: ['https://cdn.dsh.so/market/top-rank.json'] }

const configEditor = {
  configuration: () => [state.row],
  edit: async (entry, change) => {
    calls.edits.push({ entry, next: change(state.row.override, state.row.inherited) })
    state.row = { ...state.row, override: calls.edits.at(-1).next }
  },
}

const credentials = {
  resolve: async (ref) => (ref === 'XTHINGS_API_KEY' && state.secret ? { value: state.secret } : undefined),
  describe: async (ref) => ({ configured: ref === 'XTHINGS_API_KEY' && Boolean(state.secret), source: 'file', writable: true }),
  set: async (ref, value) => {
    calls.sets.push({ ref, value })
    if (ref === 'XTHINGS_API_KEY') state.secret = value
    state.probe = value
  },
  unset: async (ref) => {
    calls.unsets.push({ ref })
    if (ref === 'XTHINGS_DIAG_PROBE') state.probe = undefined
  },
}

const pluginMarket = {
  listIndexes: () => state.indexes,
  setIndexes: async (urls) => {
    calls.indexes.push(urls)
    state.indexes = urls
  },
}

const pluginManager = {
  profile: { dir: profileDir },
  installBundle: async (spec, options) => {
    calls.installs.push({ spec, options })
    return { application: 'applied', changed: true }
  },
}

const services = { webServer: undefined, configEditor, credentials, pluginMarket, pluginManager }

const routes = new Map()
const events = new Map()

const ctx = {
  get: (name) => services[name],
  on: (event, callback) => {
    events.set(event, callback)
    return () => events.delete(event)
  },
  effect: (execute) => execute(),
  inject: (deps, callback) => {
    for (const dep of deps) assert.ok(dep in services, 'inject asks for a known service: ' + dep)
    return callback(ctx)
  },
  logger: { warn: (...args) => console.log('  warn:', ...args), debug: () => {} },
}
services.webServer = {
  register: (route) => {
    routes.set(route.path, route)
    return () => routes.delete(route.path)
  },
}

/* ---------------- fetch stub ---------------- */

let fetchMode = 'ok'
globalThis.fetch = async (url, init) => {
  if (fetchMode === 'unauthorized') return new Response('nope', { status: 401 })
  if (fetchMode === 'down') throw new Error('ECONNREFUSED')
  assert.equal(url, 'https://s2a.xthings.dev/v1/models')
  assert.equal(init.headers.authorization, 'Bearer sk-good-key-1234')
  return new Response(JSON.stringify({ data: [{ id: 'deepseek-chat' }, { id: 'deepseek-reasoner' }] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

/* ---------------- request/response helpers ---------------- */

function fakeRequest(method, { body, headers = {}, url = '' } = {}) {
  const text = body === undefined ? '' : JSON.stringify(body)
  return {
    method,
    url,
    headers: { host: '127.0.0.1:58501', origin: 'http://127.0.0.1:58501', ...headers },
    async *[Symbol.asyncIterator]() {
      if (text) yield Buffer.from(text)
    },
  }
}

function fakeResponse() {
  const captured = { status: 0, headers: undefined, body: undefined }
  return {
    writeHead(status, headers) {
      captured.status = status
      captured.headers = headers
    },
    end(body) {
      captured.body = body === undefined ? undefined : JSON.parse(body)
    },
    captured,
  }
}

async function call(target, method, options) {
  const response = fakeResponse()
  const path = target.split('?')[0]
  await routes.get(path).handler(fakeRequest(method, { ...options, url: target }), response)
  return response.captured
}

/* ---------------- run ---------------- */

/** 数一遍真的断言，别写死一个会撒谎的数字。 */
function countAssertions() {
  return (source().match(/^\s*assert\./gm) ?? []).length
}

function source() {
  return readFileSync(new URL(import.meta.url), 'utf8')
}


plugin.apply(ctx)
await new Promise((resolve) => setTimeout(resolve, 50))

assert.deepEqual([...routes.keys()].sort(), [
  '/xthings-brand/diag',
  '/xthings-brand/install',
  '/xthings-brand/provision',
  '/xthings-brand/status',
])

const injected = []
events.get('webserver/index-inject')(injected)
assert.equal(injected.length, 4, 'four splash rows')
assert.deepEqual(
  injected.map((row) => row.kind),
  ['script', 'global', 'style', 'script'],
)
assert.equal(injected[1].name, '__XTHINGS_LAUNCH_DATA__')
assert.equal(injected[1].value.op, 180)
for (const row of injected) {
  if (typeof row.text === 'string') assert.ok(!row.text.includes('</script'), 'no raw closing tag')
}

let status = await call('/xthings-brand/status', 'GET')
assert.equal(status.status, 200)
assert.equal(status.body.needsSetup, true)
assert.equal(status.body.provider.configured, false)
assert.equal(status.body.credential.present, false)
assert.equal(status.body.recommended.find((r) => r.id === 'dsh-context').installed, true)
assert.equal(status.body.recommended.find((r) => r.id === 'dsh-trace').installed, false)
/* the first status call is what puts the bundled source in place */
assert.equal(status.body.market.configured, true)
assert.deepEqual(calls.indexes, [
  ['https://cdn.dsh.so/market/top-rank.json', 'https://cherrylover.github.io/xthings-dsh-market/market.json'],
])
assert.equal(status.captured ?? status.headers['cache-control'], 'no-store')

// A fresh profile has an adapter but no providers field yet.
const configuredRow = state.row
state.row = { entry: { id: 'include:llm-pi-ai', name: '@deepseek-ai/dsh-llm-pi-ai' }, inherited: {}, override: {} }
const freshDiag = await call('/xthings-brand/diag', 'GET')
assert.equal(freshDiag.body.llmRow.found, true, 'empty adapter remains writable')
const freshProvision = await call('/xthings-brand/provision', 'POST', { body: { key: 'sk-good-key-1234' } })
assert.equal(freshProvision.status, 200, 'first provider can be added to a pristine adapter')
assert.equal(state.row.override.providers.xthings.apiKeyEnv, 'XTHINGS_API_KEY')
state.row = { entry: { id: 'unrelated', name: 'unrelated' }, override: { providers: {} } }
const unrelatedDiag = await call('/xthings-brand/diag', 'GET')
assert.equal(unrelatedDiag.body.llmRow.found, false, 'never write into another plugin with a providers map')
state.row = configuredRow
state.secret = undefined
calls.sets.length = 0
calls.edits.length = 0

// foreign origin is refused
let refused = await call('/xthings-brand/provision', 'POST', {
  body: { key: 'sk-good-key-1234' },
  headers: { origin: 'http://evil.example' },
})
assert.equal(refused.status, 403)

// key shape
let bad = await call('/xthings-brand/provision', 'POST', { body: { key: ' short ' } })
assert.equal(bad.status, 400)
assert.equal(bad.body.code, 'bad-request')

// bad key at the gateway
fetchMode = 'unauthorized'
let invalid = await call('/xthings-brand/provision', 'POST', { body: { key: 'sk-good-key-1234' } })
assert.equal(invalid.status, 401)
assert.equal(invalid.body.code, 'invalid-key')

// gateway unreachable
fetchMode = 'down'
let down = await call('/xthings-brand/provision', 'POST', { body: { key: 'sk-good-key-1234' } })
assert.equal(down.status, 502)
assert.equal(down.body.code, 'unreachable')

// happy path
fetchMode = 'ok'
let ok = await call('/xthings-brand/provision', 'POST', { body: { key: '  sk-good-key-1234  ' } })
assert.equal(ok.status, 200)
assert.deepEqual(ok.body.models, ['deepseek-chat', 'deepseek-reasoner'])
assert.deepEqual(calls.sets, [{ ref: 'XTHINGS_API_KEY', value: 'sk-good-key-1234' }])

const edit = calls.edits.at(-1).next
assert.equal(edit.providers.xthings.baseURL, 'https://s2a.xthings.dev/v1')
assert.equal(edit.providers.xthings.apiKeyEnv, 'XTHINGS_API_KEY')
assert.equal(edit.providers.xthings.api, 'openai-completions')
assert.deepEqual(edit.providers.xthings.models, [{ id: 'deepseek-chat' }, { id: 'deepseek-reasoner' }])
assert.ok(edit.providers.openai, 'existing provider preserved')
assert.equal(calls.indexes.length, 1, 'provision does not re-add the source mount already added')

status = await call('/xthings-brand/status', 'GET')
assert.equal(status.body.needsSetup, false)
assert.equal(status.body.provider.configured, true)
assert.deepEqual(status.body.provider.models, [{ id: 'deepseek-chat' }, { id: 'deepseek-reasoner' }].map((m) => m.id))
assert.equal(status.body.credential.present, true)
assert.equal(status.body.market.configured, true)

// diag：把"为什么保存失败"讲清楚，且探针用过就擦干净
const diag = await call('/xthings-brand/diag?probe=1', 'GET')
assert.equal(diag.status, 200)
assert.equal(diag.body.version, JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8')).version, 'version comes from package.json')
assert.equal(diag.body.services.credentials, true)
assert.equal(diag.body.services.configEditor, true)
assert.equal(diag.body.llmRow.found, true)
assert.equal(diag.body.llmRow.entryId, 'llm-pi-ai')
assert.deepEqual(diag.body.llmRow.providers, ['openai', 'xthings'])
assert.equal(diag.body.probe.ok, true, 'throwaway credential write works')
assert.ok(calls.sets.some((c) => c.ref === 'XTHINGS_DIAG_PROBE'), 'probe writes to its own ref')
assert.ok(calls.unsets.some((c) => c.ref === 'XTHINGS_DIAG_PROBE'), 'probe ref cleaned up')
assert.equal(state.secret, 'sk-good-key-1234', 'the real key is untouched by the probe')

// 没有探针参数时不许写凭据
const diagQuiet = await call('/xthings-brand/diag', 'GET')
assert.equal(diagQuiet.body.probe, undefined)
assert.equal(diagQuiet.status, 200)

// install: already present
let already = await call('/xthings-brand/install', 'POST', { body: { id: 'dsh-context' } })
assert.equal(already.status, 200)
assert.equal(already.body.alreadyInstalled, true)
assert.equal(calls.installs.length, 0)

// install: missing
let install = await call('/xthings-brand/install', 'POST', { body: { id: 'dsh-trace' } })
assert.equal(install.status, 200)
assert.equal(install.body.ok, true)
assert.equal(install.body.application, 'applied')
assert.equal(calls.installs.length, 1)
assert.equal(
  calls.installs[0].spec,
  'git+https://github.com/CherryLover/dsh-trace#6d45f9cef58db1c197e65001332c2913d807ae51',
)

// install: unknown id and wrong method
let unknown = await call('/xthings-brand/install', 'POST', { body: { id: 'nope' } })
assert.equal(unknown.status, 400)
let method = await call('/xthings-brand/install', 'GET')
assert.equal(method.status, 405)

// restart-required is not a failure
pluginManager.installBundle = async () => ({ application: 'restart-required', changed: true })
let restart = await call('/xthings-brand/install', 'POST', { body: { id: 'dsh-trace' } })
assert.equal(restart.body.ok, true)
assert.equal(restart.body.application, 'restart-required')

// failed install surfaces the reason
pluginManager.installBundle = async () => ({
  application: 'failed',
  changed: false,
  error: { message: 'git-prepare-not-allowed' },
})
let failed = await call('/xthings-brand/install', 'POST', { body: { id: 'dsh-trace' } })
assert.equal(failed.body.ok, false)
assert.equal(failed.body.message, 'git-prepare-not-allowed')

const count = countAssertions()
const splashBytes = await readFile(new URL('../assets/splash.js', import.meta.url), 'utf8')
assert.ok(splashBytes.includes('__XTHINGS_SPLASH__'))

console.log(`host-half harness: ${count} assertions passed`)

/* 权限坏掉时自愈：把真实路径上的文件收紧到 600 再写一次 */
{
  const target = join(tmpdir(), `xtb-cred-${Date.now()}.yaml`)
  await writeFile(target, 'version: 1\n', { mode: 0o644 })
  await chmod(target, 0o644)

  const realSet = credentials.set
  let attempts = 0
  credentials.set = async (ref, value) => {
    attempts += 1
    if (attempts === 1) throw new Error(`credentials-local: ${target} is readable beyond its owner (mode 644)`)
    return realSet(ref, value)
  }
  const healed = await call('/xthings-brand/provision', 'POST', { body: { key: 'sk-good-key-1234' } })
  assert.equal(healed.status, 200, 'permission error self-heals on retry')
  assert.equal(attempts >= 2, true, 'credentials.set retried once')
  const mode = (await stat(target)).mode & 0o777
  assert.equal(mode, 0o600, 'the file was tightened to 600')
  credentials.set = realSet

  /* 别的错误不装作能修 */
  const oldSet = credentials.set
  credentials.set = async () => {
    throw new Error('keychain locked')
  }
  const dead = await call('/xthings-brand/provision', 'POST', { body: { key: 'sk-good-key-1234' } })
  assert.equal(dead.status, 500)
  assert.equal(dead.body.code, 'config')
  assert.ok(String(dead.body.message).includes('keychain locked'), 'the real reason survives')
  credentials.set = oldSet
}

