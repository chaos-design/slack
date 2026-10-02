# Slack

Slack 是一个面向 AI Agent 学习资料的 React 单页站点。项目按
`resources/` 目录组织主题资料，每个主题通过 `meta.json` 声明元数据，并提供
中英对照精读页（Studies）与配套 HTML 幻灯片（Slides）。前端在构建时自动扫描
这些资源，生成首页资料卡片、学习页侧边栏、搜索结果和幻灯片入口。

线上地址：[https://slack.chaosmic.cn/](https://slack.chaosmic.cn/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/chaos-design/slack)

## 当前资源

| 路由 id | 资料名称 | 来源 |
| --- | --- | --- |
| `01` | 构建高效 AI Agent | Anthropic |
| `02` | 构建 AI Agent 的实践指南 | OpenAI |
| `03` | Responses API 的计算机环境 | OpenAI |
| `04` | Claude Code 动态工作流 | Anthropic |
| `05` | AI Agent 上下文工程完整指南 | X / Rahul |
| `06` | 可自我修复的 Agent Harness | X / Akshay |
| `07` | Loop Engineering：AI Coding Agents 的新范式 | MindStudio |
| `07-2` | Long-running Claude：面向科学计算的长任务 Agent 工作流 | Anthropic |
| `07-3` | Breaking Down Context Engineering：拆解 Agent 上下文工程 | SwirlAI Newsletter |

## 核心功能

- **动态资料库**：通过 `resources/<id>/meta.json` 描述资料名称、简介、标签、
  来源和文件映射，页面自动生成首页资料卡片、学习页菜单和搜索结果。
- **多 study 目录**：单个资源目录可包含多个 studies；前端会将第 2 个及之后的
  study 映射为 `<id>-2`、`<id>-3` 等路由 id，并保留各自的来源元数据。
- **Studies 精读**：`resources/<id>/studies/*.html` 在 `/learn/:id` 页面中通过
  iframe 原样渲染，支持中英对照、词汇悬浮提示和来源图像。
- **Slides 演示**：`resources/<id>/slides/*.html` 会生成全屏演示入口，支持
  `/slides/:id` 和 `/slides/:id/:slug` 深链访问。
- **学习页体验**：学习页提供资料搜索、分组侧边栏、slide 入口、学习滚动位置保存，
  进入或刷新 `/learn/:id` 时会自动滚动侧边栏以显示当前激活项。
- **水墨视觉系统**：保留米纸背景、硬边卡片、朱砂强调色、浮动主题色选择器和适合
  中文阅读的排版。
- **可发布前端工程**：React 19、TypeScript、Vite 8、Tailwind CSS 4、Biome、
  Vitest、Vercel Analytics 和 Vercel SPA 部署配置均已接入。

## 技术栈

| 层级 | 工具 |
| --- | --- |
| Runtime | Node.js 24.x |
| Framework | React 19, TypeScript |
| Build | Vite 8 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4, shadcn/ui, Emotion |
| Icons | lucide-react |
| Analytics | Vercel Analytics |
| Lint / Format | Biome |
| Testing | Vitest, Testing Library, jsdom, V8 coverage |
| Package manager | pnpm 10.18.1 |
| Deploy | Vercel |
| License | Apache-2.0 |

## 环境要求

- **Node.js** 24.x（`package.json` 的 `engines.node`）。本地开发、CI 与 Vercel 构建统一使用 Node 24 LTS。
  该下限由依赖树决定：Vite 8 要求 `>=22.12.0`，Vitest 5 要求 `^22.12.0 || ^24.0.0 || >=26.0.0`；
  Node 20 已 EOL 且 Vercel 已于 2026-10-01 起弃用。
- **pnpm** 10，推荐通过 `corepack enable` 启用；精确版本见 `package.json`
  的 `packageManager` 字段。

## 本地开发

```bash
pnpm install
pnpm dev
```

开发服务器默认运行在 <http://localhost:5173>。

常用脚本：

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动 Vite 开发服务器 |
| `pnpm build` | TypeScript 检查并构建生产产物 |
| `pnpm preview` | 本地预览生产构建 |
| `pnpm lint` | 运行 Biome 检查 |
| `pnpm lint:fix` | 自动修复 Biome 可修复问题 |
| `pnpm format` | 格式化代码 |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:watch` | 以 watch 模式运行测试 |
| `pnpm test:coverage` | 生成测试覆盖率报告 |
| `pnpm verify:studies` | 校验精读页 HTML 与生成器输出逐字节一致（离线可用） |

## 项目结构

```text
.
├── .agents/                   # Trae / 通用 agent 适配入口，skills 文件指向 ../.skills
├── .claude/                   # Claude Code 适配入口
├── .codex/                    # Codex 适配入口
├── .github/                   # Issue 模板、PR 模板、CI 工作流和可调用 agents
├── .opencode/                 # OpenCode 适配入口
├── .skills/                   # 项目 skills 的真实目录
├── public/                    # Vite 静态资源
├── resources/                 # 学习资料库，构建时由 import.meta.glob 扫描
│   ├── 01/ ... 06/
│   │   ├── meta.json          # 主题名称、简介、标签和文件映射
│   │   ├── <slug>.md          # ai-doc-creator / web-markdown 中间稿
│   │   ├── artifacts/
│   │   │   └── data.json      # bilingual-reader 结构化数据
│   │   ├── studies/<slug>.html
│   │   └── slides/<slug>.html
│   └── 07/                    # 多 study 资源目录
│       ├── meta.json
│       ├── *.md
│       ├── artifacts/
│       ├── studies/*.html
│       └── slides/*.html
├── scripts/
│   └── generate-resource-slides.mjs # 统一生成当前资源的 HTML slides
├── src/
│   ├── components/
│   │   ├── layout/            # RootLayout、Header、Footer、Outlet
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── accent-picker.tsx  # 浮动主题色选择器
│   │   └── gradient-badge.tsx # Emotion 动态样式示例
│   ├── hooks/                 # 可复用 hooks 与测试
│   ├── lib/
│   │   ├── resources.ts       # 资源扫描、规范化、查询和搜索
│   │   ├── resources.test.ts
│   │   ├── resource-artifacts.test.ts
│   │   └── utils.ts
│   ├── pages/                 # home、learn、slides、about、not-found
│   ├── styles/globals.css     # Tailwind 4 CSS-first tokens 与全局样式
│   ├── routes.tsx             # 集中式路由表
│   ├── App.tsx                # 路由、AccentPicker、Analytics 挂载点
│   └── main.tsx               # BrowserRouter 入口
├── biome.json
├── components.json
├── skills-lock.json
├── vercel.json
├── vite.config.ts
└── tsconfig*.json
```

## 资料组织规范

新增知识时，推荐让 AI agent 使用 `ai-doc-creator` 技能完成资源目录、
`meta.json`、精读页和幻灯片的创建：

```text
ai-doc-creator <url / img / document content / file>
```

可传入的来源包括：

- `url`：文章、报告、官方文档、X / Twitter 内容等网页链接。
- `img`：截图、照片或图片路径。
- `document content`：直接粘贴的文章、笔记或长文本。
- `file`：本地 Markdown、PDF、Word、文本文件或其他可读取文档。

执行时，agent 会先确认是新建 `resources/<next-id>/`，还是写入已有
`resources/<id>/`；确认后再生成或更新：

- `resources/<id>/meta.json`
- `resources/<id>/<slug>.md`
- `resources/<id>/artifacts/data.json` 或按 slug 命名的 `*.data.json`
- `resources/<id>/studies/<slug>.html`
- `resources/<id>/slides/<slug>.html`

手动新增主题时，在 `resources/` 下创建一个新的编号目录，例如：

```text
resources/
└── 08/
    ├── meta.json
    ├── my-topic.md
    ├── artifacts/
    │   └── data.json
    ├── studies/
    │   └── my-topic.html
    └── slides/
        └── my-topic.html
```

`meta.json` 顶层必须是资源对象：

```json
{
  "id": "08",
  "source": "https://example.com/article",
  "sourceType": "url",
  "studies": [
    {
      "title": "文章标题",
      "name": "文章标题",
      "description": "基于原文生成的中英对照精读与配套幻灯片，覆盖核心概念与工程实践。",
      "tags": ["AI Agent", "工程实践"],
      "path": "my-topic",
      "language": "zh-CN",
      "createdAt": "2026-06-21 20:00:00",
      "updatedAt": "2026-06-21 20:00:00"
    }
  ],
  "slides": [
    {
      "id": "1",
      "path": "my-topic",
      "createdAt": "2026-06-21 20:00:00",
      "updatedAt": "2026-06-21 20:00:00"
    }
  ]
}
```

约定说明：

- `resources/<id>/meta.json` 是必需文件；顶层 `id` 是路由基础 id。
- `studies` 是精读页数组；每个条目的 `path` 关联 `studies/<path>.html`，
  只写文件名 slug，不写 `.html`。
- `slides` 是幻灯片数组；每个条目的 `path` 关联 `slides/<path>.html`，
  只写文件名 slug，不写 `.html`。
- 多 study 目录中，`studies[n].source` 和 `studies[n].sourceType` 可覆盖目录级来源；
  如果未填写，则继承顶层 `source` 与 `sourceType`。
- 新增中间稿应使用 `resources/<id>/<slug>.md`；不要生成或依赖
  `resources/<id>/source.md`。
- 精读页结构化数据放在 `resources/<id>/artifacts/`；重新生成 studies 后要保证
  `data.json` 或 `*.data.json` 与 HTML 中的中文富文本结构同步。
- HTML 资源应尽量自包含，避免外部 CDN、运行时 fetch 或需要登录的资源。
- 前端不会解析资源 HTML 内部结构，Studies 与 Slides 都通过 iframe 原样渲染。

## 资源生成与校验

精读页由 `.skills/bilingual-reader` 生成，产物需要保持 Markdown 中间稿、结构化
`data.json` 和 HTML 的一致性。涉及 studies 重生成时，建议运行：

```bash
python3 .skills/bilingual-reader/scripts/review_artifacts.py \
  --markdown resources/<id>/<slug>.md \
  --data resources/<id>/artifacts/data.json \
  --html resources/<id>/studies/<slug>.html
```

幻灯片由 `.skills/content-slides` 规范约束；当前批量生成入口是：

```bash
node scripts/generate-resource-slides.mjs
```

当前 slide 产物遵循固定 16:9 stage、底部 hover 控制区、键盘翻页、触摸/滚轮导航、
图片 lightbox、内联编辑和来源图片 `data:image` 嵌入等约定。资源 HTML 与 `.skills/`
已在 Biome 中排除，质量由生成脚本、人工检查和 `src/lib/resource-artifacts.test.ts`
锁定。

## 路由

| 路径 | 页面 |
| --- | --- |
| `/` | 首页，展示项目介绍与资料库卡片 |
| `/about` | 项目说明 |
| `/learn` | 自动跳转到第一个可读资料 |
| `/learn/:id` | 指定资料的 Studies 精读页，支持 `07-2` 等多 study 路由 |
| `/slides/:id` | 指定资料的第一份 Slide |
| `/slides/:id/:slug` | 指定资料的指定 Slide |
| `*` | 404 页面 |

SPA 深链由 `vercel.json` 的 rewrites 规则统一回退到 `index.html`。

## 样式约定

- 优先使用 Tailwind utility classes 和 `src/components/ui/` 下的 shadcn/ui
  primitives。
- Tailwind 4 使用 CSS-first 配置，设计 token 位于 `src/styles/globals.css`，
  没有 `tailwind.config.ts`。
- 项目内本地导入使用相对路径，不使用 `@/` 等路径别名。
- 动态或一次性样式可使用 Emotion；示例见
  `src/components/gradient-badge.tsx`。
- 主题色由 `src/hooks/use-accent.ts` 管理，并通过浮动
  `src/components/accent-picker.tsx` 持久化到 `localStorage`。

## 质量检查

提交前建议运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

涉及测试覆盖率、资源扫描或 HTML 产物合约时，优先运行：

```bash
pnpm test:coverage
```

覆盖率门禁在 `vite.config.ts` 中配置：statements、functions、lines 不低于 90%，
branches 不低于 75%。CI 工作流位于 `.github/workflows/ci.yml`，默认在 Node 22
环境执行 lint、typecheck、coverage 测试和生产构建。

## 部署到 Vercel

### 一键部署

点击顶部的 **Deploy with Vercel** 按钮，Vercel 会按 `vercel.json` 识别 Vite
项目并使用以下配置：

- Build command: `pnpm build`
- Output directory: `dist`
- Install command: `pnpm install --frozen-lockfile`
- Framework preset: Vite

### Git 导入

1. 将仓库推送到 GitHub。
2. 在 [vercel.com/new](https://vercel.com/new) 导入仓库。
3. 确认 Vercel 自动识别上述构建配置。
4. 部署后，每次推送 `main` 会触发生产部署，Pull Request 会生成预览部署。

## Agent 指南

项目级开发约定见 [AGENTS.md](AGENTS.md)。项目 skills 的真实目录是 `.skills/`；
`.agents/skills`、`.claude/skills`、`.codex/skills`、`.opencode/skills` 和
`.trae/skills` 是跨编辑器适配文件，内容指向 `../.skills`。

## License

[Apache-2.0](LICENSE)
