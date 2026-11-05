/**
 * Xthings brand — Host half.
 *
 * Three jobs, all of them host-side:
 *
 *  1. Startup splash. Contributes the Lottie build, the animation data, the
 *     stylesheet and the overlay script to every index.html the webserver
 *     renders, through the `webserver/index-inject` event. Rows are used (not
 *     `tapIndex`) because the Desktop shell renders its own document from
 *     `collectIndexInjections()`; raw taps never reach the Electron window.
 *
 *  2. Provider provisioning. `POST /xthings-brand/provision` verifies the
 *     pasted key against the gateway, stores it as the `XTHINGS_API_KEY`
 *     credential, and creates the `xthings` provider row in `llm-pi-ai`.
 *     Runtime APIs are used on purpose: this bundle's patch is insert-only,
 *     and a loader `config` row replaces the whole provider map rather than
 *     merging into it.
 *
 *  3. Plugin installs. `POST /xthings-brand/install` drives the official
 *     install path (`ctx.pluginManager.installBundle`) for one recommended
 *     plugin at a time, and refuses to touch a dependency that already exists.
 *
 * The client half talks to these routes over same-origin HTTP: a hand-written
 * client plugin has no RPC channel, but every non-static `app://` request is
 * proxied to this host by the Desktop shell, so plain routes work in both the
 * Web and the Electron build.
 */

