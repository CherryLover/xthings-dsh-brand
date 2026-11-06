# @xthings/dsh-brand

Xthings 的 DeepSeek Harness 品牌插件。一个 bundle，三件事：

1. **启动动画** —— 用品牌动画替换默认启动画面，正常速度播完 3.0 秒再进入主界面。
2. **侧栏品牌** —— 保留官方鲸鱼图标和官方字标，在字标下面加一行 `Powered by Xthings`。
3. **首次配置向导** —— 检查 `xthings` 提供方是否存在；缺了就弹出向导，粘贴个人 Key 后自动写好 Base URL、存好凭据、加上插件源，再由使用者逐个确认安装两个推荐插件。

## 效果预览

启动动画：1× 播满 3.0 秒（800×500 / 60fps / 180 帧），末帧定格 600 ms，再 320 ms 淡出。

![启动动画](docs/splash.gif)

首次配置向导的三步：

| 第一步 · 连接 | 第二步 · 插件 |
| --- | --- |
| [![第一步](docs/design/01-main.png)](docs/design/01-main.png) | [![第二步](docs/design/02-plugins.png)](docs/design/02-plugins.png) |

| 第三步 · 完成 | 侧栏品牌规格 |
| --- | --- |
| [![第三步](docs/design/03-done.png)](docs/design/03-done.png) | [![侧栏品牌](docs/design/04-brand.png)](docs/design/04-brand.png) |

| 启动动画规格 | 宿主的安装弹窗（参照） |
| --- | --- |
| [![启动动画规格](docs/design/05-splash.png)](docs/design/05-splash.png) | [![安装弹窗](docs/design/06-install.png)](docs/design/06-install.png) |

点图看原尺寸。GIF 和这六张图都是生成的：`docs/splash.gif` 由 `assets/launch.json` 逐帧渲染，
画板图由 `design/` 拍出来，改完画板跑一次 `node dev/make-design-shots.mjs` 就对齐了。

## 安装

同事机器上最省事的一条路：打开插件市场，选「Xthings DSH Plugins」这个源，在「装机必备」里点
**Xthings 品牌** 装上，重启 Harness。这一条走的就是 Harness 官方的安装通道，不用命令行。

命令行也可以：

```bash
# 本机开发（直接指向工作目录，改完刷新即可）
dsh plugin install link:/Users/jiangjiwei/Code/xthings-dsh-brand

# 同事机器（从市场索引里的同一个源装）
dsh plugin install git+https://github.com/CherryLover/xthings-dsh-brand.git

# 手上的目录
dsh plugin install file:/path/to/xthings-dsh-brand
```

装完重启 Harness 生效。第一次进主界面时会先播启动动画，播完才出配置向导。

### 更新

两种装法，更新方式不一样：

- **从市场装的**：插件市场里这个条目会显示「可更新」，点一下就是最新版。
- **直接贴 GitHub 地址装的**：那条依赖被钉在当时的 commit 上，市场不会把它和索引里的条目对上，
  所以看不到更新入口。再贴一次地址、换成新的 commit 或标签即可（同名覆盖安装，装完重载）：

  ```
  git+https://github.com/CherryLover/xthings-dsh-brand.git#v1.0.5
  ```

  想以后都能一键更新，把插件源加进去一次：`https://cherrylover.github.io/xthings-dsh-market/market.json`。

### 保存失败怎么办

向导报「保存失败，请重试」时，括号里会带上宿主的真实原因。把这段发出来，或者在出问题的那台机器上打开：

```
http://127.0.0.1:<web 端口>/xthings-brand/diag?probe=1
```

它会回答四件事：凭据/配置服务在不在、`llm-pi-ai` 那一行有没有、`~/.dsh/.credentials.yaml` 的权限位、
以及试写一把凭据的真实报错（写的是一条临时 ref，用完立刻删掉，不会碰你的 Key）。

常见原因：凭据文件被 umask 带成 644 时，官方的 `credentials-local` 会拒绝写入 —— 插件现在会自动收紧到 600 再重试一次。

Harness 的 `dsh-base` 会挂载官方 `@deepseek-ai/dsh-llm-pi-ai` 适配器，品牌 bundle 只添加自己的插件行。`1.0.4` 修复了 `1.0.3` 的子路径入口导致客户端向导无法被发现的问题：入口必须使用裸包名，不能使用 Host 子路径。同时修复全新 profile 中 adapter 尚无 providers 字段时无法保存第一家提供方的问题。升级后如仍运行旧 Host，请完整退出再启动；热更新是否成功须以实际路由和客户端挂载为准。

### 1.0.5 修复与验证范围

- Air 的真实 Host 状态是 `needsSetup: true`、Key 已保存、provider 尚未配置。旧客户端把两者用「或」判断为完成，推荐插件都装好时会直接隐藏向导。现在必须同时具备 Key 和 provider 才能跳过第一步；旧的步骤编号不能代替真实配置。
- Desktop 若先显示官方欢迎窗口，隐藏的工作区可能提前播放完动画。现在等工作区可见后才启动播放和安全计时，不改变 1× / 3.0 秒 / 定格 600 ms / 淡出 320 ms 的规格。这是源码确认的条件性问题，尚未证明它就是 Air 动画缺失的原因。
- 已通过 Host、客户端和隐藏窗口回归测试；Air 的实际安装和冷启动视觉验证由使用者完成，未宣称远端已验收。
- Desktop 在 Host 启动时捕获注入表；安装后必须完整退出应用再打开，仅刷新页面不能保证加载新的启动动画。

