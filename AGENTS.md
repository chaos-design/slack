# AGENTS.md

本文档面向参与本仓库开发的工程师和 AI coding agents，说明项目真实架构、核心模块、协作规则与交付检查。修改代码或新增资料前请先阅读本文，并优先遵循仓库已有实现方式。

## 项目概述

Slack 是一个面向 AI Agent 学习资料的 React 单页应用。项目按 `resources/` 目录组织主题资料，每个主题通过 `meta.json` 声明元数据，并提供中英对照精读页 `studies/*.html` 与配套幻灯片 `slides/*.html`。前端在构建时使用 `import.meta.glob` 扫描这些资源，自动生成首页资料卡片、学习页侧边栏、搜索结果和幻灯片入口。

技术栈：

| 层级 | 当前选择 |
| --- | --- |
| Runtime | Node.js `>=20.19.0`，pnpm `10.18.1` |
| Frontend | React 19, TypeScript, React Router 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 CSS-first, shadcn/ui, Emotion |
| Icons / Analytics | lucide-react, Vercel Analytics |
| Quality | Biome, TypeScript strict mode |
| Testing | Vitest, Testing Library, jsdom, V8 coverage |
| Deploy | Vercel, SPA rewrites |

## 目录结构

```text
.
├── .agents/                   # Trae / 通用 agent 适配入口，skills 文件指向 ../.skills
├── .claude/                   # Claude Code 适配入口，skills 文件指向 ../.skills
├── .codex/                    # Codex 适配入口，skills 文件指向 ../.skills
├── .github/                   # Issue / PR 模板、CI workflow 与可调用 agents
│   └── agents/
│       └── resource-creator.agent.md
├── .opencode/                 # OpenCode 适配入口，skills 文件指向 ../.skills
├── .skills/                   # 项目 skills 的真实目录
├── public/                    # Vite 静态资源
├── resources/                 # 学习资料库，构建时扫描
│   ├── 01/ ... 06/
│   │   ├── meta.json
│   │   ├── <slug>.md          # ai-doc-creator / web-markdown 中间稿
│   │   ├── artifacts/
│   │   │   └── data.json      # bilingual-reader 结构化数据
│   │   ├── studies/*.html
│   │   └── slides/*.html
│   └── 07/                    # 多 study 资源目录
│       ├── meta.json
│       ├── *.md
│       ├── artifacts/
│       ├── studies/*.html
│       └── slides/*.html
├── scripts/
│   └── generate-resource-slides.mjs # 当前资源的 HTML slides 统一生成入口
├── src/
│   ├── components/
│   │   ├── layout/            # RootLayout、Header、Footer、Outlet
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── accent-picker.tsx  # 浮动主题色选择器
│   │   └── gradient-badge.tsx # Emotion 动态样式组件
│   ├── hooks/                 # 可复用 hooks 与同目录测试
│   ├── lib/
│   │   ├── resources.ts       # 资源扫描、规范化、查询、搜索
│   │   └── utils.ts           # cn 等通用工具
│   ├── pages/                 # 路由页面
│   ├── styles/globals.css     # Tailwind 4 tokens 与全局水墨视觉系统
│   ├── App.tsx                # 路由挂载、AccentPicker、Analytics
│   ├── main.tsx               # BrowserRouter 入口
│   └── routes.tsx             # 集中路由表
├── biome.json                 # Biome lint / format / organize imports
├── components.json            # shadcn/ui 配置
├── skills-lock.json           # skills 版本锁定信息
├── package.json               # 脚本、依赖、Node/pnpm 版本
├── vercel.json                # Vercel 构建与 SPA rewrites
├── vite.config.ts             # Vite、Vitest、Emotion JSX runtime
└── tsconfig*.json             # TypeScript project references
```

## 核心模块

### 应用入口与路由

`src/main.tsx` 使用 `BrowserRouter` 挂载 `App`。`src/App.tsx` 通过 `useRoutes(routes)` 渲染路由，并在非 `/slides/*` 页面显示 `AccentPicker`，同时挂载 Vercel Analytics。

路由集中定义在 `src/routes.tsx`：

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | `HomePage` | 首页、功能介绍、资料库卡片 |
| `/about` | `AboutPage` | 项目说明 |
| `/learn` | `LearnPage` | 自动跳转到第一个可读资源 |
| `/learn/:id` | `LearnPage` | 指定资源的 Studies 精读页 |
| `/slides/:id` | `SlidesPage` | 指定资源的第一份幻灯片 |
| `/slides/:id/:slug` | `SlidesPage` | 指定资源的指定幻灯片 |
| `*` | `NotFoundPage` | 404 页面 |

