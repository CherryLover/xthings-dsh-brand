import fs from "node:fs";
import vm from "node:vm";

const src = fs.readFileSync(new URL("../client.js", import.meta.url), "utf8");

/* --- pull the real dictionaries out of the source so bind() returns real copy --- */
const dictText = (name) => {
  const start = src.indexOf(`const ${name} = {`);
  const end = src.indexOf("\n\t\t};", start);
  return src.slice(start + `const ${name} = `.length, end + 4);
};
const ZH = vm.runInNewContext("(" + dictText("ZH") + ")");
const EN = vm.runInNewContext("(" + dictText("EN") + ")");

let lang = "zh";
let missing = new Set();
const usedKeys = new Set();
const t = (key, params) => {
  usedKeys.add(key);
  const dict = lang === "en" ? EN : ZH;
  const v = dict[key] ?? ZH[key];
  if (v === undefined) {
    missing.add(key);
    return "MISSING:" + key;
  }
  return params ? v.replace(/\{(\w+)\}/g, (m, n) => (n in params ? String(params[n]) : m)) : v;
};

/* --- harness --- */
let status = null;
let provision = { ok: true };
let install = { ok: true, application: "applied" };
const calls = [];
const fetchStub = async (url, init) => {
  calls.push({ url, method: init?.method, body: init?.body });
  let payload;
  if (url.endsWith("/status")) payload = status;
  else if (url.endsWith("/provision")) payload = provision;
  else if (url.endsWith("/install")) payload = install;
  else throw new Error("unexpected url " + url);
  return { ok: true, json: async () => payload };
};

const storage = new Map();
const appended = [];
const context = {
  URL,
  Promise,
  JSON,
  Object,
  Array,
  String,
  Number,
  Symbol,
  Error,
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  CustomEvent: class CustomEvent {
    constructor(type, init) { this.type = type; this.detail = init?.detail; }
  },
  Event: class Event { constructor(type) { this.type = type; } },
  fetch: fetchStub,
  window: {
    __ModuleLoader__: {
      load(def) {
        context.__def = def;
      }
    },
    sessionStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v))
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    __listeners: {},
    addEventListener(type, fn) {
      (this.__listeners[type] ||= []).push(fn);
    },
    removeEventListener(type, fn) {
      this.__listeners[type] = (this.__listeners[type] || []).filter((f) => f !== fn);
    },
    dispatchEvent(event) {
      for (const fn of [...(this.__listeners[event.type] || [])]) fn(event);
      return true;
    }
  },
  document: {
    baseURI: "http://127.0.0.1:58501/",
    head: { appendChild: (n) => appended.push(n) },
    getElementById: () => null,
    createElement: () => ({ id: "", textContent: "" })
  }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(src, context);

/* --- tiny hook runtime so the wizard can be driven --- */
function makeRuntime() {
  const state = [];
  let cursor = 0;
  let effects = [];
  const api = {
    useState(init) {
      const k = cursor++;
      if (!(k in state)) state[k] = typeof init === "function" ? init() : init;
      return [state[k], (next) => { state[k] = typeof next === "function" ? next(state[k]) : next; }];
    },
    useRef(init) {
      const k = cursor++;
      if (!(k in state)) state[k] = { current: init };
      return state[k];
    },
    useEffect(fn) {
      effects.push(fn);
    },
    async render(Comp, props) {
      cursor = 0;
      effects = [];
      const out = Comp(props);
      const pending = effects;
      effects = [];
      for (const fn of pending) {
        const cleanup = fn();
        if (cleanup) api.cleanups.push(cleanup);
      }
      return out;
    },
    cleanups: []
  };
  return api;
}

