# Meshy Redesign · 方案一验收

页面：<http://localhost:5173/redesign/1>，标题 `meshy_redesign1`。
集中预览：<http://localhost:5173/verification/redesign1/>。

## 已完成

- 独立方案脚本、作用域样式；原首页和原 Agent 路由保持原有展示。
- 左侧首页 / skills / 资产及图像 / 模型 / 打印 / 动画；右上商店 / 开发者 / 资源。
- 同页快速生成与 Agent，固定标题、Tab 和输入外部占位。
- 六张精选 skills、五个最近项目；对应真实原站图片，Y2K 为空白封面。
- 实测高度展开 420ms / 收起 320ms、Tab 底板 240ms、输入交叉淡入淡出 180ms，支持中断反向。
- 同一份社区、图片和输入 DOM；保留滚动与草稿；键盘与减少动态效果支持。
- 原站背景等遗留动画继续冻结。

## 验证

- 开发环境 `npm run verify:redesign1`：36 项通过，详见 `report.json`。
- 静态构建同样的 36 项通过，详见 `static/report.json`；生成 `dist/redesign/1/index.html`，直接访问与刷新通过。
- 1440 / 1920 / 768 / 390px 两种状态截图检查；无横向溢出、破图、重复模块、控制台错误或资源失败。
- 标题、Tab、输入外部占位在切换前后偏差不超过 1px。
- 切换时 URL、历史记录、资源请求数量不变，社区卡片节点保持一致。
- 实测正常往返、85ms 后反向、17 次快速连点、跨断点缩放、草稿与滚动保留、键盘、减少动态效果。
- 原版 `npm run verify:logged`、`npm run verify:agent` 均通过；`npm run build` 成功。

## 交付证据

- `quick-{width}.png` / `agent-{width}.png`：四种尺寸的两种状态。
- `agent-390-projects.png` / `agent-390-community.png`：手机最近项目和社区的连续排布。
- `switching.mp4`：实际渲染录屏，含往返、中途反向、快速连点。
- `animation-samples.json`：逐帧高度及社区位置，用于验证连续移动。
- `recording.json`：录制操作时间线。
- `playback-check.json`：最终录屏在内置浏览器完整播放至结束，无媒体或控制台错误。

首页基础交互为模式切换。后续已接入「点我！借东西小人游戏」项目卡片跳转，进入 `/redesign/1/project/arrietty`；其他入口与卡片以视觉布局为主。项目页验收见 [项目工作区记录](../project/README.md)。

## 本轮样式微调

- Agent 输入框至精选 skills 标题的可见间距收紧至 24px，标题、Tab、输入区仍保持原位置。
- Skills 改为 44px 高的浅透明卡片、细边框与 32px 缩略图，移除原有较厚底色和内阴影。
- 桌面六张卡片最右侧增加「查看更多」；平板和手机收纳至标题行右侧。
- 四种尺寸截图、切换录屏与开发 / 静态校验已更新。