import { readFileSync } from 'node:fs'
import { access, chmod, readFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { constants as fsConstants } from 'node:fs'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ASSETS = join(HERE, 'assets')

/* 版本号只留在 package.json 一处，发版时不会忘了改常量。 */
const VERSION = (() => {
  try {
    return JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version ?? '0.0.0'
  } catch {
    return '0.0.0'
  }
})()

/** Provider id the wizard creates; the typo'd `xhings-ds` row is left alone. */
const PROVIDER_ID = 'xthings'
const PROVIDER_NAME = 'Xthings'
const CREDENTIAL_REF = 'XTHINGS_API_KEY'
const BASE_URL = 'https://s2a.xthings.dev/v1'
const API_KIND = 'openai-completions'
const FALLBACK_MODEL = 'deepseek-chat'

/** The Xthings market source, published from CherryLover/xthings-dsh-market. */
const MARKET_URL = 'https://cherrylover.github.io/xthings-dsh-market/market.json'

const STATUS_PATH = '/xthings-brand/status'
const PROVISION_PATH = '/xthings-brand/provision'
const INSTALL_PATH = '/xthings-brand/install'
const DIAG_PATH = '/xthings-brand/diag'

/**
 * The install list the wizard offers. `spec` is what goes to the registry, and
 * `name` is the package name used to decide whether it is already there.
 * Title and note mirror the market index so the wizard and the market agree.
 */
const RECOMMENDED = [
  {
    id: 'dsh-context',
    name: 'dsh-context',
    spec: 'dsh-context@0.81.2',
    title: { zh: '上下文', en: 'Context' },
    note: {
      zh: '看清上下文由什么组成、token 花在哪儿，随时翻看每一轮的变化。',
      en: 'See what fills the context window and where the tokens go, turn by turn.',
    },
  },
  {
    id: 'dsh-trace',
    name: '@local/dsh-trace',
    spec: 'git+https://github.com/CherryLover/dsh-trace#6d45f9cef58db1c197e65001332c2913d807ae51',
    title: { zh: '请求追踪', en: 'Trace' },
    note: {
      zh: '把每次请求、响应、耗时和重试都留成证据，出问题时不用靠猜。',
      en: 'Keeps every request, response, timing and retry as evidence, so incidents do not turn into guesswork.',
    },
  },
]

/** Required: routes need the webserver; every other service is looked up lazily. */
export const inject = ['webServer']

/**
 * Startup splash rows, loaded once and reused for every index render.
 * `error` is kept so a broken package reports itself instead of silently
 * leaving the shell with an unbranded boot.
 */
const splash = { rows: undefined, error: undefined, ready: false }

/**
 * Inline `<script>` text must not be able to close its own element. The only
 * sequences that can do that are `</script` and `<!--`; both are rewritten in a
 * way that keeps the JavaScript meaning (the sources contain them only inside
 * strings and comments, and not at all today).
 * @param text - raw JavaScript source.
 * @returns source that is safe to inline.
 */
function inlineScript(text) {
  return text.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')
}

/**
 * Read the four splash assets from disk and turn them into index rows.
 *
 * Synchronous on purpose: the very first request for the shell HTML must
 * already see the rows, so the launch animation cannot lose a race with the
 * window that is about to load it. 445 KB of local reads, once per boot.
 *
 * @param ctx - Host context, used only for logging.
 */
function loadSplash(ctx) {
  try {
    const [lottie, styles, script, data] = [
      readFileSync(join(ASSETS, 'lottie.min.js'), 'utf8'),
      readFileSync(join(ASSETS, 'splash.css'), 'utf8'),
      readFileSync(join(ASSETS, 'splash.js'), 'utf8'),
      readFileSync(join(ASSETS, 'launch.json'), 'utf8'),
    ]
    splash.rows = [
      // The Lottie build must be its own bare row: the UMD wrapper assigns
      // `globalThis.lottie` itself, and wrapping it in `window.lottie = …`
      // would overwrite the result with undefined.
      { kind: 'script', placement: 'head', text: inlineScript(lottie) },
      { kind: 'global', name: '__XTHINGS_LAUNCH_DATA__', value: JSON.parse(data) },
      { kind: 'style', text: styles },
      { kind: 'script', placement: 'body', text: inlineScript(script) },
    ]
    splash.ready = true
  } catch (error) {
    splash.error = error
    ctx.logger?.warn?.('xthings-brand: splash assets unavailable — %s', error?.message ?? error)
  }
}

/**
 * Mount the splash rows and the wizard routes.
 * @param ctx - Host root context.
 */
export function apply(ctx) {
  loadSplash(ctx)

  ctx.on('webserver/index-inject', (table) => {
    if (!splash.rows) return
    for (const row of splash.rows) table.push(row)
  })

  const webServer = service(ctx, 'webServer')
  if (!webServer) {
    ctx.logger?.warn?.('xthings-brand: no webserver in this composition — wizard routes stay off')
    return
  }

  const routes = [
    { kind: 'exact', path: STATUS_PATH, handler: (request, response) => statusRoute(ctx, request, response) },
    { kind: 'exact', path: PROVISION_PATH, handler: (request, response) => provisionRoute(ctx, request, response) },
    { kind: 'exact', path: INSTALL_PATH, handler: (request, response) => installRoute(ctx, request, response) },
    { kind: 'exact', path: DIAG_PATH, handler: (request, response) => diagRoute(ctx, request, response) },
  ]

  for (const route of routes) {
    ctx.effect(() => webServer.register(route))
  }

  ctx.logger?.debug?.('xthings-brand: routes mounted')
}

/* ------------------------------------------------------------------ *
 * HTTP plumbing
 * ------------------------------------------------------------------ */

/**
 * Answer with JSON. `no-store` keeps a credential answer out of any cache.
 * @param response - Node response.
 * @param status - HTTP status code.
 * @param payload - JSON-serializable body.
 */
function reply(response, status, payload) {
  const body = JSON.stringify(payload)
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'content-length': String(Buffer.byteLength(body)),
  })
  response.end(body)
}

/**
 * Reject a request that another site could have caused. A missing `origin` is
 * normal — the Desktop shell strips it before forwarding — so only a present
 * and foreign origin is refused, together with the cross-site fetch hint and a
 * present-but-foreign Host authority.
 * @param request - Node request.
 * @returns whether the request may proceed.
 */
function sameSite(request) {
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === request.headers.host
  } catch {
    return false
  }
}

/**
 * Read a small JSON body.
 * @param request - Node request.
 * @param limit - byte cap.
 * @returns the parsed object, or undefined when absent or malformed.
 */
async function readJsonBody(request, limit = 8192) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > limit) return undefined
    chunks.push(chunk)
  }
  if (size === 0) return {}
  try {
    const value = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return value !== null && typeof value === 'object' ? value : undefined
  } catch {
    return undefined
  }
}

/**
 * Look a service up without failing the whole plugin when it is absent.
 * @param ctx - Host context.
 * @param name - service name.
 * @returns the service, or undefined.
 */