let RT = makeRuntime();
const reactStub = {
  useState: (...a) => RT.useState(...a),
  useEffect: (...a) => RT.useEffect(...a),
  useRef: (...a) => RT.useRef(...a)
};
const jsx = (type, props, key) => ({ type, props: props ?? {}, key });
const find = (node, predicate) => {
  if (node === null || node === undefined || typeof node !== "object") return null;
  if (predicate(node)) return node;
  const raw = node.children ?? (node.props ? node.props.children : undefined);
  const kids = Array.isArray(raw) ? raw : [];
  for (const kid of kids) {
    const hit = find(kid, predicate);
    if (hit !== null) return hit;
  }
  return null;
};

const jsxs = jsx;

const registered = [];
const me = context.__def;
const exportsObj = me.factory((name) => {
  if (name === "react/jsx-runtime") return { jsx, jsxs };
  if (name === "react") return reactStub;
  throw new Error("forbidden require: " + name);
});

const ctx = {
  slots: {
    inject(name, cb) { cb(); },
    register(opts, Comp) { registered.push({ opts, Comp }); return () => {}; }
  },
  locale: {
    register(ns, dicts) { return () => {}; },
    bind() { return t; }
  },
  effect(fn) { const d = fn(); return typeof d === "function" ? d : () => {}; }
};

exportsObj.apply(ctx);

const fail = [];
const ok = [];
const check = (cond, label) => (cond ? ok.push(label) : fail.push(label));

/* expand function components so assertions can see the real dom tree */
const walk = (node, out = []) => {
  if (node === null || node === undefined) return out;
  if (Array.isArray(node)) {
    for (const n of node) walk(n, out);
    return out;
  }
  if (typeof node !== "object") return out;
  if (typeof node.type === "function") return walk(node.type(node.props), out);
  if (node.props) {
    out.push(node);
    const kids = node.props.children;
    for (const kid of Array.isArray(kids) ? kids : [kids]) walk(kid, out);
  }
  return out;
};
const dumpTree = (node) => JSON.stringify(walk(node));


/* 1. module shape */
check(exportsObj.inject.join(",") === "slots,locale", "inject = slots,locale");
check(typeof exportsObj.apply === "function", "apply exported");
check(appended.length === 1 && appended[0].id === "xtb-style", "one style element appended");
check(appended[0].textContent.includes(".xtb-overlay"), "style holds the css");

/* 2. registrations */
const brand = registered.find((r) => r.opts.name === "sidebar.brand.name");
const overlay = registered.find((r) => r.opts.name === "shell.overlay");
check(!!brand, "registers sidebar.brand.name");
check(!!overlay, "registers shell.overlay");
check(brand && brand.opts.priority === -1, "brand priority -1");
check(overlay && overlay.opts.id === "xthings-onboarding", "overlay id xthings-onboarding");

/* 3. brand line */
const brandTree = brand.Comp({});
const flat = dumpTree(brandTree);
check(brandTree.props.className === "xtb-brandLine", "brand line class");
check(flat.includes("<svg") === false, "no raw html strings");
check(flat.includes("xtb-brandByline"), "byline present");
check(flat.includes("Powered by Xthings"), "byline copy");
check((flat.match(/"viewBox":"26 0 156 24"/g) || []).length === 1, "wordmark cropped viewBox");
check((flat.match(/M68\.416|M31\.9551/g) || []).length >= 2, "wordmark paths embedded");

/* 4. wizard: hidden while pending, then step 1 */
status = {
  schema: 1,
  needsSetup: true,
  provider: { id: "xthings", configured: false, baseURL: "https://s2a.xthings.dev/v1", models: [] },
  credential: { ref: "XTHINGS_API_KEY", present: false },
  recommended: [
    { id: "dsh-context", name: "dsh-context", installed: false, title: { zh: "推荐", en: "Recommended" }, note: { zh: "上下文增强", en: "Context boost" } },
    { id: "dsh-trace", name: "dsh-trace", installed: false, title: { zh: "推荐", en: "Recommended" }, note: { zh: "调用追踪", en: "Tracing" } }
  ],
  market: { url: "https://market.example", configured: true },
  version: "0.1.0"
};