`/`、`/about`、`*` 位于 `RootLayout` 下，包含统一 Header / Footer。`/learn*` 与 `/slides*` 是沉浸式页面，不使用统一布局；`/slides*` 以全屏 iframe 呈现 HTML 幻灯片。

### 资源加载与数据模型

`src/lib/resources.ts` 是资料库的核心。它通过三个 eager glob 在构建期加载资源：

```ts
import.meta.glob("../../resources/*/meta.json", { eager: true, import: "default" });
import.meta.glob("../../resources/*/studies/*.html", {
  eager: true,
  query: "?url",
  import: "default",
});
import.meta.glob("../../resources/*/slides/*.html", {
  eager: true,
  query: "?url",
  import: "default",
});
```

模块负责：

- 从路径中提取资源文件夹 id 与 HTML slug。
- 将 `resources/<id>/meta.json` 规范化为 `ResourceItem[]`。
- 按 `studies[].path` 查找精读页 URL，按 `slides[].path` 过滤幻灯片。
- 支持单目录多 study：第一个 study 使用目录 id，后续 study 使用 `<id>-2`、`<id>-3` 等路由 id。
- 多 study 目录中，`studies[].source` / `studies[].sourceType` 优先于目录级来源；未填写时继承顶层来源。
- 提供 `getResources()`、`getResourceById()`、`getSlide()`、`searchResources()`。

`meta.json` 顶层必须是资源对象：

```json
{
  "id": "03",
  "source": "https://example.com/article",
  "sourceType": "url",
  "studies": [
    {
      "title": "标题",
      "name": "展示名称",
      "description": "资源简介",
      "tags": ["AI Agent"],
      "path": "study-slug",
      "language": "zh-CN",
      "createdAt": "2026-06-14 14:16:32",
      "updatedAt": "2026-06-14 14:16:32"
    }
  ],
  "slides": [
    {
      "id": "1",
      "path": "slide-slug",
      "createdAt": "2026-06-14 14:16:32",
      "updatedAt": "2026-06-14 14:16:32"
    }
  ]
}
```

时间以 UTC+8 时间区。

约定：

- `studies[].path` 对应 `resources/<id>/studies/<path>.html`，不写 `.html`。
- `slides[].path` 对应 `resources/<id>/slides/<path>.html`，不写 `.html`。
- `resources/<id>/<slug>.md` 是 ai-doc-creator / web-markdown 中间稿；不要使用旧式 `resources/<id>/source.md`。
- `resources/<id>/artifacts/data.json` 或按 slug 命名的 `*.data.json` 是 bilingual-reader 结构化数据，重渲染 studies 后必须与 HTML 中的中文富文本结构同步。
- `name`、`description`、`tags` 用于首页、学习页菜单和搜索。
- 前端不解析资源 HTML 内容，Studies 与 Slides 都通过 iframe 原样渲染。
- `resources/` 与 `.skills/` 被 Biome 排除，资源 HTML 与技能模板的质量由生成流程、人工检查、`review_artifacts.py` 和 `src/lib/resource-artifacts.test.ts` 保证。

### 页面模块

- `src/pages/home.tsx`：展示项目定位、核心功能和 `getResources()` 生成的资料卡片。
- `src/pages/learn.tsx`：学习页主工作台。按 `folderId` 分组资源，左侧显示资料菜单和 slide 入口；主区域 iframe 渲染精读 HTML；搜索浮层调用 `searchResources()` 按名称、简介、标签过滤；进入或刷新 `/learn/:id` 时自动将当前激活项滚动到侧边栏可视区，并在跳转 slide 前保存学习区与侧边栏滚动位置。
- `src/pages/slides.tsx`：全屏 slide 容器。根据 `id` 与可选 `slug` 查找幻灯片，支持 Escape 返回对应学习页。
- `src/components/layout/root-layout.tsx`：主页与说明页的共享布局，包含 sticky Header、导航、Footer 与 GitHub 链接。

### 资源生成脚本与产物测试

