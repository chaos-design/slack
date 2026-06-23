import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const resourcesDir = join(rootDir, "resources");
const generatedAt = formatUtc8Date(new Date());

const resourceRules = {
  "01": {
    profile: "paper-ink-complexity-ladder",
    preset: "Paper & Ink",
    className: "theme-paper",
    eyebrow: "Anthropic 工程原则",
    title: "从简单模式走向可靠 Agent",
    subtitle:
      "这份 deck 按原文的复杂度阶梯展开：增强型 LLM、固定 workflow、动态 agent，所有结论都回到评估与透明度。",
    thesis: "复杂度必须由评估证明，而不是由架构欲望驱动。",
    agenda: [
      "增强型 LLM",
      "Prompt chaining",
      "Routing",
      "Parallelization",
      "Orchestrator-workers",
      "Evaluator-optimizer",
      "Agents",
    ],
    sectionIndexes: [1, 2, 4, 6, 7, 8, 9, 10, 11],
    imageIndexes: [0, 1, 2, 4, 5, 6],
    theme: lightTheme("#faf9f7", "#f0e4d2", "#201713", "#69594e", "#c41e3a", "#9f6b22"),
  },
  "02": {
    profile: "electric-agent-operating-model",
    preset: "Electric Studio",
    className: "theme-electric",
    eyebrow: "OpenAI Agent 指南",
    title: "把 Agent 设计成可控工作流",
    subtitle:
      "原文的重点不是“多自治”，而是先筛选场景，再用模型、工具、指令、eval、guardrails 和人工介入建生产边界。",
    thesis: "Agent 的价值来自动态执行；生产可靠性来自清晰护栏。",
    agenda: ["Agent 边界", "适用边界", "最小系统", "模型策略", "工具设计", "指令设计", "编排模式"],
    sectionIndexes: [0, 1, 2, 3, 4, 5, 8],
    imageIndexes: [0, 1, 2, 3],
    visualNarratives: [
      {
        caption: "Agent 工作流的核心不是一次回答，而是由模型在工具和护栏之间推进任务。",
        explanation:
          "这张图用于界定 OpenAI 所说的 Agent：输入进入后，模型不只是生成文本，而是在可停止、可交还控制权的流程中选择工具、执行步骤并产出结果。",
      },
      {
        caption: "Manager-worker 模式把控制权集中在一个协调 Agent 上。",
        explanation:
          "图中 Manager 负责拆解任务、调用专业 worker 并整合结果；它适合需要统一决策和全局状态管理的复杂工作流，而不是默认的第一步架构。",
      },
      {
        caption: "去中心化交接适合有清晰专业边界的支持或服务流程。",
        explanation:
          "图中的 triage agent 会把请求转交给 billing、refund、technical support 等专业 Agent；这种模式的前提是交接规则明确，且每个 Agent 只暴露必要工具。",
      },
      {
        caption: "Guardrails 是请求路径中的运行机制，不是发布后的附加检查。",
        explanation:
          "图中用户输入、Agent 执行、工具调用和最终输出都经过不同护栏；这对应原文的生产建议：相关性、安全、PII、工具风险和输出校验要分层放入主路径。",
      },
    ],
    theme: darkTheme("#070a12", "#111827", "#f8fbff", "#b7c5df", "#4361ee", "#ffffff"),
  },
  "03": {
    profile: "neon-computer-environment-stack",
    preset: "Neon Cyber",
    className: "theme-neon",
    eyebrow: "Responses API 计算环境",
    title: "给 Agent 一个真正可执行的工作台",
    subtitle:
      "Shell tool、托管容器、文件系统、数据库、受控网络、skills 与 compaction 共同构成可执行的 Agent 环境。",
    thesis: "Responses API 的关键变化，是把模型从文本生成器推进到可执行环境的协调者。",
    agenda: [
      "核心转变",
      "总体方案",
      "Shell Tool",
      "Agent Loop",
      "并发与输出控制",
      "Compaction",
      "文件系统",
      "Network Access",
      "Skills",
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6, 8, 9],
    imageIndexes: [0, 1, 3, 4, 5, 6, 7],
    visualNarratives: [
      {
        caption: "Shell tool 只是工具之一，关键是 Responses API 负责把模型提议转成受控执行。",
        explanation:
          "这张结构图说明模型并不直接执行命令；Responses API 在隔离容器中执行 shell 调用，再把输出带回循环，形成可重复、可审计的 Agent 工作流。",
      },
      {
        caption: "Agent loop 把模型输出、命令执行和工具响应连接成闭环。",
        explanation:
          "图中循环对应原文的核心机制：模型提出下一步，平台运行工具，结果再回到模型，直到没有新的 shell command 需要执行。",
      },
      {
        caption: "容器上下文让文件、数据库和策略受控网络成为模型的工作台。",
        explanation:
          "图中 runtime container 承载文件系统、SQLite、skills 与网络策略；这比把所有输入塞进 prompt 更适合多步任务，因为模型可以按需打开和查询资源。",
      },
      {
        caption: "受控联网依赖 egress proxy，而不是让容器无限访问外网。",
        explanation:
          "图中的 proxy 层表达了原文的安全边界：联网能力需要 allowlist、域名策略、审计和超时控制，避免 shell tool 把执行环境变成无约束浏览器。",
      },
      {
        caption: "Skills 把重复流程打包成可确定加载的运行时能力。",
        explanation:
          "图中 registry、bundle 和 runtime 的关系说明 skills 不是提示词片段的堆叠，而是把指令、脚本和资源按需放入容器，降低重复上下文成本。",
      },
      {
        caption: "技能加载需要 registry、bundle 与 runtime 之间的确定路径。",
        explanation:
          "这张图补充说明 skills 的执行边界：平台先从 registry 解析能力，再把必要脚本和资源带入容器，最后由模型按任务需要调用。",
      },
    ],
    theme: darkTheme("#07111f", "#0e1830", "#e9fbff", "#9ac8d8", "#22d3ee", "#f472b6"),
  },
  "04": {
    profile: "swiss-dynamic-harness",
    preset: "Swiss Modern",
    className: "theme-swiss",
    eyebrow: "Claude Code Dynamic Workflows",
    title: "让 Claude 为任务生成专用 harness",
    subtitle:
      "动态工作流把长任务、多代理、对抗式验证和循环执行从单一上下文中拆出来，形成可恢复、可验证的临时 harness。",
    thesis: "当任务本身需要结构时，让工作流结构显式存在。",
    agenda: [
      "Dynamic workflows",
      "Failure modes",
      "Dynamic vs static",
      "Workflow patterns",
      "高价值用例",
      "适用边界",
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 5],
    imageIndexes: [0, 1, 2, 3, 4, 5, 6],
    visualNarratives: [
      {
        caption: "Dynamic workflows 让 Claude 生成一个贴合任务的 JavaScript harness。",
        explanation:
          "图中 workflow 文件通过特殊函数协调多个子代理，说明重点不是固定模板，而是让 Claude 为当前任务显式写出可运行、可修改的编排结构。",
      },
      {
        caption: "专用 harness 用隔离上下文和显式检查减少长任务退化。",
        explanation:
          "图中任务专属 harness 替代默认流程，对应原文的三类失败模式：agentic laziness、self-preferential bias 与 goal drift。",
      },
      {
        caption: "常见 workflow pattern 可以组合成任务专用 harness。",
        explanation:
          "图中模式库不是最终答案，而是 Claude 生成动态工作流时可复用的构件：并行探索、投票、分治、验证、循环和路由都可按任务重组。",
      },
      {
        caption: "Deep verification 把事实声明拆出来，再交给独立代理验证。",
        explanation:
          "图中验证流程对应原文的高价值场景：先识别需要核查的 claims，再用独立上下文逐条验证，降低模型偏好自己答案的风险。",
      },
      {
        caption: "排序工作流可用 pairwise comparison、tournament 或 bucket 逐步收敛。",
        explanation:
          "图中排序结构说明 dynamic workflows 适合无法一次性判断的大规模候选集；关键是把比较、聚合和复核做成显式流程。",
      },
      {
        caption: "记忆与规则遵循工作流会从反复纠正中提炼稳定规则。",
        explanation:
          "这张图对应高价值用例中的 memory and rule adherence：动态工作流可以收集 recurring corrections，把它们沉淀为后续代理可遵守的规则。",
      },
    ],
    theme: lightTheme("#f7f7f2", "#e9e7dc", "#111111", "#4b4b4b", "#ff3300", "#111111"),
  },
  "05": {
    profile: "notebook-context-engineering",
    preset: "Notebook Tabs",
    className: "theme-notebook",
    eyebrow: "Context Engineering Playbook",
    title: "把上下文窗口当成工作记忆来设计",
    subtitle:
      "这组 slides 按原帖的失败模式和四类策略组织：Write、Select、Compress、Isolate，不把大窗口误当无限仓库。",
    thesis: "Agent 退化往往不是模型变差，而是上下文组织失控。",
    agenda: [
      "症状",
      "上下文窗口",
      "七类竞争内容",
      "四类核心策略",
      "压缩与隔离",
      "失败模式",
      "Agent 系统提示词",
      "KV-cache",
    ],
    sectionIndexes: [0, 2, 3, 4, 5, 6, 7, 8],
    imageIndexes: [0, 1, 2, 3, 5, 7, 10],
    visualNarratives: [
      {
        caption: "上下文工程的目标是在正确时间给模型正确格式的信息。",
        explanation:
          "这张开场图支撑原文主张：Agent 退化的根因往往不是模型突然变弱，而是上下文窗口里可见信息的选择、顺序和密度失控。",
      },
      {
        caption: "上下文窗口像 RAM：能看到什么，决定模型下一步能推理什么。",
        explanation:
          "图中 RAM 类比强调窗口不是无限仓库；随着工具输出、历史消息和检索内容累积，模型会在达到硬上限前就出现性能退化。",
      },
      {
        caption: "七类内容同时争用有限窗口，工程任务是决定谁进入当前步骤。",
        explanation:
          "图中列出的 system prompt、tool definitions、tool results、RAG、history、memory 和 agent state 共同解释为什么简单扩大窗口不能自动解决质量问题。",
      },
      {
        caption: "四类策略分别处理遗忘、过载、累积和污染。",
        explanation:
          "图中 Write、Select、Compress、Isolate 是原文的主框架：把信息写到外部、只选择当前所需、压缩累积内容、隔离不同任务上下文。",
      },
      {
        caption: "Select 的核心不是检索更多，而是只给当前步骤真正需要的内容。",
        explanation:
          "这张策略图对应 Select：系统需要在 token 预算内做相关性排序、过滤和按需取回，否则 RAG 与工具结果会把模型推向低质量决策。",
      },
      {
        caption: "Isolate 通过分离上下文窗口减少跨阶段污染。",
        explanation:
          "图中隔离策略对应多 Agent、子任务和阶段化工作流：研究阶段的噪声不应污染实现阶段，验证上下文也应独立于生成上下文。",
      },
      {
        caption: "KV-cache 让稳定前缀与动态尾部的排序变成成本和延迟问题。",
        explanation:
          "这张图对应原文的工程建议：系统提示词和工具定义等稳定内容放在顶部，当前状态与历史等动态内容放在底部，避免频繁破坏缓存前缀。",
      },
    ],
    theme: lightTheme("#fbf4e8", "#efe4d1", "#1c1b22", "#5e5660", "#516cf6", "#e85d8f"),
  },
  "06": {
    profile: "copper-repair-flywheel",
    preset: "Dark Botanical",
    className: "theme-copper",
    eyebrow: "Agent Harness Observability",
    title: "把 Trace 之后的修复流程自动化",
    subtitle:
      "原帖把生产 Agent 的可观测性推进到闭环：trace、Ollie 诊断、受控修复、Sandbox 验证和 Test Suites 回归沉淀。",
    thesis: "生产失败不该停在仪表盘；它应该进入可验证的修复飞轮。",
    agenda: ["生产失败", "观测断点", "Opik", "Tracing", "Ollie", "Test Suites", "Sandbox"],
    agendaDescription: "第 {index} 个主题会沿着失败诊断、受控修复、沙箱验证和回归沉淀展开。",
    keyPointsTitle: "先把修复飞轮拆成可执行判断",
    leadVisualTitle: "修复飞轮的运行入口",
    visualConcept: "修复闭环或产品结构",
    closingTitle: "生产 Agent 的真正工作发生在 trace 之后",
    closingLead:
      "文章的结论不是“观测平台给出一条 trace 就结束”，而是把 Tracing、Ollie、Test Suites、Agent Sandbox、6-algorithm Agent Optimizer 和 50+ 框架集成组织成开放栈；坏 trace 到锁定回归测试的手工循环，被产品化为可自托管的闭环。",
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6],
    imageIndexes: [0, 1, 2, 3, 4, 5, 6],
    theme: darkTheme("#120d0a", "#21140f", "#fff2df", "#d5bda2", "#f59e0b", "#fb7185"),
  },
  "07": {
    profile: "loop-engineering-feedback-system",
    preset: "Creative Voltage",
    className: "theme-electric",
    eyebrow: "MindStudio Loop Engineering",
    title: "把 AI Coding Agent 设计成反馈循环",
    subtitle:
      "Loop engineering 把单次提示升级为目标驱动过程：行动、观察、修正、验证，并在明确终止条件下持续推进。",
    thesis: "AI coding agents 的关键能力来自闭合反馈，而不是一次性生成。",
    agenda: [
      "Prompt 到 Process",
      "Loop 与 Chain",
      "ReAct 循环",
      "可靠 Loop 的部件",
      "Coding Agent 差异",
      "常见 Loop 模式",
      "实践改进",
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    imageIndexes: [0],
    theme: darkTheme("#07111f", "#111827", "#f8fbff", "#b7c5df", "#4361ee", "#ffffff"),
  },
};

