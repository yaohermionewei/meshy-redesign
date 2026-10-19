# Meshy · 原站复刻与 Redesign

项目先复刻原站、收集字体 / 图标 / 图片 / CSS 并建立视觉对照，再基于这些素材制作两个并列设计方案：`redesign1` 与 `redesign2`。方案一还延伸了「点我！借东西小人游戏」项目工作区。

完整过程、设计原因、两套方案的差异和当前进度见 **[设计与过程记录](DESIGN_NOTES.md)**。

| 页面 | 本地入口 |
| --- | --- |
| 原版首页 | <http://localhost:5173/zh/discover> |
| 原版 Agent | <http://localhost:5173/zh/workspace?sidebar=agent> |
| Redesign 1 | <http://localhost:5173/redesign/1> |
| Redesign 2 | <http://localhost:5173/redesign/2> |
| 方案一 · 点我！借东西小人游戏项目 | <http://localhost:5173/redesign/1/project/arrietty> |
| 方案二 · 点我！借东西小人游戏入口 | <http://localhost:5173/redesign/2/project/arrietty> |
| 方案一 · 资产库 | <http://localhost:5173/redesign/1/assets> |
| 方案二 · 资产库 | <http://localhost:5173/redesign/2/assets> |
| 方案一 · 全部项目 | <http://localhost:5173/redesign/1/projects> |
| 方案二 · 全部项目 | <http://localhost:5173/redesign/2/projects> |

## 原站复刻基础