`scripts/generate-resource-slides.mjs` 是当前资源 slides 的统一生成入口。脚本按资源 id 配置独立的内容 brief、视觉 profile、style preset、主题色、图片选取和多模块布局规则，产物遵循 `.skills/content-slides` 的固定 16:9 stage、底部 hover 控制区、键盘翻页、触摸/滚轮导航、图片 lightbox、内联编辑和来源图片 `data:image` 嵌入约定。

`src/lib/resource-artifacts.test.ts` 负责锁定资源产物合约，包括：

- Markdown 中间稿按文章 slug 命名，且不存在 `resources/<id>/source.md`。
- studies 保留词汇悬浮提示 runtime、来源图像和关键术语。
- slides 保持最新控制器合约、互不重复的设计 profile、平衡网格、多页内容密度和离线图片嵌入。
- 外部图片 URL、模板化图义说明和外部 CDN 不应进入 HTML 产物。

### 样式与交互

全局样式在 `src/styles/globals.css`。项目采用 Tailwind CSS 4 CSS-first 配置，设计 token 使用 `@theme inline` 暴露，未使用 `tailwind.config.ts`。

当前视觉系统是水墨风格：米纸背景、焦墨文字、硬边卡片、偏移阴影、朱砂/墨青强调色。主题色由 `src/hooks/use-accent.ts` 管理，并由 `src/components/accent-picker.tsx` 持久化到 `localStorage`。

样式优先级：

1. Tailwind utility classes。
2. `src/components/ui/` 中的 shadcn/ui primitives。
3. Emotion，仅用于动态或一次性样式，例如 `gradient-badge.tsx`。

### Agent Skills

项目 skills 的真实目录是 `.skills/`。`.agents/skills`、`.claude/skills`、`.codex/skills`、`.opencode/skills` 与 `.trae/skills` 是跨编辑器适配文件，内容指向 `../.skills`，用于让不同 coding agent 发现同一套项目技能。

可调用 agent 位于 `.github/agents/`。新增资源时优先调用 `resource-creator` agent，它会加载 `ai-doc-creator`，再按需交给 `bilingual-reader` 与 `content-slides` 完成 resources 创建。

当前项目 skills：

| Skill | 用途 |
| --- | --- |
| `ai-doc-creator` | 新增知识资料的统一入口，负责资源目录确认、meta、studies、slides |
| `bilingual-reader` | 生成离线中英对照精读页 |
| `content-slides` | 生成自包含 16:9 HTML 幻灯片 |
| `frontend-design` | 高质量前端视觉设计 |
| `frontend-dev` | React 页面、组件、hooks、路由开发约定 |
| `web-markdown` | 将网页或文档内容整理为 Markdown 中间稿 |
| `x-tweet-fetcher` | 获取 X / Twitter 内容并转为可追溯素材 |

新增知识时优先使用：

```text
ai-doc-creator <url / img / document content / file>
```

该流程必须先确认创建新 `resources/<id>/` 还是复用已有目录，再生成或更新 `meta.json`、`studies/<slug>.html`、`slides/<slug>.html`。

#### Resource Creator Agent

`resource-creator` agent 的入口文件：

```text
.github/agents/resource-creator.agent.md
```

调用方式：

```text
resource-creator <url / img / document content / file>
```

该 agent 只负责新增或更新 `resources/` 学习资料。执行时必须先读取 `.skills/ai-doc-creator/SKILL.md`，确认来源、生成类型和资源目录，再创建或更新 `meta.json`、`studies/<slug>.html`、`slides/<slug>.html`。如果用户没有提供来源，或指定的目录不存在，必须停止并要求补充信息。

#### 通过 ai-doc-creator 创建 resources

`ai-doc-creator` 的技能目录固定为：

```text
.skills/ai-doc-creator
```

当用户提供 URL、图片、本地文件或粘贴文本，并希望生成学习资料、双语精读、slides、PPT 或 HTML deck 时，应按以下顺序执行：