const slideRules = {
  "07/long-running-claude-for-scientific-computing": {
    profile: "scientific-agent-runtime-lab",
    preset: "HPC Lab Console",
    className: "theme-copper",
    eyebrow: "Anthropic Scientific Computing",
    title: "把 Claude Code 运行成跨天科学计算工作流",
    subtitle:
      "这篇研究文章的重点不是无限自治，而是用 CLAUDE.md、CHANGELOG.md、test oracle、Git、tmux、SLURM 与 Ralph loop 让长任务 Agent 可恢复、可监督、可验证。",
    thesis: "长任务 Agent 的可靠性来自明确判据、外置记忆和可恢复执行环境。",
    agenda: [
      "任务前提",
      "适合任务",
      "具体案例",
      "科学价值",
      "执行框架",
      "无人值守运行",
      "Ralph Loop",
      "结果边界",
    ],
    sectionIndexes: [0, 1, 2, 3, 4, 5, 6, 7],
    imageIndexes: [0, 1],
    theme: darkTheme("#080d14", "#151f2d", "#f2f7ff", "#b5c6da", "#7dd3fc", "#f59e0b"),
  },
  "07/breaking-down-context-engineering": {
    profile: "context-signal-routing-system",
    preset: "Graphite Signal",
    className: "theme-neon",
    eyebrow: "SwirlAI Context Engineering",
    title: "把 Agent 上下文设计成可控输入系统",
    subtitle:
      "Context Engineering 不是 Prompt Engineering 改名，而是围绕指令、用户意图、检索、状态、长期记忆、工具和结构化输出，持续控制每一步输入质量。",
    thesis: "上下文质量决定 Agent 质量；工程重点是最小、聚焦、可维护。",
    agendaDescription:
      "第 {index} 个主题会沿着文章结构展开，并聚焦它在 Agent 上下文系统中的工程作用。",
    keyPointsTitle: "上下文工程首先是一套输入质量判断",
    leadVisualTitle: "上下文类型总览图",
    visualConcept: "上下文关系",
    agenda: [
      "Context Engineering",
      "System Prompt",
      "User Prompt",
      "Retrieved Context",
      "Short-term State",
      "Long-term Memory",
      "Tools",
      "Structured Output",
    ],
    sectionIndexes: [1, 2, 3, 4, 5, 6, 7, 8],
    imageIndexes: [0, 1, 2, 3, 4, 5, 6],
    theme: darkTheme("#050812", "#101827", "#eef4ff", "#b9c8df", "#67e8f9", "#a78bfa"),
  },
};

function lightTheme(slide, secondary, primary, muted, accent, accent2) {
  return {
    stage: "#18181b",
    slide,
    secondary,
    primary,
    muted,
    accent,
    accent2,
    panel: "rgba(255,255,255,.74)",
    panelStrong: "rgba(255,255,255,.9)",
    line: "color-mix(in srgb, var(--text-primary) 16%, transparent)",
    kbdBar: "rgba(255,255,255,.88)",
    kbdText: "color-mix(in srgb, var(--text-primary) 78%, transparent)",
    kbdBg: "color-mix(in srgb, var(--text-primary) 6%, transparent)",
    kbdBorder: "color-mix(in srgb, var(--text-primary) 14%, transparent)",
    kbdKeyText: "var(--text-primary)",
  };
}

function darkTheme(slide, secondary, primary, muted, accent, accent2) {
  return {
    stage: "#000000",
    slide,
    secondary,
    primary,
    muted,
    accent,
    accent2,
    panel: "rgba(255,255,255,.075)",
    panelStrong: "rgba(255,255,255,.12)",
    line: "color-mix(in srgb, var(--text-primary) 18%, transparent)",
    kbdBar: "rgba(12,16,24,.74)",
    kbdText: "rgba(255,255,255,.88)",
    kbdBg: "rgba(255,255,255,.16)",
    kbdBorder: "rgba(255,255,255,.28)",
    kbdKeyText: "#ffffff",
  };
}

const viewportCss = `/* ===========================================
   FIXED 16:9 STAGE: MANDATORY BASE STYLES
   Include this ENTIRE file in every presentation.
   Slides are authored at 1920×1080 and scaled as a whole.
   =========================================== */

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: var(--stage-bg, #000);
}

.deck-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: var(--stage-bg, #000);
}

.deck-stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  transform-origin: 0 0;
  background: var(--slide-bg, #fff);
}

.slide {
  position: absolute;
  inset: 0;
  width: 1920px;
  height: 1080px;
  overflow: hidden;
  display: block;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  background: var(--slide-bg, #fff);
  color: var(--text-primary, #111);
}

.slide.active,
.slide.visible {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  z-index: 1;
}

img,
video,
canvas,
svg {
  max-width: 100%;
  max-height: 100%;
}

@media print {
  html,
  body {
    width: 1920px;
    height: auto;
    overflow: visible;
    background: #fff;
  }

  .deck-viewport {
    position: static;
    overflow: visible;
    background: #fff;
  }

  .deck-stage {
    position: static;
    width: auto;
    height: auto;
    transform: none;
    background: none;
  }

  .slide {
    position: relative;
    display: block;
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
    width: 1920px;
    height: 1080px;
    break-after: page;
    page-break-after: always;
  }

  .slide:last-child {
    break-after: auto;
    page-break-after: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms;
    transition-duration: 0.2s;
  }
}`;

async function main() {
  const targets = getTargets();

  const imageCache = new Map();

  for (const target of targets) {
    const { resourceId, slug } = target;
    const rule = getRule(target);
    if (!rule) continue;

    const resourceDir = join(resourcesDir, resourceId);
    const meta = readJson(join(resourceDir, "meta.json"));
    const studyMeta = findStudyMeta(meta, slug);
    const slideMeta = findSlideMeta(meta, studyMeta?.path);

    if (!slideMeta || !studyMeta) {
      throw new Error(`Resource ${resourceId} is missing study or slide metadata.`);
    }

    const data = readDataJson(resourceDir, studyMeta.path);
    const sourceMarkdown = readResourceMarkdown(resourceDir, studyMeta.path);
    const sourceAssets = await buildSourceAssets(sourceMarkdown, rule, imageCache, resourceDir);
    const html = renderDeck({ data, meta, resourceId, rule, sourceAssets, studyMeta });
    writeFileSync(join(resourceDir, "slides", `${slideMeta.path}.html`), html);

    slideMeta.updatedAt = generatedAt;
    writeFileSync(join(resourceDir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);
  }
}

function getTargets() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    throw new Error(
      "Pass the resource id(s) to update, for example: node scripts/generate-resource-slides.mjs 07 or 07:article-slug. Use --all only for intentional bulk regeneration.",
    );
  }

  if (args.includes("--all")) {
    if (args.length > 1) {
      throw new Error("Use either --all or explicit resource id(s), not both.");
    }

    return readdirSync(resourcesDir)
      .filter((name) => /^\d+$/.test(name))
      .sort()
      .map((resourceId) => ({ resourceId }));
  }

  return args.map((value) => {
    const [rawResourceId, slug] = value.split(":");
    if (!/^\d+$/.test(rawResourceId) || (slug && !/^[a-z0-9-]+$/.test(slug))) {
      throw new Error(`Invalid resource target: ${value}`);
    }

    const resourceId = rawResourceId.padStart(2, "0");
    if (!resourceRules[resourceId]) {
      throw new Error(`No slide generation rule configured for resource ${resourceId}.`);
    }

    return { resourceId, slug };
  });
}

function getRule({ resourceId, slug }) {
  if (slug) {
    return slideRules[`${resourceId}/${slug}`] ?? resourceRules[resourceId];
  }

  return resourceRules[resourceId];
}

function findStudyMeta(meta, slug) {
  if (!slug) return meta.studies?.[0];

  return meta.studies?.find((study) => study.path === slug);
}

function findSlideMeta(meta, slug) {
  if (!slug) return undefined;

  return meta.slides?.find((slide) => slide.path === slug);
}

function readDataJson(resourceDir, slug) {
  const articleData = join(resourceDir, "artifacts", `${slug}.data.json`);
  if (existsSync(articleData)) {
    return readJson(articleData);
  }

  return readJson(join(resourceDir, "artifacts", "data.json"));
}

function readResourceMarkdown(resourceDir, slug) {
  const articleMarkdown = join(resourceDir, `${slug}.md`);
  if (existsSync(articleMarkdown)) {
    return readFileSync(articleMarkdown, "utf8");
  }

  throw new Error(`Missing article Markdown: expected ${articleMarkdown}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function buildSourceAssets(markdown, rule, imageCache, resourceDir) {
  const parsed = parseMarkdownImages(markdown);
  const selected = rule.imageIndexes.map((index) => parsed[index]).filter(Boolean);
  const assets = [];

  for (const item of selected) {
    const embedded = await fetchAsDataUrl(item.url, imageCache, resourceDir);
    if (!embedded) continue;
    const narrative = rule.visualNarratives?.[assets.length] ?? {};
    assets.push({ ...item, ...narrative, embedded });
  }

  return assets;
}

function parseMarkdownImages(markdown) {
  const lines = markdown.split(/\r?\n/);
  const images = [];
  let heading = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(line);
    if (headingMatch) heading = stripMarkdownInline(headingMatch[2]);

    const imageMatch = /!\[([^\]]*)\]\(([^)]+)\)/.exec(line);
    if (!imageMatch) continue;

    const alt = normalizeVisualText(imageMatch[1].trim());
    const url = imageMatch[2].trim();
    const nextText = findNearestText(lines, index + 1, 5);
    const previousText = findNearestText([...lines].reverse(), lines.length - index, 5);
    const caption =
      alt || normalizeVisualText(isShortCaption(nextText) ? nextText : "") || heading || "图示";
    const evidence = normalizeVisualText(previousText) || normalizeVisualText(nextText) || heading;
    images.push({ alt, caption, evidence, heading, url });
  }

  return images;
}

function normalizeVisualText(value) {
  const text = stripMarkdownInline(value);
  if (!text) return "";
  if (
    /^(source visual|source image|对应来源图|来源图片|相关插图|image \d+|visual \d+)$/iu.test(text)
  ) {
    return "";
  }
  return text;
}

function findNearestText(lines, start, limit) {
  for (let offset = 0; offset < limit; offset += 1) {
    const text = lines[start + offset]?.trim();
    if (!text) continue;
    if (/^#{1,6}\s+/.test(text)) return stripMarkdownInline(text.replace(/^#{1,6}\s+/, ""));
    if (text.startsWith("![") || text.startsWith("```")) continue;
    return stripMarkdownInline(text.replace(/^[-*]\s+/, ""));
  }
  return "";
}