function service(ctx, name) {
  try {
    return ctx.get(name) ?? undefined
  } catch {
    return undefined
  }
}

/**
 * Plain-object test for config shapes read back from the loader.
 * @param value - any value.
 * @returns whether it is a non-array object.
 */
function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/* ------------------------------------------------------------------ *
 * Provider state
 * ------------------------------------------------------------------ */

/**
 * Find the `llm-pi-ai` row in the live composition. It is identified by the
 * provider map it carries, with the row name as a fallback, so a renamed id
 * does not break the wizard.
 * @param configEditor - the config editor service.
 * @returns `{ entry, providers }`, or undefined when the row is not mounted.
 */
function llmRow(configEditor) {
  let table
  try {
    table = configEditor.configuration()
  } catch {
    return undefined
  }
  if (!Array.isArray(table)) return undefined

  const rows = table.map((row) => {
    const override = row?.override
    const inherited = row?.inherited
    const providers = isRecord(override?.providers)
      ? override.providers
      : isRecord(inherited?.providers)
        ? inherited.providers
        : undefined
    return { row, providers }
  })

  const named = rows.filter(({ row }) => {
    const label = `${row?.entry?.id ?? ''} ${row?.entry?.name ?? ''}`
    return /llm-pi-ai/i.test(label)
  })
  const chosen = named.find(({ providers }) => providers !== undefined) ?? rows.find(({ providers }) => providers !== undefined)
  if (!chosen) return undefined
  return { entry: chosen.row.entry, providers: chosen.providers ?? {} }
}

/**
 * Whether the `xthings` provider row exists in the live composition.
 * @param configEditor - the config editor service.
 * @returns boolean.
 */
function providerConfigured(configEditor) {
  return Boolean(llmRow(configEditor)?.providers?.[PROVIDER_ID])
}

/**
 * Whether a credential carries a value. Resolving is the only exact answer:
 * `describe` may exist for refs that were never filled.
 * @param credentials - the credentials service.
 * @returns boolean.
 */
async function credentialPresent(credentials) {
  if (!credentials) return false
  try {
    const resolved = await credentials.resolve(CREDENTIAL_REF)
    const value = resolved?.value
    return typeof value === 'string' && value.length > 0
  } catch {
    return false
  }
}

/**
 * Ask the gateway which models this key can reach.
 * @param key - the pasted API key.
 * @returns `{ ok: true, models }` or `{ ok: false, code, message }`.
 */