1. 读取 `.skills/ai-doc-creator/SKILL.md`，以该文件定义的工作流为准。
2. 规范化来源：URL 只去除首尾空白和末尾单个 `/`；文件、图片和文本应记录可追溯来源。
3. 明确生成类型：只生成 `studies`、只生成 `slides`，或同时生成两者。
4. 让用户确认资源目录：新建 `resources/<next-id>/`，或复用某个已存在的 `resources/<id>/`。
5. 新建目录时扫描 `resources/` 下的编号目录，取最大编号加一；当前已有 `01` 至 `07`，下一项通常是 `08`。
6. 确保目标目录包含 `meta.json`，并按生成类型创建 `studies/` 或 `slides/` 子目录。
7. 根据来源标题生成 slug，中间稿写入 `resources/<id>/<slug>.md`，结构化数据写入 `resources/<id>/artifacts/`，目标 HTML 分别写入 `studies/<slug>.html` 与 `slides/<slug>.html`。
8. 更新 `meta.json`，保持顶层资源对象结构，并让 `studies[].path`、`slides[].path` 与 HTML 文件名严格一致。
9. 生成内容时继续调用对应 skill：精读页交给 `bilingual-reader`，幻灯片交给 `content-slides`。
10. `ai-doc-creator` 只固定输出路径和资源映射，不固定 studies 或 slides 的模板；模板由对应技能按来源内容动态选择，除非用户明确指定。
11. 完成后核对 `src/lib/resources.ts` 能消费该结构：`path` 不带 `.html`，`id` 与目录编号一致，`sourceType` 合法；多 study 目录需要核对每个 study 的路由 id、来源和 slide 映射。
12. 重生成 studies 后运行 `python3 .skills/bilingual-reader/scripts/review_artifacts.py --markdown resources/<id>/<slug>.md --data resources/<id>/artifacts/data.json --html resources/<id>/studies/<slug>.html`；涉及多 study 目录时将 `--data` 指向对应的 `<slug>.data.json`，涉及 slides 或资源合约时运行相关单元测试。

示例：

```text
ai-doc-creator https://example.com/article
```

期望产物：

```text
resources/04/
├── meta.json
├── article-title.md
├── artifacts/
│   └── data.json
├── studies/
│   └── article-title.html
└── slides/
    └── article-title.html
```

对应 `meta.json` 中应写：

```json
{
  "id": "04",
  "source": "https://example.com/article",
  "sourceType": "url",
  "studies": [
    {
      "title": "文章标题",
      "name": "文章标题",
      "description": "资料简介",
      "tags": ["AI Agent"],
      "path": "article-title",
      "language": "zh-CN",
      "createdAt": "2026-06-19T00:00:00Z",
      "updatedAt": "2026-06-19T00:00:00Z"
    }
  ],
  "slides": [
    {
      "id": "1",
      "path": "article-title",
      "createdAt": "2026-06-19T00:00:00Z",
      "updatedAt": "2026-06-19T00:00:00Z"
    }
  ]
}
```

#### resources 边界场景与规避

| 边界场景 | 规避方式 |
| --- | --- |
| 用户未提供来源 | 停止创建，要求补充 URL、文件、图片或文本内容。 |
| 用户给出已存在 URL | 不按 `source` 自动复用目录；仍需询问新建还是复用已有资源。 |
| 用户指定目录不存在 | 不自动猜测目录；要求重选已有目录或确认新建。 |
| 目标 HTML 文件已存在 | 不覆盖；追加最小后缀，例如 `topic-2.html`、`topic-3.html`。 |
| 标题为空或无法提取 | URL 使用最后一个有意义路径片段；文件和文本使用简短语义 slug。 |
| 标题含非法路径字符 | 将 `/ \ : * ? " < > |` 和空白转为 `-`，合并连续 `-`，去掉首尾标点。 |
| slug 过长 | 控制在约 60 字符以内，确保可读且稳定。 |
| 误生成 `source.md` | 改为 `resources/<id>/<slug>.md`，并删除错误产物。 |
| 只生成精读页 | 仍保留顶层 `slides` 字段，可为空数组；只写 `studies[].path`。 |
| 只生成幻灯片 | 仍保留顶层 `studies` 字段，可为空数组；只写 `slides[].path`。 |
| `meta.json` 不是顶层资源对象 | 先修正结构，再追加 `studies` 或 `slides`，避免写成数组或嵌套对象。 |
| `path` 写入了 `.html` | 必须移除扩展名；前端会自行关联 `studies/<path>.html` 与 `slides/<path>.html`。 |
| 多个 studies 在同一目录 | `src/lib/resources.ts` 会生成 `id`、`id-2` 等资源项；确认路由、展示名称、来源和 slide 映射可区分。 |
| `data.json` 与 HTML 结构不同步 | 重新运行 bilingual-reader 流程，并用 `review_artifacts.py` 复核哈希与结构。 |
| 资源 HTML 依赖外部运行时 | 生成自包含 HTML，避免不可控 fetch、CDN 或需要登录的资源。 |
| slides 使用占位图或外链图片 | 使用来源图片并嵌入 `data:image`；不得使用占位图或外部图片 URL。 |
| 来源内容不足或版权不明确 | 不补写事实；只基于可见来源生成，并在交付说明中标明限制。 |

