# 马晨皓 · 个人网站

AI-Native Product Builder 的个人独立网站。长期维护项目。

## 技术栈

- **框架**: Next.js 15 (App Router) + TypeScript 5.7
- **样式**: CSS Modules (不使用 Tailwind)
- **字体**: next/font (Fraunces + Space Grotesk，自托管)
- **动画**: CSS + IntersectionObserver (轻量级，Motion 库保留给复杂交互)
- **部署**: GitHub → 腾讯 EdgeOne Makers 自动部署

## 设计原则

- **70% Editorial / Swiss** — 信息秩序、网格系统、排版优先
- **20% Toyism** — 几何符号、平面色块碰撞、biomorphic 形态、微交互
- **10% Experimental** — WebGL / 3D (仅在必要时，lazy loading)
- 优先使用 CSS 和 SVG 实现视觉效果，不使用图片实现几何图形
- 所有动画支持 `prefers-reduced-motion` 降级
- 首屏性能优先，非首屏资源 lazy loading

## 项目结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局 (字体加载、Symbols、Navbar、Footer)
│   ├── page.tsx            # 首页
│   ├── globals.css         # 设计系统 (色板、间距、排版、动画)
│   └── knowledge/
│       └── page.tsx        # 知识库页
├── components/
│   ├── toyism/
│   │   └── Symbols.tsx     # SVG 符号库 (18+ symbols)
│   ├── ui/
│   │   └── Reveal.tsx      # 滚动渐入动画
│   ├── layout/
│   │   ├── Navbar.tsx      # 导航栏 (滚动检测、移动端菜单)
│   │   └── Footer.tsx      # 页脚
│   ├── home/
│   │   ├── Hero.tsx        # 首屏 (鼠标追踪眼睛、呼吸生物)
│   │   ├── About.tsx       # 角色档案
│   │   ├── Works.tsx       # 作品展示
│   │   ├── Skills.tsx      # 能力卡片
│   │   ├── Journal.tsx     # 故事书
│   │   └── Contact.tsx     # 联系方式
│   └── knowledge/
│       ├── KnowledgeClient.tsx    # 知识库主体 (搜索/筛选/上传/私密花园)
│       └── KnowledgeClient.module.css
├── data/
│   ├── profile.ts          # 个人信息
│   ├── works.ts            # 作品数据
│   ├── skills.ts           # 能力数据
│   ├── articles.ts         # 期刊文章
│   ├── socials.ts          # 社交链接
│   ├── knowledge.ts        # 知识库数据 (笔记/文档/资源/技能树/私密笔记)
│   └── nav.ts              # 导航配置
└── next.config.ts          # Next.js 配置
```

## 本地开发

```bash
npm install
npm run dev
# 访问 http://localhost:3000
```

## 构建

```bash
npm run build
npm start
```

## 部署到 EdgeOne Makers

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. 在 EdgeOne Makers 中配置

1. 登录 [EdgeOne Makers](https://edgeone.ai/)
2. 创建新项目，选择 "从 GitHub 导入"
3. 选择本仓库
4. 构建配置：
   - **框架预设**: Next.js
   - **构建命令**: `npm run build`
   - **输出目录**: `.next`
   - **Node 版本**: 18+ (推荐 20)
5. 点击部署

### 3. 自动部署

配置完成后，每次 push 到 `main` 分支将自动触发部署。

### 大型媒体资源

视频、3D 模型等大型资源不上传到 GitHub，通过腾讯 COS 或 EdgeOne Blob 存储：

1. 上传资源到腾讯 COS / EdgeOne Blob
2. 获取 CDN URL
3. 在代码中引用 CDN URL

## 色板 (Toyism Master Palette)

| 名称 | 色值 | 用途 |
|------|------|------|
| Ink Navy | `#1A1B3A` | 替代纯黑，描边和深色背景 |
| Ocean | `#1656A3` | 深色背景 |
| Aqua | `#3DA9C9` | 标签、强调 |
| Forest | `#1B5E3F` | 深色背景 |
| Leaf | `#5BBA47` | 标签、成功状态 |
| Sun | `#FFD23F` | 高亮、CTA |
| Flame | `#F77F00` | 强调色 |
| Brick | `#D62828` | 错误、警告 |
| Pink | `#F26B83` | 标签、装饰 |
| Paper | `#F4ECD8` | 默认背景 |

## License

Personal use only.