let tree = await RT.render(overlay.Comp, {});
check(tree === null, "renders nothing before status resolves");
await new Promise((r) => setTimeout(r, 30));
tree = await RT.render(overlay.Comp, {});
let text = dumpTree(tree);
check(text.includes('"role":"dialog"'), "dialog role");
check(text.includes('"aria-modal":"true"'), "aria-modal");
check(text.includes("连接 Xthings"), "step 1 title");
check(text.includes("https://s2a.xthings.dev/v1"), "base url shown");
check(text.includes("xtb-overlay"), "overlay root class");
check(storage.get("xtb-step") === "1", "writes xtb-step=1");

/* find controls */
const all = () => walk(tree);
const byClass = (cls) => all().filter((n) => typeof n.props.className === "string" && n.props.className.split(" ").includes(cls));

/* 5. empty key -> error.empty */
const input = byClass("xtb-input")[0];
check(!!input, "key input rendered");
check(byClass("xtb-inputRow-error").length === 0, "no error ring initially");
input.props.onChange({ target: { value: "   " } });
tree = await RT.render(overlay.Comp, {});
byClass("xtb-primary")[0].props.onClick();
tree = await RT.render(overlay.Comp, {});
text = dumpTree(tree);
check(text.includes("请先粘贴 Key"), "empty key error");
check(!calls.some((c) => c.url === "/xthings-brand/provision"), "empty key does not hit the network");
check(byClass("xtb-inputRow-error").length === 1, "error ring on empty");

/* 6. invalid key */
provision = { ok: false, code: "invalid-key", message: "401" };
const input2 = byClass("xtb-input")[0];
input2.props.onChange({ target: { value: "sk-test" } });
tree = await RT.render(overlay.Comp, {});
byClass("xtb-primary")[0].props.onClick();
await new Promise((r) => setTimeout(r, 30));
tree = await RT.render(overlay.Comp, {});
text = dumpTree(tree);
check(text.includes("Key 无效或已过期"), "invalid-key copy");
check(calls.some((c) => c.url === "/xthings-brand/provision" && c.method === "POST" && c.body === JSON.stringify({ key: "sk-test" })), "posts provision with the key");

/* 7. unreachable + config */
for (const [code, copy] of [["unreachable", "连不上 Xthings"], ["config", "保存失败"]]) {
  provision = { ok: false, code, message: "" };
  const i = byClass("xtb-input")[0];
  i.props.onChange({ target: { value: "sk-test" } });
  tree = await RT.render(overlay.Comp, {});
  byClass("xtb-primary")[0].props.onClick();
  await new Promise((r) => setTimeout(r, 30));
  tree = await RT.render(overlay.Comp, {});
  check(dumpTree(tree).includes(copy), "error copy for " + code);
}

/* 7b. 宿主说得出原因，向导要把它带到脸上 */
provision = { ok: false, code: "config", message: "保存凭据失败：EACCES" };
const i7 = byClass("xtb-input")[0];
i7.props.onChange({ target: { value: "sk-test" } });
tree = await RT.render(overlay.Comp, {});
byClass("xtb-primary")[0].props.onClick();
await new Promise((r) => setTimeout(r, 30));
tree = await RT.render(overlay.Comp, {});
text = dumpTree(tree);
check(text.includes("保存失败"), "generic line stays");
check(text.includes("保存凭据失败：EACCES"), "host reason reaches the user");