function stripMarkdownInline(value) {
  return String(value ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isShortCaption(text) {
  if (!text) return false;
  return text.length <= 140 && !/[。.!?]$/.test(text);
}

async function fetchAsDataUrl(url, imageCache, resourceDir) {
  if (imageCache.has(url)) return imageCache.get(url);

  if (url.startsWith("data:")) {
    imageCache.set(url, url);
    return url;
  }

  if (!/^https?:\/\//i.test(url)) {
    const localPath = join(resourceDir, url);
    if (!existsSync(localPath)) {
      imageCache.set(url, null);
      return null;
    }

    const value = `data:${inferMime(localPath)};base64,${readFileSync(localPath).toString("base64")}`;
    imageCache.set(url, value);
    return value;
  }

  try {
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!response.ok) {
      imageCache.set(url, null);
      return null;
    }

    const contentType = response.headers.get("content-type")?.split(";")[0] || inferMime(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    const value = `data:${contentType};base64,${buffer.toString("base64")}`;
    imageCache.set(url, value);
    return value;
  } catch {
    imageCache.set(url, null);
    return null;
  }
}

function inferMime(url) {
  if (/\.svg(?:\?|$)/i.test(url)) return "image/svg+xml";
  if (/\.webp(?:\?|$)/i.test(url)) return "image/webp";
  if (/\.png(?:\?|$)/i.test(url)) return "image/png";
  return "image/jpeg";
}

function renderDeck({ data, meta, resourceId, rule, sourceAssets, studyMeta }) {
  const sourceTitle = data.metadata?.title ?? data.article?.title ?? studyMeta.title;
  const sourceUrl = data.metadata?.sourceUrl ?? meta.source;
  const sections = selectSections(data.sections ?? [], rule.sectionIndexes);
  const summaryCards = data.summary?.cards ?? [];
  const keyPoints = data.summary?.keyPoints ?? [];
  const frameworkNodes = data.framework?.nodes ?? [];

  const slides = [
    titleSlide({ resourceId, rule, sourceTitle, sourceUrl }),
    overviewSlide({ rule }),
    thesisSlide({ data, keyPoints, rule, sourceTitle, sourceUrl }),
    keyPointsSlide({ keyPoints, rule }),
    summarySlide({ rule, summaryCards }),
    frameworkSlide({ frameworkNodes }),
    ...(sourceAssets[0]
      ? [
          visualSlide({
            asset: sourceAssets[0],
            index: 1,
            title: rule.leadVisualTitle ?? rule.agenda[0] ?? rule.title,
          }),
        ]
      : []),
    ...sections.flatMap((section, index) => {
      const output = sectionSlides({ index, resourceId, rule, section });
      const asset = sourceAssets[index + 1];
      if (asset && index < 5) {
        output.push(
          visualSlide({
            asset,
            index: index + 2,
            title: visualNarrativeTitle(section, asset),
          }),
        );
      }
      return output;
    }),
    closingSlide({ rule, sourceTitle, sourceUrl, studyMeta }),
  ];

  return `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(studyMeta.title)}</title>
<style>
:root {
  --stage-bg: ${rule.theme.stage};
  --slide-bg: ${rule.theme.slide};
  --bg-secondary: ${rule.theme.secondary};
  --text-primary: ${rule.theme.primary};
  --text-secondary: ${rule.theme.muted};
  --accent: ${rule.theme.accent};
  --accent2: ${rule.theme.accent2};
  --panel: ${rule.theme.panel};
  --panel-strong: ${rule.theme.panelStrong};
  --line: ${rule.theme.line};
  --control-accent: var(--accent);
  --chrome-border: color-mix(in srgb, var(--text-primary) 18%, transparent);
  --kbd-bar-bg: ${rule.theme.kbdBar};
  --kbd-text: ${rule.theme.kbdText};
  --kbd-bg: ${rule.theme.kbdBg};
  --kbd-border: ${rule.theme.kbdBorder};
  --kbd-separator: color-mix(in srgb, var(--text-primary) 18%, transparent);
  --kbd-key-text: ${rule.theme.kbdKeyText};
  --link-color: var(--accent);
  --link-visited: var(--link-color);
  --link-hover: var(--link-color);
  --link-hover-bg: color-mix(in srgb, var(--link-color) 14%, transparent);
  --link-underline: color-mix(in srgb, var(--link-color) 55%, transparent);
  --link-focus-ring: color-mix(in srgb, var(--link-color) 22%, transparent);
  --module-radius: 22px;
  --font-display: "Aptos Display", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --font-body: "Aptos", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  --title-size: 90px;
  --heading-size: 52px;
  --subtitle-size: 28px;
  --body-size: 23px;
  --slide-padding: 88px;
  --content-gap: 28px;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-normal: 0.6s;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
${viewportCss}
${deckCss()}
</style>
</head>
<body class="${rule.className}" data-resource-id="${resourceId}" data-design-profile="${escapeHtml(rule.profile)}" data-style-preset="${escapeHtml(rule.preset)}">
<div class="deck-viewport">
  <main class="deck-stage" id="deckStage">
${slides.join("\n")}
  </main>
</div>
${controlsHtml()}
${lightboxHtml()}
${editHtml()}
<script>
${controllerScript()}
</script>
</body>
</html>
`;
}

function titleSlide({ resourceId, rule, sourceTitle, sourceUrl }) {
  return `<section class="slide title-slide active" data-chrome="dark" data-slide-kind="title">
  <div class="title-block">
    <p class="eyebrow reveal">${escapeHtml(rule.eyebrow)} · ${resourceId}</p>
    <h1 class="reveal">${escapeHtml(rule.title)}</h1>
    <p class="subtitle reveal">${escapeHtml(rule.subtitle)}</p>
    <p class="source-credit reveal">原文：<a href="${escapeAttribute(sourceUrl)}" target="_blank" rel="noopener">《${escapeHtml(sourceTitle)}》</a></p>
  </div>
</section>`;
}

function overviewSlide({ rule }) {
  const agendaItems = rule.agenda;

  return `<section class="slide" data-slide-kind="overview">
  <div class="slide-content">
    <p class="eyebrow reveal">阅读路径 · 高密度 / 阅读优先</p>
    <h2 class="reveal">这份 deck 的阅读路径</h2>
    <div class="agenda-grid module-grid items-${agendaItems.length}" data-count="${agendaItems.length}">${agendaItems
      .map((item, index) => numberedCard(item, formatAgendaDescription(rule, index + 1), index + 1))
      .join("")}</div>
  </div>
</section>`;
}

function thesisSlide({ data, keyPoints, rule, sourceTitle, sourceUrl }) {
  return `<section class="slide" data-slide-kind="thesis">
  <div class="slide-content slide-layout split">
    <div class="text-panel bounded-copy">
      <p class="eyebrow reveal">${escapeHtml(rule.eyebrow)}</p>
      <h2 class="reveal">${escapeHtml(rule.thesis)}</h2>
      <p class="lead reveal">${escapeHtml(data.summary?.lead ?? data.hero?.zh ?? rule.subtitle)}</p>
    </div>
    <div class="bounded-panel evidence-panel reveal">
      <span class="panel-label">核心结构</span>
      <h3>${escapeHtml(sourceTitle)}</h3>
      <ul>${keyPoints
        .slice(0, 4)
        .map((point) => `<li><b>${escapeHtml(point.label)}</b>${escapeHtml(point.text)}</li>`)
        .join("")}</ul>
      <p class="source-note">原文：<a href="${escapeAttribute(sourceUrl)}" target="_blank" rel="noopener">《${escapeHtml(sourceTitle)}》</a></p>
    </div>
  </div>
</section>`;
}

function keyPointsSlide({ keyPoints, rule }) {
  const items = keyPoints.length
    ? keyPoints
    : [
        { label: "核心判断", text: rule.thesis },
        { label: "阅读线索", text: rule.subtitle },
      ];

  return `<section class="slide" data-slide-kind="key-points">
  <div class="slide-content" data-layout-density="dense">
    <p class="eyebrow reveal">判断框架</p>
    <h2 class="reveal">${escapeHtml(rule.keyPointsTitle ?? "先把来源主张压成可执行判断")}</h2>
    <div class="audit-grid module-grid items-${Math.min(items.length, 4)}" data-count="${Math.min(items.length, 4)}">${items
      .slice(0, 4)
      .map((point, index) => numberedCard(point.label, point.text, index + 1))
      .join("")}</div>
  </div>
</section>`;
}

function formatAgendaDescription(rule, index) {
  return (
    rule.agendaDescription ?? "第 {index} 个主题会沿着来源结构展开，并说明它在整体论证中的作用。"
  ).replace("{index}", String(index));
}

function summarySlide({ rule, summaryCards }) {
  const cards = summaryCards.slice(0, 6);

  return `<section class="slide" data-slide-kind="summary">
  <div class="slide-content" data-layout-density="dense">
    <p class="eyebrow reveal">内容摘要</p>
    <h2 class="reveal">${escapeHtml(rule.thesis)}</h2>
    <div class="card-grid module-grid items-${cards.length}" data-count="${cards.length}">${cards
      .map((card, index) => numberedCard(card.title, card.body, index + 1))
      .join("")}</div>
  </div>
</section>`;
}

function frameworkSlide({ frameworkNodes }) {
  const nodes = frameworkNodes.slice(0, 9);

  return `<section class="slide" data-slide-kind="framework">
  <div class="slide-content" data-layout-density="dense">
    <p class="eyebrow reveal">叙事结构</p>
    <h2 class="reveal">按来源结构组织，而不是套同一个摘要模板</h2>
    <div class="path-grid module-grid items-${nodes.length}" data-count="${nodes.length}">${nodes
      .map(
        (node, index) =>
          `<article class="path-node reveal" data-step="${String(index + 1).padStart(2, "0")}"><h3>${escapeHtml(node.label)}</h3><p>${escapeHtml(node.summary)}</p></article>`,
      )
      .join("")}</div>
  </div>
</section>`;
}

function sectionSlides({ index, resourceId, rule, section }) {
  const rows = normalizeSectionRows({ resourceId, section });
  const chunks = chunkRows(rows, 4);
  const fallback = chunks.length ? chunks : [[]];

  return fallback.map((chunk, chunkIndex) => {
    const partLabel = fallback.length > 1 ? ` · ${chunkIndex + 1}/${fallback.length}` : "";
    return `<section class="slide" data-slide-kind="section-${index + 1}${partLabel ? `-${chunkIndex + 1}` : ""}">
  <div class="slide-content" data-layout-density="dense">
    <p class="eyebrow reveal">精读拆解 · ${String(index + 1).padStart(2, "0")}${partLabel}</p>
    <h2 class="reveal">${escapeHtml(rule.agenda[index] ?? section.title ?? section.toc ?? "上下文模块")}</h2>
    <div class="source-rows module-grid items-${chunk.length}" data-count="${chunk.length}">${chunk
      .map(
        (row, rowIndex) =>
          `<article class="source-row reveal"><b>${String(chunkIndex * 4 + rowIndex + 1).padStart(2, "0")}</b><p>${formatSlideText(normalizeSlideCopy(row.zh ?? row.en ?? ""))}</p></article>`,
      )
      .join("")}</div>
  </div>
</section>`;
  });
}

function normalizeSectionRows({ resourceId, section }) {
  const rows = section.rows ?? [];
  const richerRows = enrichedSectionRows[resourceId]?.[section.title ?? section.toc ?? ""];
  if (richerRows) {
    return richerRows;
  }

  const selfRepairingRows = selfRepairingAgentHarnessRows[section.title ?? section.toc ?? ""];
  if (resourceId === "06" && selfRepairingRows) {
    return selfRepairingRows;
  }

  const longRunningRows = longRunningClaudeRows[section.title ?? section.toc ?? ""];
  if (resourceId === "07" && longRunningRows) {
    return longRunningRows;
  }

  const contextEngineeringRows =
    breakingDownContextEngineeringRows[section.title ?? section.toc ?? ""];
  if (resourceId === "07" && contextEngineeringRows) {
    return contextEngineeringRows;
  }

  if (resourceId !== "01") return rows;

  const examples = buildingEffectiveAgentsExamples[section.title];
  if (!examples) return rows;

  let mergedExistingExampleRow = false;
  const normalizedRows = rows.map((row) => {
    const text = row.zh ?? "";
    if (!/适用的示例：?$/.test(text) && !/有用的示例：?$/.test(text)) {
      return row;
    }

    mergedExistingExampleRow = true;
    return {
      ...row,
      zh: `${text}\n${examples.map((example) => `- ${example}`).join("\n")}`,
      en: `${row.en ?? ""}\nExamples: ${examples.join(" | ")}`,
    };
  });

  if (mergedExistingExampleRow) return normalizedRows;

  return [
    ...normalizedRows,
    {
      en: `Examples: ${examples.join(" | ")}`,
      zh: `${section.title} 适用的示例：\n${examples.map((example) => `- ${example}`).join("\n")}`,
    },
  ];
}

const enrichedSectionRows = {
  "02": {
    "Agent 的边界：工作流执行权": [
      {
        zh: "OpenAI 将 Agent 定义为能代表用户独立完成任务的系统；关键边界不是是否接入 LLM，而是 LLM 是否参与管理工作流执行。",
      },
      {
        zh: "如果应用只是把用户输入交给模型回答，却不让模型控制步骤、调用工具或推进流程，它更接近普通 LLM 应用，而不是 Agent。",
      },
      {
        zh: "生产级 Agent 必须能在失败、低置信度或风险升高时停止执行，并把控制权交回用户或人工审核环节。",
      },
      {
        zh: "因此这份指南的主线不是追求最大自治，而是在任务执行权、工具行动权和人工接管点之间建立可控边界。",
      },
    ],
    "什么时候值得构建 Agent": [
      {
        zh: "Agent 最适合传统规则或确定性流程难以覆盖的任务，例如需要多步判断、模糊分类、异常处理或跨系统行动的工作流。",
      },
      {
        zh: "如果任务可以用固定规则、表单流程或简单检索稳定解决，Agent 反而会增加不确定性、评估成本和运行风险。",
      },
      {
        zh: "原文强调三类信号：复杂决策、规则集难以维护、输入高度依赖非结构化数据；这些比“能不能用模型”更能判断是否需要 Agent。",
      },
      {
        zh: "正确落点是先用真实用例和 eval 建立性能基线，再决定是否引入 Agent，而不是先画多 Agent 架构再寻找场景。",
      },
    ],
    "模型、工具、指令构成最小系统": [
      {
        zh: "Agent 的最小系统由模型、工具和指令组成：模型负责推理和选择下一步，工具让系统能读取数据、采取行动或调用外部服务。",
      },
      {
        zh: "指令不是装饰性提示词，而是把业务 SOP、政策边界、失败分支和输出要求转写成模型可执行的流程约束。",
      },
      {
        zh: "工具定义需要标准化、可复用、可测试，并给出清晰的输入输出语义；工具越多，模型越需要明确何时使用、何时停止。",
      },
      {
        zh: "这三件套必须一起评估：强模型不能弥补坏工具，丰富工具也不能弥补模糊指令，任何一侧薄弱都会放大运行不确定性。",
      },
    ],
    "先建基线，再优化成本": [
      {
        zh: "OpenAI 建议先用能力最强的模型建立原型和准确率基线，因为早期目标是确认任务能否被可靠完成，而不是先压低单次调用成本。",
      },
      {
        zh: "当 eval 显示工作流达到目标后，再尝试用较小模型替换局部步骤，比较准确率、延迟、成本和失败类型是否仍在可接受范围内。",
      },
      {
        zh: "模型选择应按任务拆分：复杂推理、工具规划和异常处理可能保留强模型，格式化、分类或固定转换可考虑较小模型。",
      },
      {
        zh: "成本优化不是主观判断，而是由 eval、线上反馈和 guardrail 命中率共同决定；否则小模型替换会把错误藏到更晚的工作流阶段。",
      },
    ],
    "工具决定 Agent 能做什么": [
      {
        zh: "工具把 Agent 从回答系统变成行动系统；数据工具负责读上下文，动作工具负责改外部世界，编排工具负责管理子流程或调用其他 Agent。",
      },
      {
        zh: "工具越接近生产系统，越需要权限边界、参数校验、幂等设计、错误返回和审计记录，避免模型一次错误调用造成不可逆副作用。",
      },
      {
        zh: "当工具数量变多时，问题通常不是“再加一个 Agent”，而是先提高工具说明、命名、分组和选择条件的清晰度。",
      },
      {
        zh: "只有当工具之间的逻辑域明显不同、上下文会互相干扰，或单个 Agent 已经难以稳定选择工具时，才有必要拆分多个专业 Agent。",
      },
    ],
    指令把业务流程变成可执行步骤: [
      {
        zh: "有效指令通常来自现有 SOP、支持脚本、政策文档或人工专家流程；它们需要被改写为模型可执行的步骤、条件分支和停止规则。",
      },
      {
        zh: "每一步都应对应明确行动或输出，例如先收集缺失信息、再判断资格、再调用工具、最后输出结构化结论，而不是笼统要求“解决问题”。",
      },
      {
        zh: "稳健指令要预判异常：用户信息不足、工具失败、结果冲突、风险内容、越权请求和低置信度场景都应有可执行处理方式。",
      },
      {
        zh: "指令还要进入 eval：如果测试只覆盖成功路径，Agent 在边界条件下会把模糊指令解释成任意行为。",
      },
    ],
    "Manager 与 Decentralized": [
      {
        zh: "Manager 模式由中心 Agent 拆解任务、选择专业 Agent、合并结果；它适合需要统一计划、集中状态和最终责任归属的工作流。",
      },
      {
        zh: "Decentralized 模式让 Agent 根据专业边界相互交接，适合客服分诊、部门化支持或明确领域路由，但需要非常清晰的 handoff 条件。",
      },
      {
        zh: "多 Agent 的风险是上下文丢失、责任分散、重复调用和不可预测交接；拆分前应先证明单 Agent 确实因复杂度或工具混淆达到上限。",
      },
      {
        zh: "选择编排方式时，应看谁拥有工作流控制权、谁能接触用户、谁能调用高风险工具，以及人工介入点放在哪一层。",
      },
    ],
  },
  "03": {
    "从模型回答到 Agent 工作流": [
      {
        zh: "Responses API 的变化不是“多了一个 shell”，而是把模型、工具执行、文件系统、数据库、网络策略和压缩机制放入同一个可编排请求生命周期。",
      },
      {
        zh: "只靠提示词，模型只能产出文本；给模型一个受控计算环境后，它可以运行命令、处理文件、查询结构化数据并生成可验证产物。",
      },
      {
        zh: "真实 Agent 工作流会产生中间文件、长日志、表格、网络请求和多轮工具结果，因此平台必须处理超时、重试、输出截断和上下文污染。",
      },
      {
        zh: "核心转变是：模型提出下一步，平台执行工具并返回结果，直到模型不再提出 shell command；执行权在受控环境中闭环。",
      },
    ],
    "Responses API + shell + hosted container": [
      {
        zh: "托管容器提供隔离执行环境，包含输入输出文件系统、可选 SQLite 数据库、受控网络访问和技能加载能力。",
      },
      {
        zh: "shell tool 覆盖范围比单纯 Python code interpreter 更广：它可以运行系统命令、启动服务、调用 CLI、处理文件并组合多语言工具链。",
      },
      {
        zh: "容器上下文让开发者不必把所有资料塞进 prompt；大文件、CSV、报告和中间产物可以留在文件系统中，由模型按需读取。",
      },
      {
        zh: "这套方案的价值在可重复和可审计：命令、输出、文件变化和策略约束都处于平台控制下，而不是由模型自由想象执行结果。",
      },
    ],
    "Shell 是执行入口，不是自治本身": [
      {
        zh: "模型使用工具的本质是提出工具调用；模型本身不会执行 shell，真正执行发生在 Responses API 管理的隔离容器中。",
      },
      {
        zh: "编排器负责读取模型输出、执行命令、收集 stdout/stderr、处理失败，并把工具响应作为下一轮输入交还模型。",
      },
      {
        zh: "因此 shell tool 不等于无约束自治：命令仍要受超时、权限、网络策略、输出长度和安全审计约束。",
      },
      {
        zh: "把 shell 看成执行入口有助于设计边界：模型负责计划和解释，平台负责执行和控制，应用负责决定哪些工具与资源可见。",
      },
    ],
    编排器把执行变成循环: [
      {
        zh: "Agent loop 的基本形态是：模型提出步骤，平台运行工具，工具结果进入上下文，模型再决定下一步，直到返回最终答案。",
      },
      {
        zh: "Responses API 可以开箱编排模型与托管工具，减少开发者手写循环、状态拼接、错误恢复和工具响应格式的负担。",
      },
      {
        zh: "循环必须能处理非理想状态：命令失败、输出过长、文件缺失、网络不可达或模型提出多个并发命令。",
      },
      {
        zh: "生产价值来自可控循环，而不是无限循环；平台需要有终止条件、失败交还和可观测日志，防止工具调用链失控。",
      },
    ],
    效率与上下文污染同时处理: [
      {
        zh: "模型可以在一步中提出多个 shell 命令，Responses API 可用独立容器会话并发执行，从而减少等待时间。",
      },
      {
        zh: "并发不是简单加速：每个命令的输出都可能污染上下文，因此平台需要控制输出长度、保留关键头尾并标明省略部分。",
      },
      {
        zh: "有界输出让模型看到足够诊断信息，同时避免日志、安装输出或大表格淹没原始任务目标。",
      },
      {
        zh: "这解释了为什么执行环境必须和上下文管理一起设计；否则更强的工具能力会直接转化为更严重的上下文负担。",
      },
    ],
    长任务需要原生压缩: [
      {
        zh: "长时间任务会持续生成命令、文件、错误、重试和决策记录，最终填满上下文窗口。",
      },
      {
        zh: "compaction 用更 token 高效的形式保留关键历史状态，让多步、多工具任务能跨上下文边界继续推进。",
      },
      {
        zh: "压缩对象应是任务状态、已完成步骤、失败原因、文件位置和下一步计划，而不是把原始日志完整搬进下一轮。",
      },
      {
        zh: "这使 Responses API 的容器不仅是执行空间，也是可持续工作记忆的一部分：文件留在环境里，摘要进入模型上下文。",
      },
    ],
    "文件系统让输入不必塞进 prompt": [
      {
        zh: "容器文件系统适合存放大输入、中间产物、生成报告和代码文件；模型可以按需打开、转换、查询，而不是一次性阅读所有内容。",
      },
      {
        zh: "这种设计降低 prompt 膨胀，也让任务产物可复查：文件路径、内容变化和最终输出都能在容器中留下可追踪痕迹。",
      },
      {
        zh: "对表格和结构化数据，直接粘贴整表会浪费窗口；更好的做法是放入 SQLite 或文件系统，再由模型生成查询和摘要。",
      },
      {
        zh: "文件系统把“上下文”从单个 token 串扩展为工作区，模型只把当前步骤所需信息拉回上下文。",
      },
    ],
    联网能力必须带策略层: [
      {
        zh: "受控网络访问让 Agent 可以请求 API、下载依赖或访问文档，但每一次外联都应经过 egress policy，而不是开放任意互联网。",
      },
      {
        zh: "网络策略需要限制域名、协议、超时和凭证暴露；否则 shell tool 会把模型错误扩展成供应链、数据泄露或越权访问风险。",
      },
      {
        zh: "联网输出也要进入上下文治理：网页、日志或 API 返回可能很长，也可能包含 prompt injection 或与当前任务无关的内容。",
      },
      {
        zh: "因此 Network Access 的重点不是“能联网”，而是把联网作为受审计、可回放、可截断的工具能力接入 Agent loop。",
      },
    ],
    "Skills 把重复流程封装成能力": [
      {
        zh: "Skills 将重复流程打包为可加载能力，通常包括说明、脚本、资源和使用约定，让模型在运行时按需获得专门工具。",
      },
      {
        zh: "与把所有说明常驻 prompt 相比，skills 更接近按需加载：只有相关任务才引入对应上下文，从而减少基础上下文压力。",
      },
      {
        zh: "技能加载必须确定、可追踪、可版本化；否则同一个任务在不同运行中看到不同工具说明，会破坏可重复性。",
      },
      {
        zh: "在 Responses API 环境里，skills 与文件系统、shell 和容器策略结合，构成可执行 Agent 平台的一层，而不只是提示词模板。",
      },
    ],
  },
  "04": {
    "什么是 dynamic workflows": [
      {
        zh: "Dynamic workflows 让 Claude Code 在任务开始时即时生成一个 JavaScript harness，用特殊函数创建子代理、分配任务并收集结果。",
      },
      {
        zh: "它解决的不是普通编码任务，而是默认 harness 难以覆盖的长任务、并行探索、对抗式验证、大规模分类或需要显式循环的工作。",
      },
      {
        zh: "专用 harness 可以把任务结构写成代码：哪些代理并行运行、如何合并结果、何时复核、何时继续循环，都变成可见流程。",
      },
      {
        zh: "这种方式的关键是让结构显式存在；Claude 不是在一个上下文里记住所有安排，而是把安排外化成可执行工作流。",
      },
    ],
    "为什么默认 harness 会遇到上限": [
      {
        zh: "默认 Claude Code harness 对日常 coding 很有效，但长时间运行时容易出现 agentic laziness：模型过早声称完成，实际缺口仍在。",
      },
      {
        zh: "self-preferential bias 指模型偏好自己的方案或前一轮结论；如果生成和验证在同一上下文里完成，错误会被自我强化。",
      },
      {
        zh: "goal drift 指长任务中初始目标被中间细节稀释，最终产物看似合理，却偏离原始 specification。",
      },
      {
        zh: "动态工作流用独立子代理、显式验收、投票和循环，把这些失败模式拆到流程层处理，而不是只依赖一次提示词提醒。",
      },
    ],
    动态与静态工作流: [
      {
        zh: "静态工作流需要预先覆盖大量边界情况，因此通常更通用、更保守，也更难贴合某个具体任务的特殊结构。",
      },
      {
        zh: "动态工作流把生成工作流本身交给 Claude：它可以根据当前文件、目标、风险和可用工具生成任务专用 harness。",
      },
      {
        zh: "这并不意味着没有约束；动态 harness 仍需要清晰输入、可审查代码、明确终止条件和结果验证。",
      },
      {
        zh: "真正差异在适配方式：静态流程复用固定骨架，动态流程复用模式并按任务重组，从而减少“模板正确但任务不贴合”的问题。",
      },
    ],
    六个常见工作流模式: [
      {
        zh: "并行探索让多个子代理在隔离上下文中尝试不同路径，再由主流程汇总；适合研究、迁移方案比较或复杂 bug 诊断。",
      },
      {
        zh: "投票和对抗式验证让独立代理审查同一结果，降低单一模型自我确认；deep verification 会先抽取 claims，再逐条核查。",
      },
      {
        zh: "分治模式把大型任务拆为可并行或可独立验收的子任务；排序模式用 pairwise comparison、tournament 或 bucket 收敛候选集。",
      },
      {
        zh: "循环模式用于持续推进到明确完成条件，例如反复检查 specification、修正缺口并重新验证，而不是接受第一次“完成”声明。",
      },
    ],
    高价值用例: [
      {
        zh: "迁移与重构适合动态工作流，因为它需要多文件理解、候选策略比较、局部实现、回归测试和最终一致性检查。",
      },
      {
        zh: "深度研究与深度验证需要把生成、引用检查和事实核查分开，避免同一上下文同时承担写作和审稿导致偏差。",
      },
      {
        zh: "排序、记忆与规则遵循、根因调查、大规模分诊、探索与品味、评估和模型路由都属于结构重于单次回答的任务。",
      },
      {
        zh: "共同判断标准是：任务是否受益于隔离上下文、并行探索、独立评审或显式循环；如果没有这些收益，普通 Claude Code 流程就够用。",
      },
    ],
    精读结论: [
      {
        zh: "Dynamic workflows 是扩展 Claude Code 的方式，但不是每个任务都需要；额外 compute、代理数量和流程复杂度必须由任务价值证明。",
      },
      {
        zh: "它最适合把“如何完成任务”本身变成对象：先生成 harness，再让 harness 组织代理、验证、循环和汇总。",
      },
      {
        zh: "正确使用方式是从失败模式倒推结构：懒惰用循环，偏差用独立验证，目标漂移用外置 specification 和阶段性验收。",
      },
      {
        zh: "最终产物应当可审查：workflow 代码、子代理输出、验证结果和完成条件都要能被人类检查，而不是只得到一个自称完成的回答。",
      },
    ],
  },
  "05": {
    "问题不是模型，而是模型看到什么": [
      {
        zh: "原文从一个长任务症状切入：Agent 前 10 步表现很好，随后开始错用工具、忘记指令或输出质量下降。",
      },
      {
        zh: "作者给出的根因不是模型突然变差，而是模型正在看到的信息发生了变化：窗口里混入了工具结果、历史噪声、过时计划和冲突记忆。",
      },
      {
        zh: "上下文工程的目标是让 Agent 在正确时间、以正确格式看到正确信息；它覆盖提示词，但不止于提示词。",
      },
      {
        zh: "因此解决方案不是把窗口填满，而是管理信息进入、停留、压缩、隔离和退出窗口的完整生命周期。",
      },
    ],
    "上下文窗口像 RAM，会提前退化": [
      {
        zh: "上下文窗口被类比为 RAM：它是模型当前可见、可推理的工作记忆，而不是可靠长期存储。",
      },
      {
        zh: "原文强调退化会在达到最大 token 上限前发生；输入越长，模型越容易忽略中间信息或被低价值内容牵引。",
      },
      {
        zh: "Lost in the Middle 会让原始指令或关键约束被大量工具输出埋没，系统表面仍有上下文，实际约束却已失效。",
      },
      {
        zh: "工程含义是：上下文预算要像内存预算一样被主动管理，不能把大窗口误认为无限仓库。",
      },
    ],
    七类信息争用同一个窗口: [
      {
        zh: "原文列出七类竞争内容：system prompt、tool definitions、tool results、RAG、conversation history、memory 和 agent state。",
      },
      {
        zh: "这些内容价值不同、时效不同、风险不同，却会共同占用同一个有限窗口；上下文工程就是决定当前步骤谁应该获胜。",
      },
      {
        zh: "工具定义稳定但占空间，工具结果新鲜但嘈杂，RAG 可能相关也可能冲突，历史和记忆则容易过期或过度影响当前判断。",
      },
      {
        zh: "因此每一轮 Agent 调用都应重新评估相关性、优先级和 token 成本，而不是沿用不断增长的完整上下文。",
      },
    ],
    "四类核心策略：Write、Select、Compress、Isolate": [
      {
        zh: "Write 解决遗忘：把规则、计划、发现、偏好或阶段产物写入窗口之外的持久位置，例如文件、数据库、记忆或任务状态。",
      },
      {
        zh: "Select 解决过载：不要把所有可用信息交给 Agent，而是在当前步骤只取必要上下文，并按相关性和风险排序。",
      },
      {
        zh: "Compress 解决累积：把长历史、工具输出和研究材料压缩成保留关键含义的中间工件，而不是机械截断。",
      },
      {
        zh: "Isolate 解决污染：为不同子任务、阶段或代理使用独立上下文窗口，避免研究噪声、错误假设或验证信息污染生成过程。",
      },
    ],
    压缩与隔离控制累积和污染: [
      {
        zh: "即使选择机制做得好，上下文仍会随工具调用、检索材料和决策记录不断累积；Compress 的目标是减少 token，同时保留真正重要的状态。",
      },
      {
        zh: "有效压缩应保留任务目标、已验证事实、失败尝试、关键文件、开放问题和下一步，而不是把原始日志改写成空泛摘要。",
      },
      {
        zh: "Isolate 则把不同阶段分开：研究阶段可以广泛探索，实现阶段只继承压缩后的计划，验证阶段使用独立标准检查结果。",
      },
      {
        zh: "两者结合可以缓解 context rot：累积内容被周期性蒸馏，互相污染的上下文被边界隔离。",
      },
    ],
    "四类失败模式：命名问题才能修复问题": [
      {
        zh: "Context Poisoning 指幻觉、错误工具结果或错误假设进入上下文，并在后续步骤被当成事实继续使用。",
      },
      {
        zh: "Context Distraction 指上下文太长或噪声太多，模型被低价值内容牵引，偏离原始目标和高优先级约束。",
      },
      {
        zh: "Context Confusion 指无关信息没有超出窗口，却影响模型决策，让它基于错误线索选择工具或生成答案。",
      },
      {
        zh: "Context Clash 指上下文片段互相冲突，例如旧计划与新指令、长期记忆与当前请求、检索结果与系统规则不一致。",
      },
    ],
    "Agent 系统提示词要定义架构": [
      {
        zh: "聊天机器人的系统提示词主要设定语气和互动风格；Agent 的系统提示词必须定义任务控制流、工具使用、错误处理和护栏。",
      },
      {
        zh: "它要说明何时调用工具、何时询问用户、何时停止、如何处理失败、如何记录状态，以及哪些动作需要人工确认。",
      },
      {
        zh: "好的 Agent prompt 既要具体到足以约束自主行为，又要保留新情境下的判断空间；过度僵硬会让 Agent 无法处理异常。",
      },
      {
        zh: "系统提示词还应与外部状态、记忆和工具定义协同，而不是把所有架构规则都塞进一段不可维护的长提示词。",
      },
    ],
    "KV-cache 让上下文顺序变成成本问题": [
      {
        zh: "KV-cache 的工程含义是：多轮请求中保持不变的前缀可以复用计算，只有末尾新增 token 需要重新处理。",
      },
      {
        zh: "因此系统提示词、工具定义和长期稳定规则应放在上下文顶部，尽量保持顺序和内容稳定。",
      },
      {
        zh: "会话历史、当前步骤、工具结果和 Agent 状态等动态内容应放在底部，避免频繁改变前缀导致缓存失效。",
      },
      {
        zh: "原文还提醒不要在对话中频繁动态增删工具，因为工具定义变化会破坏缓存，也会改变模型对可用行动空间的理解。",
      },
    ],
  },
};

const selfRepairingAgentHarnessRows = {
  生产失败暴露的是修复缺口: [
    {
      zh: "生产 Agent 失败时，传统 observability 通常只给出 span tree、模型调用、工具调用、延迟与 token 成本；这些事实能复盘发生了什么，却不能直接告诉团队应该改哪里。",
    },
    {
      zh: "原文的核心判断是：瓶颈不在 trace 是否存在，而在 trace 之后的诊断、修复、验证和回归沉淀仍然依赖人工循环。",
    },
    {
      zh: "Cursor 的 harness 经验说明，同一个底层模型外面包裹的 prompts、tools 和 checks 会显著影响结果；生产能力来自持续维护这层 harness，而不是只升级模型。",
    },
    {
      zh: "因此“自修复 harness”不是让系统无审批自动改代码，而是把失败 trace 转化为可解释根因、受控 diff、复跑验证和 regression case 的连续流程。",
    },
  ],
  规模化让手工调试循环反复打开: [
    {
      zh: "当前平台如果只停在 dashboard，就会把三个关键问题交还给工程师：为什么失败、应该改什么、如何保证下周不会再次失败。",
    },
    {
      zh: "规模化以后，新模型会带来新 failure modes，新工具会带来新 edge cases，agent graph 的复杂度增长快于人工逐条排查的速度。",
    },
    {
      zh: "原文把 2023 年可接受的抽象称为过时抽象：当 agent 进入生产，trace 只是入口，真正的产品边界应覆盖 trace 之后的修复闭环。",
    },
    {
      zh: "专业化的堆栈需要同时管理运行事实、因果诊断、代码级修复、回放验证和测试资产增长，否则每次模型或工具变化都会重启同一套人工流程。",
    },
  ],
  "Opik 的前提是自动化 trace 之后的循环": [
    {
      zh: "Opik 被描述为面向 AI agents 和 LLM applications 的开源 logging、debugging 与 optimization 平台；它的定位不是单点可观测性，而是连接整个修复 workflow。",
    },
    {
      zh: "四层栈的顺序是：Trace 捕获生产失败，Ollie 读取 trace 并诊断，Ollie 提出受控修复，修复被应用并验证，Test Suite 将失败锁定为回归用例。",
    },
    {
      zh: "这个循环的关键是把每次失败转化为长期资产：失败输入不只是一次事故记录，而会进入 regression suite，让下一轮 harness 更难被同类问题击穿。",
    },
    {
      zh: "因此 Opik 的专业价值不在“多一个 trace viewer”，而在把 trace viewer、coding agent、sandbox replay 和 eval/test suite 组织成一个闭合系统。",
    },
  ],
  "Tracing 提供可复现的运行事实": [
    {
      zh: "Tracing 层负责记录每一次 LLM call、tool invocation 和 retrieval step，并通过 decorator 自动埋点，降低 agent graph 被观测的接入成本。",
    },
    {
      zh: "每条 trace 还记录当时生效的 agent configuration，这一点对复现很关键：失败并不只来自输入，也可能来自 prompt、model、tool 或 retrieval 配置组合。",
    },
    {
      zh: "原文强调 Opik 与 LangGraph、CrewAI 以及 50+ frameworks 的集成，说明 tracing 需要覆盖真实框架里的多节点执行，而不是只记录单次 chat completion。",
    },
    {
      zh: "Tracing 的输出是修复链路的事实基线：没有完整 span tree 和配置快照，后续根因分析、side-by-side replay 与回归锁定都会失去可比性。",
    },
  ],
  "Ollie 从 span 树走到受控代码修复": [
    {
      zh: "Ollie 是嵌入 Opik 的 coding agent。无代码访问时，它读取 span tree，识别 failure mode，并解释多个 LLM call 之间的因果链。",
    },
    {
      zh: "当团队在项目根目录运行 `opik connect` 后，Ollie 进入 code-fix mode：读取源文件，定位相关行，提出 diff，但不会在没有明确批准时直接修改代码。",
    },
    {
      zh: "获批后，Ollie 会用原始 failing trace 的相同输入重跑 agent，生成新 trace，并与旧 trace 做 side-by-side comparison，验证修复是否真正改变了失败路径。",
    },
    {
      zh: "专业重点是“受控自动化”：Ollie 承担跨 trace 和代码的分析劳动，但 approval、rerun、comparison 和 regression lock 让修复仍然可审计、可回滚、可验证。",
    },
  ],
  "Test Suites 用真实失败沉淀质量约束": [
    {
      zh: "原文批评传统 eval workflow 过度依赖 labeled dataset、numerical metric 和 float comparison；这种模式适合研究评估，却不完全匹配工程团队对质量的表达方式。",
    },
    {
      zh: "Opik 的 Test Suites 使用 plain-English assertions，再在底层转为 LLM-as-a-judge checks，给每个 test case 一个清晰的 pass/fail 结果。",
    },
    {
      zh: "最重要的机制是失败沉淀：每条被调试的 failing trace 都会自动成为新的 test case，测试集从生产失败中增长，而不是只依赖预先构造的合成场景。",
    },
    {
      zh: "这让 harness 质量形成累积效应。每修复一次真实失败，系统不仅解决当前 bug，也为未来模型升级、工具变更和 prompt 调整提供回归边界。",
    },
  ],
  "Sandbox 和飞轮验证完整 Agent 图": [
    {
      zh: "大多数 playground 只验证单次提示词改动：改系统提示词，再重跑一次 LLM 调用。原文认为这回答的是错误问题。",
    },
    {
      zh: "生产环境真正要问的是：当我修改提示词、替换模型或新增工具时，整个 agent graph 会如何响应。",
    },
    {
      zh: "Opik 的 Agent Sandbox 在 UI 中端到端运行完整埋点的 agent，并让每次 sandbox 运行都生成一条完整 Opik trace。",
    },
    {
      zh: "因此 Sandbox 的价值不是替代测试套件，而是让 PM、领域专家、QA 等非开发者也能在不触碰 git 的情况下安全测试配置。",
    },
    {
      zh: "飞轮的实际路径是：`@opik.track` 埋点，声明 `opik.Config`，生产失败进入 trace，Ollie 读 trace 和源码提出修复，批准后在 Sandbox 对原始失败输入复跑。",
    },
    {
      zh: "当修复通过后，团队可以保存新的 Blueprint，将环境指针推进到 staging，并把原始失败锁定为 regression test；下一次失败继续进入同一闭环。",
    },
  ],
};

const longRunningClaudeRows = {
  "科学家从紧控对话转向长任务 Agent": [
    {
      zh: "文章讨论的不是把科学研究完全外包给模型，而是把清晰目标、可量化成功标准和偶发人工监督结合起来，让 agent 在较长时间尺度上推进科学计算代码任务。",
    },
    {
      zh: "适用前提是任务边界足够明确：例如重实现 numerical solver、迁移旧 Fortran 科学软件、或用 reference implementation 调试大型代码库。",
    },
    {
      zh: "这类任务与开放式科学发现不同。Agent 必须能通过 reference implementation、objective metric 或 existing test suite 判断自己是否在进步。",
    },
    {
      zh: "文章的实践场景是典型 academic lab：研究者有高层目标和有限监督时间，Claude Code 负责长时间执行、记录进展、运行测试并在必要时请求人类 steering。",
    },
  ],
  "哪些科学计算任务适合长时间 Agent": [
    {
      zh: "适合任务通常具备三个条件：work well-scoped、success criteria clear、human oversight occasional rather than continuous。缺少这些条件时，长时间自治只会放大错误。",
    },
    {
      zh: "作者列举的任务包括：reimplementing a numerical solver、converting legacy scientific software in old Fortran dialect to a modern language、debugging against a reference implementation。",
    },
    {
      zh: "C 编译器项目可以大量并行拆给约 2,000 sessions；Boltzmann solver 则是 deeply coupled pipeline，微小数值误差会沿着 photons、baryons、neutrinos、dark matter 的耦合方程传导。",
    },
    {
      zh: "因此科学计算长任务更依赖单个 agent 顺序推进、必要时 spawning subagents，并用 reference implementation bisect discrepancies，而不是简单扩大并行 agent 数量。",
    },
  ],
  "从 C 编译器到宇宙学 Boltzmann solver": [
    {
      zh: "具体案例是用 Claude Opus 4.6 实现 differentiable version of a cosmological Boltzmann solver，即 `clax` 项目，用来预测 Cosmic Microwave Background 的统计性质。",
    },
    {
      zh: "参考对象是 CLASS 和 CAMB 这类宇宙学基础设施，它们用于基于 Planck、Simons Observatory 等观测数据约束 cosmological models。",
    },
    {
      zh: "作者并非该细分领域专家，这一点很关键：实验目标是观察 agent 能否在非核心专业领域中，通过明确目标、参考实现和持续测试推进复杂科学代码。",
    },
    {
      zh: "目标不是声称 agent 已替代领域专家，而是验证在有 oracle 和清晰误差指标时，长任务 coding workflow 能否显著压缩 researcher-time。",
    },
  ],
  "为什么 differentiable solver 有意义": [
    {
      zh: "Differentiable solver 的价值在于能把 gradients 传过完整 solver，从而使用 gradient-based inference methods，大幅加速 parameter estimation。",
    },
    {
      zh: "JAX 是自然选择，因为它同时提供 automatic differentiation 和 accelerator compatibility，例如 GPU 支持，这些能力对现代数值推断工作流很重要。",
    },
    {
      zh: "精度目标设为 main science deliverables 与 CLASS 达到 0.1% agreement，因为 CLASS 与 CAMB 这两个 canonical Boltzmann codes 之间通常也以这个量级作为比较标准。",
    },
    {
      zh: "文章同时承认边界：最终 solver reached sub-percent agreement across outputs，但并非 production-grade，也没有在每个 regime 都达到 reference CLASS 的可接受精度。",
    },
  ],
  "长任务 Agent 的三个支点": [
    {
      zh: "`CLAUDE.md` 是项目说明和执行规则的锚点：它放在 repo root，写明 deliverables、相关上下文、设计决策和验收标准，并允许 Claude 在工作中更新。",
    },
    {
      zh: "`CHANGELOG.md` 是 portable long-term memory，类似 lab notes，记录 current status、completed tasks、failed approaches、accuracy tables 和 known limitations。",
    },
    {
      zh: "failed approaches 必须写入进度文件，否则后续 sessions 会重新尝试同样的 dead ends；文章举例说明 stiff ODE solver 选择失败后要记录为何切换。",
    },
    {
      zh: "test oracle 是长期科学任务的核心。Claude 被要求用 CLASS C source 作为 reference implementation 构造并持续运行 unit tests，以防回归并衡量是否接近目标。",
    },
  ],
  "用 Git、tmux 和 SLURM 管理无人值守运行": [
    {
      zh: "Git 用来监控和协调无人值守进展：agent 应在每个 meaningful unit of work 后 commit and push，提交前运行指定测试，避免 compute allocation 中断导致工作丢失。",
    },
    {
      zh: "tmux 解决长时间终端会话的可恢复性。Agent 在 compute node 的 tmux session 中运行，研究者可以 detach、关闭电脑，再通过 SSH 重新 attach 检查或 steering。",
    },
    {
      zh: "SLURM 脚本负责申请 HPC 资源，例如 GPU partition、H100、48 小时 wall time，并在 job 启动后进入项目目录、激活环境、启动 Claude Code。",
    },
    {
      zh: "本质上，Git 提供历史与回滚，tmux 提供会话持久性，SLURM 提供计算资源边界；三者共同让 agent 的长任务执行变成可观察的实验运行。",
    },
  ],
  反复确认完成状态的编排模式: [
    {
      zh: "Ralph loop 用来应对 agentic laziness：当模型声称任务完成时，loop 会把它重新拉回上下文，询问是否真的满足 specification，并促使它继续补齐缺口。",
    },
    {
      zh: "示例 invocation 要求 Claude 持续工作，直到 across the entire parameter range 达到 0.1% accuracy，并设置 `--max-iterations 20` 与 `DONE` completion promise。",
    },
    {
      zh: "作者同时提到 GSD、domain-specific variants 和 Claude Code 原生 `/loop`。这些模式的共同点是用轻量 scaffold 补足当前模型在长任务坚持性上的短板。",
    },
    {
      zh: "Ralph loop 不替代 oracle。它只负责推动 agent 继续执行；是否真的完成，仍必须回到精度表、测试结果、reference implementation 和人类检查。",
    },
  ],
};

const breakingDownContextEngineeringRows = {
  "What is Context Engineering and why it is important.": [
    {
      zh: "Agentic System 可以理解为多个 LLM 调用节点通过循环或顺序流程连接而成的拓扑；无论是迭代循环还是顺序流程，每个节点输出都会影响下游系统。",
    },
    {
      zh: "Agent 的质量取决于每一步喂给 LLM 的上下文质量。上下文窗口变大并不等于效果变好，把更多数据塞进提示词本身会制造新的失败模式。",
    },
    {
      zh: "文章列出四类典型风险：Context Poisoning 是幻觉进入上下文，Distraction 是上下文淹没模型训练信号，Confusion 是多余信息影响响应，Clash 是上下文片段互相冲突。",
    },
    {
      zh: "Context Engineering 的定义是：在特定 Agentic System 步骤中提供最少但足够聚焦的上下文，让该步骤完成它被设计来完成的工作。",
    },
    {
      zh: "现代 Agent 系统需要编排多种上下文，包括系统指令、用户请求、检索内容、短期状态、长期记忆、工具和结构化输出。",
    },
    {
      zh: "后续章节逐一拆解这些上下文类型的工程挑战：如何选择、组织、压缩、防护，并让它们在多步骤工作流中保持一致。",
    },
  ],
  "Instructions / System Prompt.": [
    {
      zh: "系统提示词是模型输出的“护栏”：它在任何用户输入进入之前定义角色、行为边界、语气、范围和响应风格，确保模型在不同请求下仍遵守统一规则。",
    },
    {
      zh: "核心挑战是对齐密度。系统提示既要覆盖事实性检查、风格规范和安全边界，又受上下文空间限制；过少会跑偏，过多会压制有用行为。",
    },
    {
      zh: "提示注入风险来自用户输入与系统指令的冲突。当前 LLM 不能完美区分系统规则和用户文本，攻击者可能嵌入相反指令诱导模型忽略原有约束。",
    },
    {
      zh: "当用户需求落在允许范围之外时，系统提示要求模型拒绝或改写任务；工程难点是在遵守约束的同时尽量保持有用性和可解释性。",
    },
  ],
  "User Prompt.": [
    {
      zh: "用户提示词是直接请求，也是传统 Prompt Engineering 的主要对象；但在 Agent 系统里，它只是上下文链路的起点，而不是完整解决方案。",
    },
    {
      zh: "真实任务经常包含多轮互动、追问和外部信息需求。一个问题可能要先搜索，再摘要，再格式化输出，无法靠单轮 Agent 调用可靠完成。",
    },
    {
      zh: "上下文工程要把复杂请求拆成更小的子任务或提示链，并在执行过程中持续维护用户真实意图、当前步骤和后续依赖。",
    },
    {
      zh: "多轮完成度需要评估体系支撑：系统必须验证是否真正理解并满足用户请求，而不是只对最后一轮文本作局部响应。",
    },
  ],
  "Retrieved Context.": [
    {
      zh: "检索上下文是从数据库、文档、网页或 API 拉取的外部信息；当模型参数知识不足以回答问题时，这些信息会被注入当前提示词。",
    },
    {
      zh: "主要难点是选择而非堆叠。面对企业知识库或互联网规模语料，系统要从大量候选片段中选出最相关、最可靠、最低噪声的内容。",
    },
    {
      zh: "上下文窗口有限，检索过少会遗漏关键事实，检索过多会引入噪声并触发混淆模式；这本质上是一个受窗口约束的优化问题。",
    },
    {
      zh: "可行做法包括混合检索、排序、过滤低质量或冲突片段、摘要压缩，以及在嵌入前做好语料切块、周边上下文和全局元数据处理。",
    },
  ],
  "State (short-term memory).": [
    {
      zh: "短期状态接近工作记忆，包含当前会话最近消息和系统最新状态；它服务于当前任务，而不是跨会话长期保存所有信息。",
    },
    {
      zh: "关键原则是最小必要状态。并不是每次 LLM 调用都要携带完整对话历史，而是只传入能让模型完成当前步骤的状态片段。",
    },
    {
      zh: "长对话或长任务会超过上下文窗口，因此系统必须决定记住什么、遗忘什么；过度保留会触发 token 限制，过度裁剪会导致重复提问或重复工具调用。",
    },
    {
      zh: "工程手段包括摘要、裁剪、上下文缓存和关键指令再注入，用来控制上下文漂移，避免早期目标和事实在多轮执行中被稀释。",
    },
  ],
  "Long-Term Memory.": [
    {
      zh: "长期记忆让 Agent 在当前会话之外保存信息，例如用户偏好、个人资料、历史事实或需要长期持久化的交互记录。",
    },
    {
      zh: "实现方式可以从简单的历史问答数据库，到可按需检索的向量化会话记录；共同点是持久化保存，并在相关时拉回当前上下文。",
    },
    {
      zh: "相关性检索是首要挑战。长期记忆可能积累数月信息，但当前问题通常只需要少量片段，不能把全部记忆直接塞进提示词。",
    },
    {
      zh: "记忆还要处理一致性、更新和隐私：过期或错误信息会损害信任，个人数据长期存储需要防护，过长的记忆摘要也可能与当前指令冲突。",
    },
    {
      zh: "文章把长期记忆拆成三类：Episodic 保存过去互动和动作，Semantic 保存外部知识或 Agent 自身知识，Procedural 保存系统提示、工具和护栏等程序性信息。",
    },
    {
      zh: "当任务需要时，Agent 会从长期记忆取回信息并放入本地工作记忆；这些短期汇总再被编译成传给 LLM 的提示词，驱动下一步动作。",
    },
  ],
  "Tools.": [
    {
      zh: "工具让 Agent 能调用 API、运行代码、搜索网页或执行预定义检索；它们扩展了模型能力，也把外部环境的状态带入上下文。",
    },
    {
      zh: "暴露工具时要同时管理两类上下文：工具定义说明有哪些工具以及如何使用，工具输出则是模型下一轮响应必须整合的外部结果。",
    },
    {
      zh: "基础工具调用流程是：用户请求进入 Agent，应用代码定义可用函数，函数列表随请求交给 LLM，模型决定调用哪个工具及参数，应用执行函数，再把结果交回模型生成答案。",
    },
    {
      zh: "模型必须理解何时调用工具、如何组织参数结构，以及所有参数应放在约定对象内；格式约束不足时，工具调用容易出现字段错位或无效参数。",
    },
    {
      zh: "工具输出进入上下文前需要后处理。返回结果过大时，应抽取相关部分、压缩或摘要后再追加，否则很快耗尽窗口并降低后续推理质量。",
    },
    {
      zh: "多步工具链还要维护状态。类似 ReAct 的架构会在推理、调用、分析结果之间循环，系统必须保留原始用户问题和当前推理进度。",
    },
    {
      zh: "工具失败或返回异常时，需要为非确定性部分加安全网：提示模型如何处理错误、何时停止、如何向用户说明，而不是继续基于坏结果推理。",
    },
    {
      zh: "安全风险同样属于工具上下文工程：网页、文件或 API 返回内容可能包含提示注入或敏感数据，系统必须在注入模型前进行防护和过滤。",
    },
  ],
  "Structured Output.": [
    {
      zh: "在 Agent 应用中，自由文本往往不够用，因为一次 LLM 输出可能会成为下一次 LLM 调用、程序步骤或数据库操作的输入。",
    },
    {
      zh: "结构化输出包括 JSON、HTML 片段或 SQL 等特定格式；上下文工程需要把格式规则、schema、grammar 或函数调用约束写入系统设计。",
    },
    {
      zh: "可靠性难点在于精确格式：模型可能遗漏括号、添加额外解释或幻觉字段；即使使用函数调用和解码约束，也不是所有系统都原生支持。",
    },
    {
      zh: "改进方向是验证器、格式强制和重试机制。文章提到 Instructor 这类库会用 Pydantic schema 校验输出，并在解析失败时自动重试。",
    },
  ],
};

const buildingEffectiveAgentsExamples = {
  "Workflow: Prompt chaining": [
    "先生成营销文案，再把它翻译成另一种语言。",
    "先撰写文档大纲，检查大纲是否满足特定标准，然后基于该大纲撰写文档。",
  ],
  "Workflow: Routing": [
    "把不同类型的客服查询（一般问题、退款请求、技术支持）导向不同的下游流程、提示词和工具。",
    "把简单/常见问题路由到成本更低的模型，把困难/少见问题路由到能力更强的模型，以优化整体表现。",
  ],
  "Workflow: Parallelization": [
    "分区：一个模型处理用户查询，另一个模型筛查不当内容或请求，用于实现更稳健的护栏。",
    "分区：自动化 eval 时，让不同 LLM 调用分别评估同一提示下模型表现的不同方面。",
    "投票：让多个提示审查同一段代码的漏洞，只要发现问题就标记。",
    "投票：多个提示从不同角度判断内容是否不当，并通过不同阈值平衡误报和漏报。",
  ],
  "Workflow: Orchestrator-workers": [
    "每次都需要对多个文件做复杂修改的编码产品。",
    "需要从多个来源收集并分析信息，以寻找潜在相关内容的搜索任务。",
  ],
  "Workflow: Evaluator-optimizer": [
    "文学翻译：译者 LLM 起初可能漏掉细微差别，而评估 LLM 能提供有用批评。",
    "复杂搜索任务：需要多轮搜索和分析来收集完整信息，由评估者判断是否还需要继续搜索。",
  ],
  Agents: [
    "用于解决 SWE-bench 任务的编码 Agent，这类任务需要根据任务描述编辑许多文件。",
    "Anthropic 的 computer use 参考实现，其中 Claude 使用计算机完成任务。",
  ],
};

function visualSlide({ asset, index, title }) {
  const caption = normalizeVisualText(asset.caption) || asset.heading || title;
  const explanation =
    normalizeVisualText(asset.explanation) ||
    normalizeVisualText(asset.alt) ||
    trimText(
      normalizeVisualText(asset.evidence) || `${asset.heading || title} 的关键视觉线索。`,
      180,
    );

  return `<section class="slide" data-slide-kind="visual-${index}">
  <div class="slide-content slide-layout split" data-alternate="auto">
    <div class="visual-panel reveal">
      <figure class="visual-card">
        <img src="${asset.embedded}" width="720" height="405" alt="${escapeAttribute(caption)}" class="slide-image screenshot">
        <figcaption>${escapeHtml(caption)}</figcaption>
      </figure>
    </div>
    <div class="text-panel bounded-copy">
      <p class="eyebrow reveal">结构图解 · ${String(index).padStart(2, "0")}</p>
      <h2 class="reveal">${escapeHtml(title)}</h2>
      <p class="lead reveal">${escapeHtml(explanation)}</p>
        <p class="source-note reveal">${escapeHtml(asset.heading || caption)}</p>
    </div>
  </div>
</section>`;
}

function closingSlide({ rule, sourceTitle, sourceUrl, studyMeta }) {
  return `<section class="slide" data-slide-kind="closing">
  <div class="slide-content slide-layout split">
    <div class="text-panel bounded-copy">
      <p class="eyebrow reveal">结论</p>
      <h2 class="reveal">${escapeHtml(rule.closingTitle ?? rule.thesis)}</h2>
      <p class="lead reveal">${escapeHtml(rule.closingLead ?? studyMeta.description)}</p>
    </div>
    <div class="bounded-panel evidence-panel reveal">
      <span class="panel-label">原文</span>
      <h3>${escapeHtml(sourceTitle)}</h3>
      <p class="source-note">原文：<a href="${escapeAttribute(sourceUrl)}" target="_blank" rel="noopener">《${escapeHtml(sourceTitle)}》</a></p>
    </div>
  </div>
</section>`;
}

function numberedCard(title, body, index) {
  return `<article class="info-card reveal"><span class="card-index">${String(index).padStart(2, "0")}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p></article>`;
}

function visualNarrativeTitle(section, asset) {
  const sectionTitle = section.title ?? section.toc ?? asset.heading ?? "来源段落";
  const caption =
    normalizeVisualText(asset.caption) || normalizeVisualText(asset.alt) || asset.heading;
  if (!caption || caption === sectionTitle) {
    return sectionTitle;
  }

  return `${sectionTitle}：${trimText(caption, 72)}`;
}

function selectSections(sections, indexes) {
  return indexes.map((index) => sections[index]).filter(Boolean);
}

function chunkRows(rows, size) {
  const chunks = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

function deckCss() {
  return `
body { font-family: var(--font-body); }
.slide {
  background:
    radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 30%),
    radial-gradient(circle at 86% 82%, color-mix(in srgb, var(--accent2) 14%, transparent), transparent 32%),
    linear-gradient(135deg, var(--slide-bg), var(--bg-secondary));
}
.slide::after { content: ""; position: absolute; inset: 42px; border: 1px solid var(--line); pointer-events: none; }
.slide-content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; padding: var(--slide-padding); gap: var(--content-gap); }
.slide-content.is-thin { justify-content: center; align-items: stretch; }
.slide-content[data-layout-density="dense"] { --content-gap: 22px; }
.slide-content[data-layout-density="dense"] h2 { font-size: calc(var(--heading-size) * .9); }
.slide-content[data-layout-density="dense"] p,
.slide-content[data-layout-density="dense"] li { font-size: calc(var(--body-size) * .9); line-height: 1.36; }
.slide-layout { width: 100%; min-height: 0; display: grid; gap: var(--content-gap); align-items: center; }
.slide-layout.split,
.slide-layout.split.is-reversed { grid-template-columns: repeat(2, minmax(0,1fr)); }
.slide:nth-of-type(odd) .slide-layout.split[data-alternate="auto"] .visual-panel { order: 2; }
.slide:nth-of-type(even) .slide-layout.split[data-alternate="auto"] .visual-panel { order: -1; }
.bounded-panel,
.visual-panel,
.text-panel { min-width: 0; min-height: 0; max-height: calc(1080px - (var(--slide-padding) * 2)); overflow: hidden; }
.bounded-copy { max-width: 1160px; overflow-wrap: anywhere; }
.visual-panel figure { display: grid; gap: 18px; max-height: 100%; }
.visual-panel img,
.visual-panel svg { width: 100%; max-height: 640px; object-fit: contain; }
.visual-panel figcaption { font-size: calc(var(--body-size) * .72); line-height: 1.38; color: var(--text-secondary); }
.title-slide { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--slide-padding); text-align: center; }
.title-block { width: min(1320px, 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 26px; margin-inline: auto; }
.title-slide h1 { max-width: 1200px; }
.title-slide .subtitle { max-width: 1100px; font-size: var(--subtitle-size); line-height: 1.38; color: var(--text-secondary); text-wrap: balance; }
.slide h1,
.slide h2,
.slide h3 { line-height: 1.08; padding-block: .08em .12em; margin-block: -.08em 0; text-wrap: balance; color: var(--text-primary); }
.slide h1 { padding-block: .3em .2em; margin-block: -.1em 0; font-family: var(--font-display); font-size: var(--title-size); letter-spacing: -.052em; }
.slide h2 { font-family: var(--font-display); font-size: var(--heading-size); letter-spacing: -.038em; }
.slide h3 { font-size: 27px; letter-spacing: -.018em; }
.slide a { color: var(--link-color); text-decoration-line: underline; text-decoration-thickness: .08em; text-underline-offset: .16em; text-decoration-color: var(--link-underline); border-radius: .12em; overflow-wrap: anywhere; transition: color 160ms ease, background 160ms ease, text-decoration-color 160ms ease; }
.slide a:visited { color: var(--link-visited); }
.slide a:hover,
.slide a:focus-visible { color: var(--link-hover); background: var(--link-hover-bg); text-decoration-color: currentColor; outline: none; box-shadow: 0 0 0 .12em var(--link-focus-ring); }
.slide img { cursor: zoom-in; }
.eyebrow { color: var(--accent); font-weight: 900; letter-spacing: .16em; text-transform: uppercase; font-size: 17px; }
.lead { max-width: 1120px; font-size: 28px; line-height: 1.45; color: var(--text-secondary); }
.source-credit,
.source-note,
.footnote { color: var(--text-secondary); font-size: 20px; line-height: 1.45; }
.panel-label { display: inline-flex; width: fit-content; border: 1px solid var(--line); color: var(--accent); padding: 8px 14px; border-radius: 999px; background: var(--panel); font-weight: 800; font-size: 17px; }
.module-grid { display: grid; gap: 20px; width: 100%; margin-inline: auto; }
.module-grid[data-count="1"] { grid-template-columns: minmax(0,1fr); max-width: 760px; }
.module-grid[data-count="2"] { grid-template-columns: repeat(2, minmax(0,1fr)); max-width: 1180px; }
.module-grid[data-count="3"] { grid-template-columns: repeat(3, minmax(0,1fr)); }
.module-grid[data-count="4"] { grid-template-columns: repeat(2, minmax(0,1fr)); max-width: 1240px; }
.module-grid[data-count="6"] { grid-template-columns: repeat(3, minmax(0,1fr)); }
.module-grid[data-count="5"],
.module-grid[data-count="7"] { grid-template-columns: repeat(12, minmax(0,1fr)); }
.module-grid[data-count="5"] > *:nth-child(-n + 3) { grid-column: span 4; }
.module-grid[data-count="5"] > *:nth-child(n + 4) { grid-column: span 6; }
.module-grid[data-count="7"] > *:nth-child(-n + 4) { grid-column: span 3; }
.module-grid[data-count="7"] > *:nth-child(n + 5) { grid-column: span 4; }
.module-grid.items-1 { grid-template-columns: minmax(0,1fr); max-width: 760px; }
.module-grid.items-2 { grid-template-columns: repeat(2, minmax(0,1fr)); max-width: 1180px; }
.module-grid.items-3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
.module-grid.items-4 { grid-template-columns: repeat(2, minmax(0,1fr)); max-width: 1240px; }
.module-grid.items-5,
.module-grid.items-7 { grid-template-columns: repeat(12, minmax(0,1fr)); }
.module-grid.items-5 > *:nth-child(-n + 3) { grid-column: span 4; }
.module-grid.items-5 > *:nth-child(n + 4) { grid-column: span 6; }
.module-grid.items-6 { grid-template-columns: repeat(3, minmax(0,1fr)); }
.module-grid.items-7 > *:nth-child(-n + 4) { grid-column: span 3; }
.module-grid.items-7 > *:nth-child(n + 5) { grid-column: span 4; }
.module-grid.items-8 { grid-template-columns: repeat(4, minmax(0,1fr)); }
.module-grid.items-9 { grid-template-columns: repeat(3, minmax(0,1fr)); }
.agenda-grid.items-7 .info-card { min-height: 150px; padding: 20px; }
.agenda-grid.items-7 .info-card p { font-size: 18px; }
.audit-grid { max-width: 1320px; }
.info-card,
.path-node,
.term,
.source-row,
.evidence-panel,
.visual-card { border: 1px solid var(--line); background: linear-gradient(150deg, var(--panel-strong), var(--panel)); border-radius: var(--module-radius); }
.info-card { min-height: 196px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
.card-index { color: var(--accent); font-weight: 950; font-size: 17px; letter-spacing: .12em; }
.info-card p,
.path-node p,
.term p,
.evidence-panel p,
.evidence-panel li,
.source-row small { color: var(--text-secondary); font-size: 20px; line-height: 1.42; }
.evidence-panel { padding: 34px; display: grid; gap: 18px; }
.evidence-panel.compact { padding: 24px; margin-top: 24px; }
.evidence-panel ul { display: grid; gap: 14px; padding-left: 22px; }
.evidence-panel li b { display: block; color: var(--text-primary); margin-bottom: 4px; }
.path-grid { gap: 18px; }
.path-node { position: relative; min-height: 168px; padding: 23px; }
.path-node::before { content: attr(data-step); position: absolute; right: 20px; top: 16px; color: color-mix(in srgb, var(--accent) 42%, transparent); font-size: 50px; font-weight: 950; line-height: 1; }
.path-node h3 { max-width: calc(100% - 62px); }
.source-rows { gap: 18px; }
.source-rows.items-3 { max-width: 1400px; }
.source-row { min-height: 260px; padding: 24px; display: flex; flex-direction: column; gap: 13px; }
.source-row b { color: var(--accent); letter-spacing: .12em; font-size: 17px; }
.source-row p { color: var(--text-primary); font-size: 23px; line-height: 1.38; }
.source-row small { display: block; margin-top: auto; border-top: 1px solid var(--line); padding-top: 12px; font-size: 16px; }
.visual-card { padding: 18px; }
.slide-image.screenshot { border: 1px solid var(--line); border-radius: 14px; box-shadow: 0 14px 44px rgba(0,0,0,.22); background: #fff; }
.term-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
.term { min-height: 174px; padding: 22px; }
.term b { display: block; font-size: 27px; color: var(--text-primary); margin: 8px 0; overflow-wrap: anywhere; }
.term span { color: var(--accent); font-weight: 800; font-size: 15px; }
.theme-electric .slide { background: linear-gradient(90deg, var(--accent) 0 18px, transparent 18px), radial-gradient(circle at 80% 18%, rgba(255,255,255,.16), transparent 24%), linear-gradient(135deg, var(--slide-bg), var(--bg-secondary)); }
.theme-neon .slide { background-image: linear-gradient(rgba(34,211,238,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(244,114,182,.08) 1px, transparent 1px), radial-gradient(circle at 72% 28%, rgba(34,211,238,.18), transparent 28%), linear-gradient(135deg, var(--slide-bg), var(--bg-secondary)); background-size: 54px 54px, 54px 54px, auto, auto; }
.theme-swiss .slide,
.theme-paper .slide { background-image: linear-gradient(90deg, rgba(17,17,17,.06) 1px, transparent 1px), linear-gradient(180deg, rgba(17,17,17,.06) 1px, transparent 1px), linear-gradient(135deg, var(--slide-bg), var(--bg-secondary)); background-size: 120px 120px, 120px 120px, auto; }
.theme-notebook .slide::before { content: ""; position: absolute; right: 42px; top: 120px; width: 34px; height: 760px; background: linear-gradient(var(--accent) 0 20%, #f59e0b 20% 40%, var(--accent2) 40% 60%, #38bdf8 60% 80%, #a78bfa 80%); border-radius: 18px; }
.theme-copper .slide { background: radial-gradient(circle at 20% 26%, rgba(245,158,11,.18), transparent 28%), linear-gradient(135deg, var(--slide-bg), var(--bg-secondary)); }
.image-lightbox { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: min(6vw, 96px); background: radial-gradient(circle at 50% 42%, rgba(255,255,255,.16), transparent 36%), linear-gradient(135deg, rgba(6,10,18,.72), rgba(18,24,38,.48)); -webkit-backdrop-filter: blur(18px) saturate(1.2); backdrop-filter: blur(18px) saturate(1.2); opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 220ms ease, visibility 220ms ease; }
.image-lightbox.is-open { opacity: 1; visibility: visible; pointer-events: auto; }
.image-lightbox[hidden] { display: none; }
.image-lightbox__panel { position: relative; display: grid; max-width: min(82vw, 1280px); max-height: 82vh; }
.image-lightbox__image { display: block; max-width: min(82vw, 1280px); max-height: 78vh; object-fit: contain; border-radius: 18px; box-shadow: 0 30px 100px rgba(0,0,0,.48); }
.image-lightbox__close { position: absolute; top: -18px; right: -18px; width: 44px; height: 44px; border: 1px solid rgba(255,255,255,.32); border-radius: 999px; background: rgba(10,14,24,.72); color: #fff; cursor: pointer; font-size: 26px; }
.reveal { opacity: 0; transform: translateY(30px); transition: opacity var(--duration-normal) var(--ease-out-expo), transform var(--duration-normal) var(--ease-out-expo); }
.slide.visible .reveal { opacity: 1; transform: translateY(0); }
.deck-controls-zone { position: fixed; left: 0; right: 0; bottom: 0; height: 70px; z-index: 1000; pointer-events: auto; }
.deck-controls { position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%) translateY(24px); display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 40px; padding: 5px 8px; border-radius: 999px; background: var(--kbd-bar-bg, rgba(12,16,24,.74)); border: 1px solid var(--chrome-border, rgba(255,255,255,.18)); box-shadow: 0 12px 30px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.08); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); font: 700 13px var(--font-body); color: var(--kbd-text, rgba(255,255,255,.88)); opacity: 0; filter: blur(5px); transition: opacity .42s var(--ease-out-expo), transform .48s var(--ease-out-expo), filter .42s var(--ease-out-expo), background .22s ease, border-color .22s ease, color .22s ease; width: max-content; max-width: min(92vw,720px); will-change: opacity, transform, filter; }
.deck-controls-zone:hover .deck-controls,
.deck-controls-zone.show-controls .deck-controls,
.deck-controls-zone:focus-within .deck-controls,
.deck-controls:focus { opacity: .96; transform: translateX(-50%) translateY(0); filter: blur(0); }
.deck-page-controls,
.deck-shortcuts { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.deck-page-btn { width: 28px; height: 28px; padding: 0; border: 0; border-radius: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; background: transparent; color: var(--kbd-key-text, #fff); transition: color .18s ease, opacity .18s ease, transform .18s ease; }
.deck-page-btn svg { width: 20px; height: 20px; display: block; }
.deck-page-btn:hover { color: var(--control-accent, var(--accent)); transform: scale(1.08); }
.deck-page-btn:disabled { opacity: .38; cursor: default; }
.deck-page-btn:disabled:hover { color: var(--kbd-key-text, #fff); transform: none; }
.deck-page-status { min-width: 44px; text-align: center; font-variant-numeric: tabular-nums; color: var(--kbd-text, rgba(255,255,255,.88)); }
.deck-control-separator { width: 1px; height: 22px; margin: 0 4px; background: var(--kbd-separator, rgba(255,255,255,.18)); }
.shortcut-chip { display: inline-flex; align-items: center; gap: 8px; padding: 4px 6px 4px 12px; border-radius: 999px; background: transparent; color: var(--kbd-text, rgba(255,255,255,.88)); font-weight: 500; transition: background .18s ease, color .18s ease; }
.shortcut-chip:hover { background: var(--kbd-bg, rgba(255,255,255,.16)); }
.shortcut-label { font-weight: 500; }
.shortcut-keys { display: inline-flex; align-items: center; gap: 4px; }
.deck-shortcuts kbd { font: 500 11px var(--font-body); min-width: 24px; padding: 4px 7px; text-align: center; border-radius: 7px; background: var(--kbd-bg, rgba(255,255,255,.16)); border: 1px solid var(--kbd-border, rgba(255,255,255,.28)); box-shadow: inset 0 1px 0 rgba(255,255,255,.14), 0 1px 3px rgba(0,0,0,.16); color: var(--kbd-key-text, #fff); line-height: 1; }
.shortcut-chip:hover kbd { background: color-mix(in srgb, var(--kbd-bg, rgba(255,255,255,.16)) 72%, #fff); }
.edit-hotzone { position: fixed; top: 0; left: 0; width: 80px; height: 80px; z-index: 10000; cursor: pointer; }
.edit-toggle { position: fixed; top: 16px; left: 16px; opacity: 0; pointer-events: none; transition: opacity .3s ease; z-index: 10001; border: 1px solid var(--chrome-border); border-radius: 999px; min-width: 54px; height: 38px; padding: 0 14px; cursor: pointer; background: var(--kbd-bar-bg); color: var(--kbd-text); }
.edit-toggle.show,
.edit-toggle.active { opacity: 1; pointer-events: auto; }
`;
}

function controlsHtml() {
  return `<div class="deck-controls-zone">
  <div class="deck-controls" tabindex="0" aria-label="幻灯片控制">
    <div class="deck-page-controls" aria-label="幻灯片分页">
      <button class="deck-page-btn" id="prevSlide" type="button" aria-label="上一页">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5 8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="deck-page-status"><span id="currentSlide">1</span>/<span id="totalSlides">1</span></span>
      <button class="deck-page-btn" id="nextSlide" type="button" aria-label="下一页">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5 16 12l-7.5 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <span class="deck-control-separator" aria-hidden="true"></span>
    <div class="deck-shortcuts" aria-label="键盘快捷键">
      <span class="shortcut-chip"><span class="shortcut-label">下一页</span><span class="shortcut-keys"><kbd>Space</kbd><kbd>↓</kbd><kbd>→</kbd></span></span>
      <span class="shortcut-chip"><span class="shortcut-label">上一页</span><span class="shortcut-keys"><kbd>←</kbd><kbd>↑</kbd></span></span>
      <span class="shortcut-chip"><span class="shortcut-label">重置</span><span class="shortcut-keys"><kbd>R</kbd></span></span>
    </div>
  </div>
</div>`;
}

function lightboxHtml() {
  return `<div class="image-lightbox" id="imageLightbox" aria-modal="true" role="dialog" aria-label="图片放大视图" hidden>
  <div class="image-lightbox__panel">
    <button class="image-lightbox__close" id="imageLightboxClose" type="button" aria-label="关闭图片放大视图">×</button>
    <img class="image-lightbox__image" id="imageLightboxImage" alt="">
  </div>
</div>`;
}

function editHtml() {
  return `<div class="edit-hotzone"></div>
<button class="edit-toggle" id="editToggle" title="编辑模式 (E)" type="button">编辑</button>`;
}

function controllerScript() {
  return `class SlidePresentation {
    constructor() {
        this.slides = Array.from(document.querySelectorAll('.slide'));
        this.current = 0;
        this.stage = document.getElementById('deckStage');
        this.controlsZone = document.querySelector('.deck-controls-zone');
        this.controlsBar = document.querySelector('.deck-controls');
        this.prevButton = document.getElementById('prevSlide');
        this.nextButton = document.getElementById('nextSlide');
        this.currentSlideLabel = document.getElementById('currentSlide');
        this.totalSlidesLabel = document.getElementById('totalSlides');
        this.lightbox = document.getElementById('imageLightbox');
        this.lightboxImage = document.getElementById('imageLightboxImage');
        this.lightboxClose = document.getElementById('imageLightboxClose');
        this.lightboxOpen = false;
        this.hideControlsTimer = null;
        this.setupControlButtons();
        this.setupStageScale();
        this.setupKeyboardNav();
        this.setupControlsReveal();
        this.setupTouchNav();
        this.setupWheelNav();
        this.setupImageLightbox();
        this.setupInlineEditing();
        this.showSlide(0);
    }

    setupControlButtons() {
        if (this.prevButton) this.prevButton.addEventListener('click', () => this.prev());
        if (this.nextButton) this.nextButton.addEventListener('click', () => this.next());
        if (this.totalSlidesLabel) this.totalSlidesLabel.textContent = String(this.slides.length);
    }

    setupStageScale() {
        const scale = () => {
            const factor = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
            const x = (window.innerWidth - 1920 * factor) / 2;
            const y = (window.innerHeight - 1080 * factor) / 2;
            this.stage.style.transform = \`translate(\${x}px, \${y}px) scale(\${factor})\`;
        };
        scale();
        window.addEventListener('resize', scale);
    }

    setupKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            if (e.target.isContentEditable) return;
            if (this.lightboxOpen) {
                if (e.key === 'Escape') this.closeImageLightbox();
                e.preventDefault();
                return;
            }
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                case 'PageDown':
                    e.preventDefault(); this.next(); break;
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault(); this.prev(); break;
                case 'Home': e.preventDefault(); this.showSlide(0); break;
                case 'r':
                case 'R': e.preventDefault(); this.showSlide(0); break;
                case 'End': e.preventDefault(); this.showSlide(this.slides.length - 1); break;
            }
        });
    }

    setupControlsReveal() {
        if (!this.controlsZone || !this.controlsBar) return;
        const show = () => {
            window.clearTimeout(this.hideControlsTimer);
            this.controlsZone.classList.add('show-controls');
            this.controlsBar.style.opacity = '0.96';
            this.controlsBar.style.transform = 'translateX(-50%) translateY(0)';
            this.controlsBar.style.filter = 'blur(0)';
        };
        const hide = () => {
            window.clearTimeout(this.hideControlsTimer);
            this.hideControlsTimer = window.setTimeout(() => {
                this.controlsZone.classList.remove('show-controls');
                this.controlsBar.style.opacity = '';
                this.controlsBar.style.transform = '';
                this.controlsBar.style.filter = '';
            }, 3000);
        };
        this.controlsZone.addEventListener('mouseenter', show);
        this.controlsZone.addEventListener('mouseleave', hide);
        this.controlsZone.addEventListener('focusin', show);
        this.controlsZone.addEventListener('focusout', hide);
    }

    setupTouchNav() {
        let startX = 0, startY = 0;
        document.addEventListener('touchstart', (e) => {
            if (this.lightboxOpen) return;
            startX = e.changedTouches[0].clientX;
            startY = e.changedTouches[0].clientY;
        }, { passive: true });
        document.addEventListener('touchend', (e) => {
            if (this.lightboxOpen) return;
            const dx = e.changedTouches[0].clientX - startX;
            const dy = e.changedTouches[0].clientY - startY;
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
                dx < 0 ? this.next() : this.prev();
            }
        }, { passive: true });
    }

    setupWheelNav() {
        let lock = false;
        window.addEventListener('wheel', (e) => {
            if (this.lightboxOpen) return;
            if (lock) return;
            if (Math.abs(e.deltaY) < 20) return;
            lock = true;
            e.deltaY > 0 ? this.next() : this.prev();
            setTimeout(() => { lock = false; }, 700);
        }, { passive: true });
    }

    setupImageLightbox() {
        if (!this.lightbox || !this.lightboxImage || !this.stage) return;
        this.stage.addEventListener('click', (event) => {
            const image = event.target.closest('.slide img');
            if (!image) return;
            event.preventDefault();
            this.openImageLightbox(image);
        });
        this.lightbox.addEventListener('click', (event) => {
            if (event.target === this.lightbox) this.closeImageLightbox();
        });
        if (this.lightboxClose) {
            this.lightboxClose.addEventListener('click', () => this.closeImageLightbox());
        }
    }

    setupInlineEditing() {
        const editToggle = document.getElementById('editToggle');
        const hotzone = document.querySelector('.edit-hotzone');
        if (!editToggle || !hotzone) return;
        let editing = false, hideTimer = null;
        const setEditing = (on) => {
            editing = on;
            editToggle.classList.toggle('active', on);
            document.querySelectorAll('.slide h1, .slide h2, .slide h3, .slide p, .slide li, .slide span, .slide small, .slide figcaption')
                .forEach((el) => el.setAttribute('contenteditable', on));
        };
        editToggle.addEventListener('click', () => setEditing(!editing));
        hotzone.addEventListener('click', () => setEditing(!editing));
        hotzone.addEventListener('mouseenter', () => { clearTimeout(hideTimer); editToggle.classList.add('show'); });
        hotzone.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => { if (!editing) editToggle.classList.remove('show'); }, 400); });
        editToggle.addEventListener('mouseenter', () => clearTimeout(hideTimer));
        editToggle.addEventListener('mouseleave', () => { hideTimer = setTimeout(() => { if (!editing) editToggle.classList.remove('show'); }, 400); });
        document.addEventListener('keydown', (e) => {
            if ((e.key === 'e' || e.key === 'E') && !e.target.isContentEditable) setEditing(!editing);
        });
    }

    openImageLightbox(image) {
        const src = image.currentSrc || image.src;
        if (!src) return;
        this.lightboxOpen = true;
        this.lightboxImage.src = src;
        this.lightboxImage.alt = image.alt || '';
        this.lightbox.hidden = false;
        window.requestAnimationFrame(() => this.lightbox.classList.add('is-open'));
    }

    closeImageLightbox() {
        if (!this.lightboxOpen || !this.lightbox) return;
        this.lightboxOpen = false;
        this.lightbox.classList.remove('is-open');
        window.setTimeout(() => {
            if (!this.lightboxOpen) {
                this.lightbox.hidden = true;
                this.lightboxImage.removeAttribute('src');
            }
        }, 220);
    }

    next() { this.showSlide(this.current + 1); }
    prev() { this.showSlide(this.current - 1); }

    showSlide(index) {
        this.current = Math.max(0, Math.min(index, this.slides.length - 1));
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === this.current);
            slide.classList.toggle('visible', i === this.current);
        });
        if (this.currentSlideLabel) this.currentSlideLabel.textContent = String(this.current + 1);
        if (this.prevButton) this.prevButton.disabled = this.current === 0;
        if (this.nextButton) this.nextButton.disabled = this.current === this.slides.length - 1;
    }
}

document.addEventListener('DOMContentLoaded', () => new SlidePresentation());`;
}

function trimText(value, maxLength) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#x60;");
}

function formatSlideText(value) {
  return escapeHtml(value)
    .replace(/\n-\s*/g, "<br>• ")
    .replace(/\n/g, "<br>");
}

function normalizeSlideCopy(value) {
  return String(value ?? "")
    .replace(/^原文术语或示例：\s*/u, "格式示例：")
    .replace(/^Examples:\s*$/u, "工具调用示例需要展示名称、参数对象和调用边界。");
}

function formatUtc8Date(date) {
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 19).replace("T", " ");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