复刻目标：[Meshy 中文社区首页](https://www.meshy.ai/zh/discover)。当前实现按登录态页面复刻：左侧固定导航 rail、登录用户名问候、禁用生成按钮和社区内容区域。页面使用真实 HTML、原站 CSS、本地字体、原始 SVG 和模型图片，支持桌面、平板和手机布局。

## 运行

需要 Node.js 20 或更高版本。运行首页本身不需要安装依赖：

```sh
npm run dev
```

打开 <http://localhost:5173>，或 <http://localhost:5173/zh/discover>。

```sh
npm run build
npm run preview
```

`dist/` 是可直接托管的静态产物。页面运行时没有外部资源或 API 请求。

## 图片资源与压缩

线上图片统一使用 WebP（297 张）；仅为兼容性保留 3 张 PNG 触屏 / 小尺寸网站图标，SVG 与 ICO 保持原格式。已统一 89 个原先使用 `.png` / `.jpg` 后缀的路径及所有运行时引用，并修正 512px 网站图标的 MIME 类型。原站 URL 仍保存在资源清单中作为来源记录。

300 张图片合计从 6,455,198 字节降至 6,032,331 字节，减少 6.55%。原资源大部分已经是 WebP，继续压缩的空间有限。所有图片保留原尺寸及透明通道，完整记录见 `verification/image-optimization.json`，页面检查与首屏下载量见 `verification/IMAGE-OPTIMIZATION.md`。

日后添加图片时可运行 `python3 scripts/optimize-images.py`，再执行 `npm run build`。该可选开发工具需要 Pillow 和 numpy；部署构建无需安装 Python 依赖。工具按文件哈希跳过已处理的图片，防止重复有损编码，仅保留通过画质检查的压缩结果。

## 文件

- `src/document.html`：文档、原始字体变量、SVG 渐变定义与本地资源引用。
- `src/desktop.html`、`src/tablet.html`、`src/mobile.html`：原始布局结构，构建时合并到首页。
- `public/assets/`：原站样式表、字体、图片、图标和高分屏图片变体。
- `public/assets-manifest.json`：每个文件的原始 URL、本地路径和大小。
- `styles.css`：固定动画状态的少量补充样式。
- `redesign-assets.js`、`redesign-assets.css`：两个方案共用的资产库页面（`/redesign/1|2/assets`）；资产缩略图与数据在 `public/assets/assets-page/`。
- `layout.js`：响应式卡片排布、顶部玻璃背景与滚动条外观。
- `reference/`：原站截图和原始 CSS。
- `verification/`：登录态本地截图、几何检查 JSON 和检查说明。

此阶段按要求只实现视觉。生成、搜索、登录、发帖、模型预览、轮播和无限加载没有接入业务逻辑；展示首页初始批次的 20 张模型卡片。轮播固定在第一张，动画固定为静态状态。

## 比对

访客态的历史像素报告仍保存在 `verification/report.json`。登录态使用已认证原站读取到的几何数据，运行 `npm run verify:logged` 检查 1094×950 与 1588×950 两个尺寸，结果保存在 `verification/logged-report.json`。

访客态的 Pixelmatch 历史结果仍保留在 `verification/report.json`；登录态结果以 `verification/logged-report.json` 和 `verification/LOGGED-REPORT.md` 为准。

运行中的开发服务器下打开 <http://localhost:5173/verification/> 查看登录态本地截图与检查结果。

需要重新验证时：

```sh
npm install
npx playwright install chromium
npm run dev
# 另一个终端
npm run verify
```

可通过 `CHROME_PATH` 指定浏览器路径。`npm run capture` 可重新抓取当时的原站页面；网站内容变化时会覆盖参考截图和页面结构。抓取使用 `CAPTURE_PROXY` 指定代理，默认沿用本机 `http://127.0.0.1:7897`；正常运行和验证不需要这个代理。

## Redesign · 方案一

独立入口：<http://localhost:5173/redesign/1>，浏览器标签名 `meshy_redesign1`。原首页和原 Agent 页面保留不变。

- `redesign1.js`、`redesign1.css` 提供方案一及方案二共用的基础，复用原站本地字体、图片、社区结构和卡片排布；原版页面不加载。
- 快速生成 / Agent 是页面内状态；Tab、输入区交叉淡入淡出和实测高度展开均可在动画中反向。社区和两种输入区保持同一份 DOM，缩放保留草稿和模式。
- 导航「创作」使用线框圆圈加号图标，选中时变品牌色；skills 使用书本图标。Agent 模式精选 skills 为中世纪游戏道具、角色动画、游戏场景搭建、草图转手办、冰箱贴，入口文案为「更多」。右上角商店 / 开发者 / 资源为带悬停底色的按钮；社区上方无分隔线。两套方案共用这部分。
- 键盘支持左右方向键、Home、End；系统减少动态效果设置会关闭过渡。
- Agent 模式下「点我！借东西小人游戏」整张项目卡片已接入项目工作区跳转；其余首页入口和卡片以视觉展示为主。
- 构建会生成 `dist/redesign/1/index.html`，可直接访问和刷新，无需服务端回退规则。

```sh
npm run verify:redesign1
node scripts/record-redesign1.cjs
```

专项检查覆盖 1440、1920、768、390px、往返切换、反向和连点、滚动保留、跨断点缩放、草稿保留、键盘及减少动态效果。截图、录屏、动画采样与校验报告在 `verification/redesign1/`；打开 <http://localhost:5173/verification/redesign1/> 可统一查看。

## Redesign · 方案二

入口：<http://localhost:5173/redesign/2>，浏览器标签名 `meshy_redesign2`。
在方案一当前样式之上，快速生成下方增加四个常用工具入口（图像生成 / 3D 模型 / 3D 打印 / 动画），不带模块标题，每项显示工具名、功能说明和子模式，悬停时卡片上浮、显示色调并播放箭头动画；侧栏改为横向图文导航，并加入新建项目和带封面缩略图的项目列表；平板与桌面下侧栏可拖动边缘调宽、⌘B / Ctrl+B 或侧栏按钮收起为 64px 图标栏，状态保存在浏览器本地。Agent 内容区保留精选 skills，移除最近项目。手机通过“项目”展开侧栏项目列表，支持 Escape 关闭。

`redesign2.js` / `redesign2.css` 只提供方案二差异；输入区、模式动画、导航命名和精选 skills 复用方案一。方案二另有侧栏底部积分卡与账号行，以及分层的模块间距（参数栏到工具入口、工具入口到社区两段相等）。`dist/redesign/2/index.html` 支持静态托管直接访问与刷新。

```sh
npm run verify:redesign2
REDESIGN_VERSION=2 node scripts/record-redesign1.cjs
```

四种尺寸的两种状态截图、切换录屏、动画采样和校验报告：<http://localhost:5173/verification/redesign2/>。

## 方案一 · 项目工作区

<http://localhost:5173/redesign/1/project/arrietty>，也可在两个方案的 Agent 项目入口中点击「点我！借东西小人游戏」进入。浏览器标签名保持 `meshy_redesign1`。

项目页复用方案一导航，恢复原站的项目侧栏、空白对话区和输入框、52 张素材组成的画布，以及默认展开的 20 张模型资产列表。素材、图标和字体均在本地。画布支持拖动、缩放和复位，资产栏可折叠并在当前页搜索，窄屏项目 / 对话面板可展开。

画布对象名称默认常驻显示；对象可单击选中、拖动（拖动时吸附对齐并显示对齐线，按住空格或滚轮平移画布），选中后显示描边、控制点和悬浮操作栏，并作为参考出现在对话输入框中；悬停 3D 模型显示「查看模型」、模型类型和生成日期。

项目栏收起后，对话面板四角保留圆角，左上角「显示侧边栏」图标可平滑展开项目栏。Cmd + 鼠标滚轮以鼠标位置为中心缩放画布；资产栏收起后显示「我的资产」及展开图标。

`scripts/render.mjs` 与构建均支持项目地址直接访问和刷新。页面源为 `redesign1-project.js` / `redesign1-project.css`，资源位于 `public/assets/redesign1/project/`。

运行 `npm run verify:project` 检查参考尺寸与响应式布局、空白对话、图片和坐标、项目入口 / 返回、面板与画布操作。验收页面：<http://localhost:5173/verification/project/>。
