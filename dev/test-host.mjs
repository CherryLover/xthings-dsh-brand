/**
 * Host-half harness. Runs index.js against a stubbed Cordis context so the
 * route logic, the provider merge and the install guard can be exercised
 * without an app launch.
 *
 *   node dev/test-host.mjs
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const plugin = await import('../index.js')

/* ---------------- stubs ---------------- */

const profileDir = await mkdtemp(join(tmpdir(), 'xtb-profile-'))
await writeFile(
  join(profileDir, 'package.json'),
  JSON.stringify({ dependencies: { 'dsh-context': '^0.78.2', dshmarket: '1.73.6' } }, null, 2),
)

const calls = { installs: [], edits: [], sets: [], indexes: [] }

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
  set: async (ref, value) => {
    calls.sets.push({ ref, value })
    state.secret = value
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

function fakeRequest(method, { body, headers = {} } = {}) {
  const text = body === undefined ? '' : JSON.stringify(body)
  return {
    method,
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

async function call(path, method, options) {
  const response = fakeResponse()
  await routes.get(path).handler(fakeRequest(method, options), response)
  return response.captured
}

/* ---------------- run ---------------- */

plugin.apply(ctx)
await new Promise((resolve) => setTimeout(resolve, 50))

assert.deepEqual([...routes.keys()].sort(), [
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

const splashBytes = await readFile(new URL('../assets/splash.js', import.meta.url), 'utf8')
assert.ok(splashBytes.includes('__XTHINGS_SPLASH__'))

console.log('host-half harness: 27 assertions passed')