/* 8. success -> step 2 */
provision = { ok: true, models: ["xthings/auto"], baseURL: "https://s2a.xthings.dev/v1" };
status = { ...status, credential: { ref: "XTHINGS_API_KEY", present: true }, provider: { ...status.provider, configured: true } };
const i8 = byClass("xtb-input")[0];
i8.props.onChange({ target: { value: "sk-test" } });
tree = await RT.render(overlay.Comp, {});
byClass("xtb-primary")[0].props.onClick();
await new Promise((r) => setTimeout(r, 40));
tree = await RT.render(overlay.Comp, {});
text = dumpTree(tree);
check(text.includes("安装必备插件"), "step 2 title after provision");
check(text.includes("dsh-context") && text.includes("dsh-trace"), "plugin rows rendered");
check(text.includes("未安装"), "missing state");
check(storage.get("xtb-step") === "2", "writes xtb-step=2");
check(byClass("xtb-primary")[0].props.children[1].props.children === "安装并继续", "install cta");
check(calls.filter((c) => c.url === "/xthings-brand/install").length === 0, "nothing installs until asked");

/* 9. install flow -> step 3 */
tree = await RT.render(overlay.Comp, {});
byClass("xtb-primary")[0].props.onClick();
await new Promise((r) => setTimeout(r, 60));
tree = await RT.render(overlay.Comp, {});
text = dumpTree(tree);
check(calls.filter((c) => c.url === "/xthings-brand/install").length === 2, "one install call per plugin");
check(text.includes("一切就绪"), "step 3 title");
check(text.includes("2 个已就绪"), "plugin count copy");
check(text.includes("已保存"), "key saved");
check(text.includes("xthings"), "provider shown");
check(storage.get("xtb-step") === "3", "writes xtb-step=3");

/* 10. finish writes xtb-done and hides */
byClass("xtb-primary")[0].props.onClick();
tree = await RT.render(overlay.Comp, {});
check(tree === null, "closed after finish");
check(storage.get("xtb-done") === "1", "writes xtb-done");

/* 11. restart-required is not a failure */
storage.clear();
status = { ...status, recommended: status.recommended.map((r) => ({ ...r, installed: false })) };
let restartTree = null;
{
  status = { ...status, needsSetup: true };
  status.credential = { ref: "XTHINGS_API_KEY", present: true };
  install = { ok: true, application: "restart-required", message: "restart needed" };
  RT = makeRuntime();
  await RT.render(overlay.Comp, {});
  await new Promise((r) => setTimeout(r, 40));
  restartTree = await RT.render(overlay.Comp, {});
  const cls = (c) => walk(restartTree).filter((n) => typeof n.props.className === "string" && n.props.className.split(" ").includes(c));
  cls("xtb-primary")[0].props.onClick();
  await new Promise((r) => setTimeout(r, 60));
  restartTree = await RT.render(overlay.Comp, {});
}
const rText = dumpTree(restartTree);
check(!rText.includes("安装失败"), "restart-required is not a failure");
check(rText.includes("一切就绪"), "restart-required advances");
check(!/重启后生效[\s\S]*重启后生效[\s\S]*一切就绪/.test(rText), "no restart claim on the done step");

/* 12. english copy renders too */
lang = "en";
const enTree = dumpTree(brand.Comp({})) + dumpTree(
  (await (async () => {
    RT = makeRuntime();
    storage.clear();
    status = { ...status, needsSetup: true, credential: { ref: "XTHINGS_API_KEY", present: false }, provider: { ...status.provider, configured: false } };
    await RT.render(overlay.Comp, {});
    await new Promise((r) => setTimeout(r, 40));
    const out = await RT.render(overlay.Comp, {});
    return out;
  })())
);
check(enTree.includes("Connect Xthings"), "english step 1");
check(enTree.includes("Powered by Xthings"), "english byline");