async function discoverModels(key) {
  let response
  try {
    response = await fetch(`${BASE_URL}/models`, {
      headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
  } catch (error) {
    return { ok: false, code: 'unreachable', message: error?.message ?? 'network error' }
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, code: 'invalid-key', message: `gateway answered ${response.status}` }
  }
  if (!response.ok) {
    return { ok: false, code: 'unreachable', message: `gateway answered ${response.status}` }
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = undefined
  }
  const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : []
  const models = list
    .map((item) => (typeof item === 'string' ? item : item?.id))
    .filter((id) => typeof id === 'string' && id.length > 0)
  return { ok: true, models }
}

/**
 * Entry ids we can actually see, for the "why can we not write" message.
 * @param configEditor - the config editor service.
 * @returns entry labels.
 */
function readableRows(configEditor) {
  try {
    const table = configEditor.configuration()
    if (!Array.isArray(table)) return []
    return table
      .map((row) => row?.entry?.id ?? row?.entry?.name)
      .filter((id) => typeof id === 'string' && id.length > 0)
      .slice(0, 12)
  } catch {
    return []
  }
}

/**
 * Add the Xthings market source when it is not configured yet. Best effort: a
 * failure here must not undo a successful key setup.
 * @param pluginMarket - the plugin market service.
 * @returns whether the source is configured afterwards.
 */
async function ensureMarketIndex(pluginMarket) {
  if (!pluginMarket) return false
  try {
    const current = pluginMarket.listIndexes() ?? []
    const urls = current
      .map((item) => (typeof item === 'string' ? item : (item?.url ?? item?.indexUrl ?? item?.id)))
      .filter((url) => typeof url === 'string' && url.length > 0)
    if (urls.includes(MARKET_URL)) return true
    await pluginMarket.setIndexes([...urls, MARKET_URL])
    return true
  } catch {
    return false
  }
}

/**
 * Read the installed package names from the profile manifest. This is the
 * decisive answer for "already installed" — `listBundles` only reports bundles,
 * and both recommended plugins are plain plugins.
 * @param pluginManager - the plugin manager service.
 * @returns map of package name to declared spec.
 */
async function installedPackages(pluginManager) {
  const dir = pluginManager?.profile?.dir
  if (typeof dir !== 'string') return {}
  try {
    const manifest = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
    return { ...(manifest?.dependencies ?? {}), ...(manifest?.devDependencies ?? {}) }
  } catch {
    return {}
  }
}

/* ------------------------------------------------------------------ *
 * Routes
 * ------------------------------------------------------------------ */

/**
 * `GET /xthings-brand/status` — everything the wizard needs to decide whether
 * it should appear and what it should say.
 * @param ctx - Host context.
 * @param request - Node request.
 * @param response - Node response.
 */
async function statusRoute(ctx, request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(response, 405, { ok: false, code: 'method-not-allowed' })
    return
  }
  if (!sameSite(request)) {
    reply(response, 403, { ok: false, code: 'forbidden' })
    return
  }

  const configEditor = service(ctx, 'configEditor')
  const credentials = service(ctx, 'credentials')
  const pluginManager = service(ctx, 'pluginManager')

  /* 内置插件源：第一次问状态时补上，人一打开市场就能看到内部插件。
     只试一次 —— 写不进去（权限、配置被别处接管）也不要每次拉状态都重试。 */
  if (!marketAttempted) {
    marketAttempted = true
    await ensureMarketIndex(service(ctx, 'pluginMarket'))
  }
  const pluginMarket = service(ctx, 'pluginMarket')

  const row = configEditor ? llmRow(configEditor) : undefined
  const provider = row?.providers?.[PROVIDER_ID]
  const configured = Boolean(provider)
  const present = await credentialPresent(credentials)

  const installed = await installedPackages(pluginManager)
  const recommended = RECOMMENDED.map((item) => ({
    id: item.id,
    name: item.name,
    spec: item.spec,
    installed: Object.prototype.hasOwnProperty.call(installed, item.name),
    title: item.title,
    note: item.note,
  }))

  let marketConfigured = false
  try {
    const current = pluginMarket?.listIndexes?.() ?? []
    marketConfigured = current.some((item) => {
      const url = typeof item === 'string' ? item : (item?.url ?? item?.indexUrl ?? item?.id)
      return url === MARKET_URL
    })
  } catch {
    marketConfigured = false
  }

  reply(response, 200, {
    schema: 1,
    version: VERSION,
    needsSetup: !configured || !present,
    provider: {
      id: PROVIDER_ID,
      configured,
      baseURL: typeof provider?.baseURL === 'string' ? provider.baseURL : BASE_URL,
      models: Array.isArray(provider?.models)
        ? provider.models
            .map((item) => (typeof item === 'string' ? item : item?.id))
            .filter((id) => typeof id === 'string' && id.length > 0)
        : [],
    },
    credential: { ref: CREDENTIAL_REF, present },
    recommended,
    market: { url: MARKET_URL, configured: marketConfigured },
  })
}

/**
 * The credential file must be owner-only; `credentials-local` refuses to write
 * when it is group- or world-readable, which a fresh machine can produce with a
 * different umask. Tightening the mode of our own credential file and writing
 * again is a safe self-repair; anything else is reported verbatim.
 *
 * @param credentials - the credentials service.
 * @param key - the API key to store.
 * @returns the failure message, or null on success.
 */
async function saveCredential(credentials, key) {
  try {
    await credentials.set(CREDENTIAL_REF, key)
    return null
  } catch (error) {
    const message = error?.message ?? String(error)
    /* 只有"文件对别人也可读"这一种情况能自己修，而且要用报错里那个真实路径，
       不能猜 ~/.dsh（有人把凭据放在别处，猜错只会多一条没用的报错）。 */
    if (!/readable beyond its owner/i.test(message)) return message
    const match = /(\/\S+\.ya?ml)/.exec(message)
    if (!match) return message
    try {
      await chmod(match[1], 0o600)
      await credentials.set(CREDENTIAL_REF, key)
      return null
    } catch (retry) {
      return `${message}（把 ${match[1]} 收紧到 600 后仍然失败：${retry?.message ?? retry}）`
    }
  }
}