## 首次配置向导

向导只在**缺少 `xthings` 提供方或缺少 Key** 时出现，第二台机器以外不会再打扰。

| 项目 | 值 |
| --- | --- |
| 提供方 id | `xthings` |
| Base URL | `https://s2a.xthings.dev/v1` |
| 凭据 | `XTHINGS_API_KEY`（系统凭据库，不写进任何配置文件） |
| 协议 | `openai-completions` |
| 模型列表 | 用 Key 请求 `GET /v1/models` 自动发现，失败时退回 `deepseek-chat` |

Key 是**每人一把**，只存在本机凭据库里。发版包里不含任何 Key。

向导第二步列出的两个插件，由使用者逐个点击安装；点击后走 Harness 官方的插件安装通道（`pluginManager.installBundle`），不会自动批量安装：

- `dsh-context@0.81.2`（npm）
- `@local/dsh-trace`（git，锁定 commit `6d45f9c`）

已经装过的会被识别出来并跳过，不会覆盖现有依赖（尤其是本机 `link:` 形式的开发目录）。

## 插件源

向导会把公司插件源追加进 Harness 的插件市场（不动已有源）：

```
https://cherrylover.github.io/xthings-dsh-market/market.json
```

源本身在 [CherryLover/xthings-dsh-market](https://github.com/CherryLover/xthings-dsh-market)，加插件、改版本只需要动仓库里的 `market.json` 并推到 `main`，GitHub Pages 会自动更新，所有人下次打开插件市场就能看到。

## 实现要点

- loader 只插入品牌插件行；官方 `llm-pi-ai` 适配器由 Harness 的 `dsh-base` 提供。Host entry name 使用裸包名以便 Harness 发现客户端；版本化 row id 不保证热更新后的旧模块一定被替换，应检查实际路由版本。品牌插件不 `override` 任何现有配置。loader 的 `config` 是整块替换、不做深合并，所以提供方和插件源都在运行时用 `configEditor.edit` / `pluginMarket.setIndexes` 合并写入。
- 启动动画通过 `webserver/index-inject` 事件贡献四行（Lottie 构建、动画数据、样式、覆盖层脚本），Web 和 Electron 两条路径都走同一份注入表；不用 `tapIndex`，因为 Electron 只转发 `collectIndexInjections()` 的行。
- Lottie 构建必须原样内联成独立的 `<script>`：它自己会写 `globalThis.lottie`，包一层 `window.lottie = …` 会把结果覆盖成 `undefined`，动画就静默降级成静态字标。
- 动画数据以 `animationData` 形式内联，不走 `src`/`fetch` —— 打包后是 `file://`，没有可用的 HTTP 路由。
- 客户端半边（`client.js`）没有 RPC 通道，所以向导用同源 HTTP 打自己宿主半边的三条路由；Electron 会把非静态的 `app://` 请求带 cookie 转发给宿主，两条路径行为一致。

### 宿主路由

| 路由 | 用途 |
| --- | --- |
| `GET /xthings-brand/status` | 向导是否需要出现、提供方/凭据/插件/插件源现状 |
| `POST /xthings-brand/provision` | `{key}` → 校验、存凭据、写提供方、补插件源 |
| `POST /xthings-brand/install` | `{id}` → 装一个推荐插件（一次一个，已装则跳过） |
| `GET /xthings-brand/diag` | 装不上时用：服务在不在、`llm-pi-ai` 这一行找不找得到、凭据文件权限、`?probe=1` 还会试写一次凭据把真实报错带回来 |

这几条路由都做同源校验（`sec-fetch-site`、`origin`、`host`），跨站请求一律 403，响应统一 `no-store`。

## 设计画布

`design/` 是这六块画板的源文件（`project/canvas.json` + 每个画板一个 `.dc.html`），可以在支持
Design (canvas) 格式的编辑器里直接打开 `design/` 目录查看和改字：

| 画板 | 内容 |
| --- | --- |
| Main | 第一步：粘贴 Key |
| Step2-plugins | 第二步：两个必备插件 |
| Step3-done | 第三步：完成 |
| Brand | 侧栏品牌那两行的规格（官方锁排 + 副行，含放大和折叠态） |
| Splash | 启动动画的时间轴 |
| InstallDialog | 宿主自己的安装弹窗（不是我们的界面，只做参照） |

画板里的品牌图形都是 `design/assets/logo.svg` 那份官方矢量手工内联进去的，改的时候保持同一个来源。
`node dev/check-design.mjs` 会在 CI 里确认"登记的画板和实际文件对得上"。

## 开发

```bash
# 宿主半边：桩掉 Cordis 上下文，跑一遍三条路由和注入行（27 条断言）
node dev/test-host.mjs

# 启动动画：自包含测试页，file:// 或本地 http 都能开
./dev/serve.sh        # http://127.0.0.1:8138/dev/harness.html

# 重新生成 README 里的预览（需要本机 Chrome + ffmpeg）
node dev/make-preview.mjs        # → docs/splash.gif
node dev/make-design-shots.mjs   # → docs/design/*.png

# 画布自检：canvas.json 登记的画板和实际文件对不对得上
node dev/check-design.mjs
```

`dev/` 不进发布包（`package.json` 的 `files` 只列了运行时要用的东西）。

## 未做的事

- 暗色主题：目前只做了亮色，动画和向导都是白底。
- 卸载：删掉插件即可，提供方和 Key 会留在 profile 里，需要手动删除。