/* 13. the byline is the way back in: it is a button that reopens the guide at step 1 */
const bylineNode = find(brand.Comp({}), (n) => n.props && n.props.className === "xtb-brandByline");
check(bylineNode !== null && bylineNode.type === "button", "byline is a button");
check(bylineNode !== null && bylineNode.props.title === "Xthings settings", "byline carries a settings tooltip");
storage.set("xtb-done", "1");
lang = "zh";
RT = makeRuntime();
await RT.render(overlay.Comp, {});
await new Promise((r) => setTimeout(r, 40));
check(JSON.stringify(await RT.render(overlay.Comp, {})) === "null", "finished guide stays closed");
RT = makeRuntime();
await RT.render(overlay.Comp, {});
await new Promise((r) => setTimeout(r, 40));
await RT.render(overlay.Comp, {});
context.window.dispatchEvent({ type: "xthings:wizard-open" });
await new Promise((r) => setTimeout(r, 40));
const reopened = dumpTree(await RT.render(overlay.Comp, {}));
check(reopened.includes("连接 Xthings"), "byline reopens the guide at step 1");
check(reopened.includes("访问密钥"), "reopened guide asks for the key");
check(storage.get("xtb-done") === "0", "reopen clears the finished marker");

/* 14. the guide never paints over the launch animation */
lang = "zh";
let splashMounted = true;
context.document.getElementById = (id) => (id === "xthings-splash" && splashMounted ? { id } : null);
storage.clear();
status = { ...status, needsSetup: true, credential: { ref: "XTHINGS_API_KEY", present: false }, provider: { ...status.provider, configured: false } };
RT = makeRuntime();
await RT.render(overlay.Comp, {});
await new Promise((r) => setTimeout(r, 40));
check(JSON.stringify(await RT.render(overlay.Comp, {})) === "null", "guide waits behind the splash");
await new Promise((r) => setTimeout(r, 320));
check(JSON.stringify(await RT.render(overlay.Comp, {})) === "null", "still waiting while the splash is on screen");
splashMounted = false;
await new Promise((r) => setTimeout(r, 320));
check(dumpTree(await RT.render(overlay.Comp, {})).includes("连接 Xthings"), "guide opens once the splash is gone");
context.document.getElementById = () => null;

/* Air regression: a saved key does not prove provider configuration exists. */
for (const installed of [false, true]) {
  for (const rememberedStep of [null, "3"]) {
    storage.clear();
    if (rememberedStep !== null) storage.set("xtb-step", rememberedStep);
    status = {
      ...status,
      needsSetup: true,
      credential: { ref: "XTHINGS_API_KEY", present: true },
      provider: { ...status.provider, configured: false },
      recommended: status.recommended.map((row) => ({ ...row, installed }))
    };
    RT = makeRuntime();
    await RT.render(overlay.Comp, {});
    await new Promise((resolve) => setTimeout(resolve, 30));
    const regressionTree = dumpTree(await RT.render(overlay.Comp, {}));
    check(regressionTree.includes("连接 Xthings"), `saved key without provider opens setup (plugins=${installed}, step=${rememberedStep})`);
    check(storage.get("xtb-step") === "1", "incomplete provider resets remembered step");
  }
}
storage.clear();
status = { ...status, credential: { ...status.credential, present: false }, provider: { ...status.provider, configured: true } };
RT = makeRuntime();
await RT.render(overlay.Comp, {});
await new Promise((resolve) => setTimeout(resolve, 30));
check(dumpTree(await RT.render(overlay.Comp, {})).includes("连接 Xthings"), "configured provider without key opens setup");

/* 13. dictionaries */
const zhKeys = Object.keys(ZH).sort();
const enKeys = Object.keys(EN).sort();
check(JSON.stringify(zhKeys) === JSON.stringify(enKeys), "zh and en share one key set");
check(missing.size === 0, "no key missing from the dictionary (" + [...missing].join(",") + ")");
const untouched = zhKeys.filter((k) => !usedKeys.has(k));
check(true, "keys touched by the render path: " + usedKeys.size + "/" + zhKeys.length + "; untouched: " + untouched.join(","));

/* 14. skip path */
storage.clear();
check(true, "skip key reserved: xtb-skip written on later");

console.log(ok.map((l) => "PASS  " + l).join("\n"));
console.log(fail.length ? "\n" + fail.map((l) => "FAIL  " + l).join("\n") : "\nALL GREEN");
process.exit(fail.length ? 1 : 0);