/**
 * `GET /xthings-brand/diag` — why a save failed, on a machine we cannot see.
 *
 * The wizard only shows "保存失败，请重试", which is useless when the cause is
 * "the credential file is not writable" or "there is no llm-pi-ai entry in this
 * composition". This route reports what we can see from the host half, and with
 * `?probe=1` it also performs a throwaway credential write and reports the
 * error verbatim (the probe ref is removed again, the real key is never read).
 *
 * @param ctx - Host context.
 * @param request - Node request.
 * @param response - Node response.
 */
async function diagRoute(ctx, request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    reply(response, 405, { ok: false, code: 'method-not-allowed' })
    return
  }
  if (!sameSite(request)) {
    reply(response, 403, { ok: false, code: 'forbidden' })
    return
  }

  const credentials = service(ctx, 'credentials')
  const configEditor = service(ctx, 'configEditor')
  const row = configEditor ? llmRow(configEditor) : undefined

  let describe
  try {
    describe = credentials ? await credentials.describe(CREDENTIAL_REF) : null
  } catch (error) {
    describe = { error: error?.message ?? String(error) }
  }

  const home = homedir()
  const credentialFile = join(home, '.dsh', '.credentials.yaml')
  let file
  try {
    const info = await stat(credentialFile)
    let writable = true
    try {
      await access(credentialFile, fsConstants.W_OK)
    } catch {
      writable = false
    }
    file = { path: credentialFile, mode: `0${(info.mode & 0o777).toString(8)}`, bytes: info.size, writable }
  } catch (error) {
    file = { path: credentialFile, exists: false, error: error?.code ?? String(error) }
  }

  const probeWanted = /(?:^|[?&])probe=1(?:&|$)/.test(request.url ?? '')
  let probe
  if (probeWanted) {
    if (!credentials) {
      probe = { attempted: false, reason: 'no credentials service' }
    } else {
      try {
        await credentials.set('XTHINGS_DIAG_PROBE', 'probe')
        await credentials.unset('XTHINGS_DIAG_PROBE')
        probe = { attempted: true, ok: true }
      } catch (error) {
        probe = { attempted: true, ok: false, error: error?.message ?? String(error) }
        try {
          await credentials.unset('XTHINGS_DIAG_PROBE')
        } catch {
          /* nothing more we can do */
        }
      }
    }
  }

  reply(response, 200, {
    schema: 1,
    version: VERSION,
    platform: { os: process.platform, node: process.version, home },
    services: {
      credentials: Boolean(credentials),
      configEditor: Boolean(configEditor),
      pluginManager: Boolean(service(ctx, 'pluginManager')),
      pluginMarket: Boolean(service(ctx, 'pluginMarket')),
    },
    llmRow: row
      ? {
          found: true,
          entryId: row.entry?.id ?? null,
          entryName: row.entry?.name ?? null,
          providers: Object.keys(row.providers ?? {}),
        }
      : { found: false },
    credential: { ref: CREDENTIAL_REF, describe },
    credentialFile: file,
    probe,
  })
}

/**
 * `POST /xthings-brand/provision` — verify a key, store it, create the provider.
 * @param ctx - Host context.
 * @param request - Node request.
 * @param response - Node response.
 */