## 开发规范

### 命名与文件

- `src/` 内只写 TypeScript / TSX，不新增普通 `.js` 源文件。
- 文件名统一小写并使用连字符，例如 `use-accent.ts`、`root-layout.tsx`。
- 函数和 hooks 使用 lowerCamelCase，例如 `searchResources()`、`useAccent()`。
- React 组件使用 PascalCase 标识符，但文件仍保持 hyphen-case。
- 项目内导入使用相对路径，不使用 `@/` 等路径别名。

### TypeScript 与组件

- 遵循 `strict`、`noUnusedLocals`、`noUnusedParameters`。
- 共享逻辑优先放入 `src/lib/` 或 `src/hooks/`，并补充同目录测试。
- 非平凡 UI 逻辑应拆出可测试函数或 hook，避免把复杂数据处理堆在 JSX 中。
- 组合 className 使用 `cn()`，它位于 `src/lib/utils.ts`，负责 `clsx` 与 `tailwind-merge`。

### 测试

- 测试文件与源码同目录，命名为 `*.test.ts` 或 `*.test.tsx`。
- Vitest 已启用 globals，不需要在每个测试文件导入 `describe`、`it`、`expect`。
- 组件测试使用 `@testing-library/react`；hooks 使用 `renderHook`。
- 修改逻辑时至少覆盖正例、反例和边界条件。
- 覆盖率门禁由 `vite.config.ts` 管理：statements、functions、lines 不低于 90%，
  branches 不低于 75%。优先运行 `pnpm test:coverage` 检查。

### 资源内容

- 不伪造来源、图片、引用或文档内容。
- HTML 资源应自包含，避免依赖运行时 fetch、外部 CDN 或登录态资源。
- slides 不显示 “generated by”、生成时间等元数据；带图页必须使用具体图义说明，不使用“对应来源图”等模板化表达。
- 多模块 slide 使用平衡网格：4 个模块用 2x2，5 个模块用 3+2，7 个模块用 4+3；单页最多 4 个主要模块，超出应拆页。
- 新增资源目录时使用递增编号，例如当前下一项通常为 `resources/08/`。
- `meta.json` 必须能被 `src/lib/resources.ts` 当前类型正确消费。
- 重生成 studies 时要同步维护 `artifacts/data.json` 或 `*.data.json` 的 `zhHtml` 字段，确保中文侧列表、加粗、引用等富文本结构与 HTML 保持一致。

## 常用命令

```bash
pnpm install        # 安装依赖
pnpm dev            # 启动 Vite 开发服务器
pnpm lint           # Biome 检查
pnpm lint:fix       # Biome 自动修复
pnpm format         # 格式化代码
pnpm typecheck      # TypeScript 类型检查
pnpm test           # 运行单元测试
pnpm test:coverage  # 运行覆盖率测试
pnpm build          # 类型检查并构建生产产物
pnpm preview        # 本地预览 dist
```

## 交付检查

完成代码变更前必须运行并通过：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

涉及测试覆盖率、核心逻辑或资源扫描行为时，同时运行：

```bash
pnpm test:coverage
```

CI 位于 `.github/workflows/ci.yml`，在 Node 22 环境中执行 lint、typecheck、coverage test 和 production build。

## 协作流程

1. 明确变更类型：页面/组件、资源内容、skill、配置、部署。
2. 先阅读相关模块，沿用当前目录边界和代码风格。
3. 小步修改，避免混入无关重构。
4. 修改逻辑时同步新增或更新测试。
5. 修改资源时同步维护 `meta.json` 与对应 HTML 文件。
6. 修改部署、构建或输出目录时同步更新 `README.md` 与本文件。
7. 运行交付检查，记录无法运行的原因和环境缺口。

## 部署说明

生产部署由 `vercel.json` 管理：

- Framework: `vite`
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `dist`
- SPA fallback: `/(.*)` rewrite 到 `/index.html`

不要在未同步更新 README 和部署说明的情况下修改构建命令、输出目录或 rewrite 策略。
