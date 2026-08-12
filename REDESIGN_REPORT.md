# MCH Website — Visual Reset Report

## 修改了什么

- 完成一次 Visual Reset + Interaction Reset，而不是继续在 Toyism 方向上叠加装饰。
- 全局颜色重置为 Off-white / Black / Muted Red：`#F1F0EB`、`#111111`、`#6A6A64`、`#B64B45`。
- 删除页面对 Toyism SVG symbol dictionary 和 Cartoon character 的依赖。
- Hero 重做为 `MCH / 2026`、`AI-NATIVE / PRODUCT / BUILDER`、location、availability 和 Editorial CTA。
- Navigation 重做为透明、轻量、无胶囊的编辑化导航；移动端保留清晰菜单。
- Profile 重做为 editorial facts、长段落 statement 和 method/beliefs rows，删除角色卡片。
- Selected Work 改成标题驱动的编号列表，不再使用项目卡片或图标卡。
- Thinking、Capabilities、Contact 和 Footer 统一使用 hairline rules、编号、留白和单一 accent。
- 知识库保留搜索、筛选、文档手风琴、资源、技能树、文件上传和私密花园，只重置其视觉表面。
- 新增桌面端克制 Custom Cursor：普通状态为小点，进入链接显示 VIEW/OPEN；触摸设备和 reduced-motion 自动关闭。
- 首页第一屏进一步升级为可探索的 3D `MCH WORLD`：低多边形地图、道路、地形、建筑、树木、可驾驶 rover 和跟随相机。
- 地图中的 Work campus、Thinking field、About studio、Knowledge tower 对应现有真实内容；点击地标会滚动到对应 section 或进入知识库。
- 支持方向键 / WASD 驾驶，也支持点击地面自动移动；移动端采用触摸点击地图的方式。

## 删除的上一版 Toyism 元素

- 深绿 / 亮黄 / 红蓝多色 section bands。
- Cartoon creature、玩具包装式角色档案和可爱角色 UI。
- Toyism SVG symbols、Sticker、点阵 pattern 和随机几何装饰。
- 粗黑描边、pill navigation、pill tags、rounded cards、玩具式按钮。
- 通过颜色块制造层级的方式。

## 新的 Design System

- Neutral canvas: `--bg` / `--fg` / `--muted` / `--line`。
- Single accent: `--accent` / `--accent-soft`。
- Fluid display type: `--display-xxl`、`--display-xl`、`--display-lg`。
- 12-column desktop grid，移动端切换为 4-column visual rhythm。
- Hairline 1px borders，极少 radius，无阴影、无玻璃、无渐变。
- Timing: fast 180ms、normal 400ms、slow 700ms，统一 cubic-bezier easing。

## 3D World / Map

- Three.js 场景独立放在 `src/components/world/WorldMap.tsx`，不与内容组件耦合。
- 使用 Orthographic Camera 形成建模沙盘 / 等距地图感。
- Three.js 通过 `next/dynamic` 和 `ssr: false` 单独加载，不进入服务端渲染，也不进入知识库首屏依赖。
- WebGL device pixel ratio 上限为 1.5，阴影贴图为 1024，控制 GPU 成本。
- 场景卸载时会释放 geometry、material、renderer 和事件监听器。
- WebGL 不可用时提供 fallback；`prefers-reduced-motion` 下关闭 3D 动画地图。

## MediaPipe Gesture Control

- 新增独立 `GestureControl` 客户端模块和稳定的 `public/workers/gesture-recognizer.worker.js`。
- 点击 `Hand Control` 后才请求摄像头权限、启动前置摄像头和加载 MediaPipe 模型。
- 主线程使用 transferable `ImageBitmap` 传帧；worker 内运行 `recognizeForVideo()` 并在完成后释放 bitmap。
- 食指映射虚拟 cursor；拇指/食指 pinch 映射 click，pinch hold + move 映射 drag。
- Open Palm 上下挥动滚动页面，稳定停留则释放交互并执行返回逻辑；左右挥手切换项目已移除。
- 对模型容易返回 `None` 的“双指展开、其余手指收起”姿势增加 landmark 几何识别，首个匹配帧立即向下翻一屏，持续保持时只触发一次。
- 摄像头预览叠加 21 个手部关键点、骨骼连接线、指尖高亮和左右手标签；动作区同步显示中文名称、触发结果、置信度与推理耗时。
- 增加固定的六项手势说明，未绑定的网站手势会明确标注“已识别但未绑定”，避免反馈含混。
- `mch:gesture-*` Custom Events 已连接 Three.js raycast：食指指向建筑时建筑材质与地标同步撞色，损合时进入对应 section 或 Knowledge。
- Stop、组件卸载、权限延迟返回和 worker error 都会停止 MediaStream tracks 并释放资源。
- Worker 因开发环境热更新或临时加载失败时会自动重试一次；初始化超过 20 秒会终止，并显示具体脚本错误而不是笼统的 crash 提示。
- Worker 使用 MediaPipe classic bundle 和固定 public URL，避免 Next.js 开发 chunk 更新导致脚本失效；GitHub Pages basePath 由构建配置自动注入。
- MediaPipe bundle、SIMD WASM 与 non-SIMD fallback 改为同源静态资源，修复嵌入式浏览器拦截跨域 `importScripts` 导致的 Worker 启动失败。

## 四个参考网站的应用

- Aristide Benoist：45% 主方向，用于 Hero scale、work index、whitespace、scroll narrative 和专业感。
- Studio Feixen：25%，只用于 Swiss grid、type contrast、graphic composition 和 alignment。
- Dennis Snellenberg：20%，用于 custom cursor、hover、text movement、pointer feedback 和 motion timing。
- Bruno Simon：10%，只保留到未来 `/lab` / `/experiment`，本轮不把主站游戏化。

## 验证

- `DEPLOY_TARGET=github-pages npm run build` 通过。
- 首页本地 `http://localhost:3001/` 正常加载。
- 知识库 `http://localhost:3001/knowledge/` 正常加载，原有入口仍可见。
- 未删除业务数据或知识库功能。
- 新增运行时依赖 `three`，新增开发类型依赖 `@types/three`。
- 新增运行时依赖 `@mediapipe/tasks-vision`；模型和 WASM 只在用户主动开启 Hand Control 后加载。
- 首页 First Load JS 约 110 kB；Three.js 位于动态 chunk，知识库仍约 114 kB。

## 仍可以继续完善

- 当前数据层没有独立项目详情字段，下一步可基于真实资料建立 `/work/[slug]` 详情页和 shared layout transition。
- 可为 Selected Work 接入真实项目图片，在 hover 时做 neutral → image colour 的 Preview Layer。
- 可增加单独 `/lab`，以 CSS/SVG/Canvas 做轻量空间实验。
- `next lint` 迁移到 ESLint CLI 和依赖安全升级仍是独立工程任务。