async function provisionRoute(ctx, request, response) {
  if (request.method !== 'POST') {
    reply(response, 405, { ok: false, code: 'method-not-allowed' })
    return
  }
  if (!sameSite(request)) {
    reply(response, 403, { ok: false, code: 'forbidden' })
    return
  }

  const body = await readJsonBody(request)
  if (!body) {
    reply(response, 400, { ok: false, code: 'bad-request', message: '请求内容无法解析' })
    return
  }

  const key = typeof body.key === 'string' ? body.key.trim() : ''
  if (key.length < 8 || key.length > 512 || /\s/.test(key)) {
    reply(response, 400, { ok: false, code: 'bad-request', message: 'Key 格式不正确' })
    return
  }

  const credentials = service(ctx, 'credentials')
  const configEditor = service(ctx, 'configEditor')
  if (!credentials || !configEditor) {
    reply(response, 503, { ok: false, code: 'unavailable', message: '运行环境缺少凭据或配置服务' })
    return
  }

  const probe = await discoverModels(key)
  if (!probe.ok) {
    reply(response, probe.code === 'invalid-key' ? 401 : 502, { ok: false, code: probe.code, message: probe.message })
    return
  }

  const models = probe.models.length > 0 ? probe.models : [FALLBACK_MODEL]
  // The provider schema takes model *objects*; a bare string fails validation.
  const modelEntries = models.map((id) => ({ id }))

  const saveFailure = await saveCredential(credentials, key)
  if (saveFailure !== null) {
    reply(response, 500, { ok: false, code: 'config', message: `保存凭据失败：${saveFailure}` })
    return
  }

  const row = llmRow(configEditor)
  if (!row?.entry) {
    /* 说清楚我们看到了什么，别让人对着"保存失败"猜。 */
    const seen = readableRows(configEditor)
    reply(response, 503, {
      ok: false,
      code: 'config',
      message: `找不到模型提供方配置（llm-pi-ai）${seen.length > 0 ? `，当前装载的是：${seen.join('、')}` : '，当前没有可写的插件配置'}`,
    })
    return
  }

  try {
    await configEditor.edit(row.entry, (current, inherited) => {
      const base = isRecord(current?.providers)
        ? current.providers
        : isRecord(inherited?.providers)
          ? inherited.providers
          : {}
      return {
        ...(isRecord(current) ? current : {}),
        providers: {
          ...base,
          [PROVIDER_ID]: {
            displayName: PROVIDER_NAME,
            apiKeyEnv: CREDENTIAL_REF,
            api: API_KIND,
            baseURL: BASE_URL,
            models: modelEntries,
          },
        },
      }
    })
  } catch (error) {
    reply(response, 500, { ok: false, code: 'config', message: `写入模型配置失败：${error?.message ?? error}` })
    return
  }

  await ensureMarketIndex(service(ctx, 'pluginMarket'))

  reply(response, 200, { ok: true, models, baseURL: BASE_URL })
}

/** The bundled market source is offered once per app start, not on every status call. */
let marketAttempted = false

/** One install at a time: the profile manifest is a shared file. */
let installing = false

/**
 * `POST /xthings-brand/install` — install one recommended plugin through the
 * official plugin manager, so the same authorization and reload lifecycle
 * applies as when the user clicks install in the UI.
 * @param ctx - Host context.
 * @param request - Node request.
 * @param response - Node response.
 */
async function installRoute(ctx, request, response) {
  if (request.method !== 'POST') {
    reply(response, 405, { ok: false, code: 'method-not-allowed' })
    return
  }
  if (!sameSite(request)) {
    reply(response, 403, { ok: false, code: 'forbidden' })
    return
  }

  const body = await readJsonBody(request)
  const id = typeof body?.id === 'string' ? body.id : ''
  const item = RECOMMENDED.find((candidate) => candidate.id === id)
  if (!item) {
    reply(response, 400, { ok: false, code: 'bad-request', message: '未知插件' })
    return
  }

  const pluginManager = service(ctx, 'pluginManager')
  if (!pluginManager) {
    reply(response, 503, { ok: false, code: 'unavailable', message: '插件管理服务不可用' })
    return
  }

  const installed = await installedPackages(pluginManager)
  if (Object.prototype.hasOwnProperty.call(installed, item.name)) {
    reply(response, 200, { ok: true, application: 'applied', changed: false, alreadyInstalled: true })
    return
  }

  if (installing) {
    reply(response, 409, { ok: false, code: 'busy', message: '另一个插件正在安装，请稍候' })
    return
  }

  installing = true
  let result
  try {
    result = await pluginManager.installBundle(item.spec, { enabled: true })
  } catch (error) {
    installing = false
    reply(response, 500, { ok: false, code: 'install', message: error?.message ?? String(error) })
    return
  } finally {
    installing = false
  }

  const application = result?.application ?? 'failed'
  const failure = result?.error?.message
  reply(response, 200, {
    ok: application === 'applied' || application === 'restart-required',
    application,
    changed: result?.changed === true,
    message: failure,
  })
}
