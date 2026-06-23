import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import slide01 from "../../resources/01/slides/building-effective-agents.html?raw";
import study01 from "../../resources/01/studies/building-effective-agents.html?raw";
import slide02 from "../../resources/02/slides/openai-agent-guide.html?raw";
import study02 from "../../resources/02/studies/openai-agent-guide.html?raw";
import slide03 from "../../resources/03/slides/responses-api-computer-environment.html?raw";
import study03 from "../../resources/03/studies/responses-api-computer-environment.html?raw";
import slide04 from "../../resources/04/slides/claude-code-dynamic-workflows.html?raw";
import study04 from "../../resources/04/studies/claude-code-dynamic-workflows.html?raw";
import slide05 from "../../resources/05/slides/context-engineering-ai-agents.html?raw";
import study05 from "../../resources/05/studies/context-engineering-ai-agents.html?raw";
import slide06 from "../../resources/06/slides/self-repairing-agent-harness.html?raw";
import study06 from "../../resources/06/studies/self-repairing-agent-harness.html?raw";
import contextEngineeringSlide07 from "../../resources/07/slides/breaking-down-context-engineering.html?raw";
import longRunningClaudeSlide07 from "../../resources/07/slides/long-running-claude-for-scientific-computing.html?raw";
import slide07 from "../../resources/07/slides/what-is-loop-engineering-ai-coding-agents.html?raw";
import contextEngineeringStudy07 from "../../resources/07/studies/breaking-down-context-engineering.html?raw";
import longRunningClaudeStudy07 from "../../resources/07/studies/long-running-claude-for-scientific-computing.html?raw";
import study07 from "../../resources/07/studies/what-is-loop-engineering-ai-coding-agents.html?raw";

type SlideArtifact = {
  id: string;
  resourceId?: string;
  html: string;
  profile: string;
  preset: string;
  title: string;
  contentMarker: string;
  minSlides?: number;
};

const slides: SlideArtifact[] = [
  {
    id: "01",
    html: slide01,
    profile: "paper-ink-complexity-ladder",
    preset: "Paper &amp; Ink",
    title: "从简单模式走向可靠 Agent",
    contentMarker: "Prompt chaining",
  },
  {
    id: "02",
    html: slide02,
    profile: "electric-agent-operating-model",
    preset: "Electric Studio",
    title: "把 Agent 设计成可控工作流",
    contentMarker: "Guardrails",
    minSlides: 18,
  },
  {
    id: "03",
    html: slide03,
    profile: "neon-computer-environment-stack",
    preset: "Neon Cyber",
    title: "给 Agent 一个真正可执行的工作台",
    contentMarker: "Shell Tool",
  },
  {
    id: "04",
    html: slide04,
    profile: "swiss-dynamic-harness",
    preset: "Swiss Modern",
    title: "让 Claude 为任务生成专用 harness",
    contentMarker: "dynamic workflows",
  },
  {
    id: "05",
    html: slide05,
    profile: "notebook-context-engineering",
    preset: "Notebook Tabs",
    title: "把上下文窗口当成工作记忆来设计",
    contentMarker: "Write",
  },
  {
    id: "06",
    html: slide06,
    profile: "copper-repair-flywheel",
    preset: "Dark Botanical",
    title: "把 Trace 之后的修复流程自动化",
    contentMarker: "Ollie",
  },
  {
    id: "07",
    html: slide07,
    profile: "loop-engineering-feedback-system",
    preset: "Creative Voltage",
    title: "把 AI Coding Agent 设计成反馈循环",
    contentMarker: "loop engineering",
  },
  {
    id: "07-context",
    resourceId: "07",
    html: contextEngineeringSlide07,
    profile: "context-signal-routing-system",
    preset: "Graphite Signal",
    title: "把 Agent 上下文设计成可控输入系统",
    contentMarker: "System Prompt",
    minSlides: 17,
  },
  {
    id: "07-long-running",
    resourceId: "07",
    html: longRunningClaudeSlide07,
    profile: "scientific-agent-runtime-lab",
    preset: "HPC Lab Console",
    title: "把 Claude Code 运行成跨天科学计算工作流",
    contentMarker: "CHANGELOG.md",
    minSlides: 14,
  },
];

const studies = [
  study01,
  study02,
  study03,
  study04,
  study05,
  study06,
  study07,
  longRunningClaudeStudy07,
  contextEngineeringStudy07,
];

describe("resource html artifacts", () => {
  it("keeps ai-doc-creator Markdown handoff files named by article slug", () => {
    const expectedMarkdownFiles = [
      "resources/01/building-effective-agents.md",
      "resources/02/openai-agent-guide.md",
      "resources/03/responses-api-computer-environment.md",
      "resources/04/claude-code-dynamic-workflows.md",
      "resources/05/context-engineering-ai-agents.md",
      "resources/06/self-repairing-agent-harness.md",
      "resources/07/what-is-loop-engineering-ai-coding-agents.md",
      "resources/07/long-running-claude-for-scientific-computing.md",
      "resources/07/breaking-down-context-engineering.md",
    ];
    const aiDocCreatorSkill = readFileSync(
      join(process.cwd(), ".skills/ai-doc-creator/SKILL.md"),
      "utf8",
    );

    for (const markdownFile of expectedMarkdownFiles) {
      expect(existsSync(join(process.cwd(), markdownFile))).toBe(true);
    }

    for (const resourceId of ["01", "02", "03", "04", "05", "06", "07"]) {
      expect(existsSync(join(process.cwd(), `resources/${resourceId}/source.md`))).toBe(false);
      expect(existsSync(join(process.cwd(), `resources/${resourceId}/artifacts`))).toBe(true);
    }

    expect(aiDocCreatorSkill).toContain("禁止生成 `source.md`");
    expect(aiDocCreatorSkill).toContain("中间产物必须统一放入");
  });

  it("keeps all regenerated studies wired to glossary hover runtime", () => {
    for (const study of studies) {
      expect(study).toContain("const autowrapRules = ");
      expect(study).toContain("function wrapFirst");
      expect(study).toContain("tip-open");
      expect(study).toContain('class="gloss-item"');
    }
  });

  it("keeps published study pages offline and free of external runtime assets", () => {
    for (const study of studies) {
      expect(study).not.toContain("cdnjs.cloudflare.com");
      expect(study).not.toMatch(/<(script|link)[^>]+https?:\/\//);
      expect(study).not.toMatch(/<img[^>]+src="https?:\/\//);
    }
  });

  it("keeps Claude Code study vocabulary readable after template regeneration", () => {
    expect(study04).toContain("dynamic workflows");
    expect(study04).toContain("goal drift");
    expect(study04).toContain("对抗式验证");
  });

  it("keeps original-view source images after study regeneration", () => {
    expect(study01.match(/class="source-figure/g)?.length).toBeGreaterThanOrEqual(8);
    expect(study02.match(/class="source-figure/g)?.length).toBeGreaterThanOrEqual(4);
    expect(study03.match(/class="source-figure/g)?.length).toBeGreaterThanOrEqual(8);
    expect(study04.match(/class="source-figure/g)?.length).toBeGreaterThanOrEqual(9);
  });

  it("keeps every resource slide on the latest fixed-stage controller contract", () => {
    for (const slide of slides) {
      const minSlides = slide.minSlides ?? (slide.id === "07" ? 17 : 19);
      expect(slide.html.match(/<section class="slide/g)?.length).toBeGreaterThanOrEqual(minSlides);
      expect(slide.html).toContain('class="deck-stage" id="deckStage"');
      expect(slide.html).toContain("class SlidePresentation");
      expect(slide.html).toContain("deck-controls-zone");
      expect(slide.html).toContain("currentSlide");
      expect(slide.html).toContain("totalSlides");
      expect(slide.html).toMatch(/aria-label="Slide controls"|aria-label="幻灯片控制"/);
      expect(slide.html).toContain('class="shortcut-label">重置</span>');
      expect(slide.html).toContain("<kbd>Space</kbd><kbd>↓</kbd><kbd>→</kbd>");
      expect(slide.html).toContain("<kbd>←</kbd><kbd>↑</kbd>");
      expect(slide.html).toContain("setupControlsReveal");
      expect(slide.html).toContain("setupTouchNav");
      expect(slide.html).toContain("setupWheelNav");
      expect(slide.html).toContain("setupImageLightbox");
      expect(slide.html).toContain("setupInlineEditing");
      expect(slide.html).toContain('id="imageLightbox"');
      expect(slide.html).toContain("width: 1920px;");
      expect(slide.html).toContain("height: 1080px;");
      expect(slide.html).not.toContain("window.location.href");
    }

    expect(contextEngineeringSlide07).toContain('<html lang="zh">');
    expect(contextEngineeringSlide07).toContain('aria-label="幻灯片控制"');
    expect(contextEngineeringSlide07).toContain('aria-label="上一页"');
    expect(contextEngineeringSlide07).toContain('aria-label="下一页"');
  });

  it("generates a distinct content brief, style preset, and narrative per resource", () => {
    expect(new Set(slides.map((slide) => slide.profile)).size).toBe(slides.length);
    expect(new Set(slides.map((slide) => slide.preset)).size).toBe(slides.length);

    for (const slide of slides) {
      const resourceId = slide.resourceId ?? slide.id;
      expect(slide.html).toContain(`data-resource-id="${resourceId}"`);
      expect(slide.html).toContain(`data-design-profile="${slide.profile}"`);
      expect(slide.html).toContain(`data-style-preset="${slide.preset}"`);
      expect(slide.html).toContain(slide.title);
      expect(slide.html).toContain(slide.contentMarker);
    }
  });

  it("embeds source visuals as data URLs with source-fidelity review notes", () => {
    for (const slide of slides) {
      if (slide.id === "07") {
        expect(slide.html).not.toContain("来源图像 · 01");
      } else if (slide.id === "07-context" || slide.id === "07-long-running") {
        expect(slide.html).toContain("结构图解");
      } else {
        expect(slide.html.match(/<img src="data:image/g)?.length).toBeGreaterThanOrEqual(4);
      }
      expect(slide.html).not.toMatch(/<img src="https?:\/\//);
    }
  });

  it("uses balanced grids for slides with multiple modules", () => {
    for (const slide of slides) {
      expect(slide.html).toContain("module-grid");
      expect(slide.html).toContain(".module-grid.items-4");
      expect(slide.html).toContain(".module-grid.items-5");
      expect(slide.html).toContain(".module-grid.items-7");
      expect(slide.html).not.toContain("grid-template-columns: repeat(5, minmax(0, 1fr))");
    }

    expect(contextEngineeringSlide07).toContain('data-count="4"');
    expect(contextEngineeringSlide07).toContain('.module-grid[data-count="4"]');
  });

  it("keeps latest content-slides source credit contract for the context deck", () => {
    const expectedSourceCredit =
      '原文：<a href="https://www.newsletter.swirlai.com/p/breaking-down-context-engineering" target="_blank" rel="noopener">《Breaking Down Context Engineering》</a>';

    expect(contextEngineeringSlide07).toContain(expectedSourceCredit);
    expect(contextEngineeringSlide07).not.toContain("Source: <a");
    expect(contextEngineeringSlide07).not.toContain('rel="noopener noreferrer"');
  });

  it("keeps resource 06 aligned with the latest content-slides contract", () => {
    expect(slide06).toContain('<html lang="zh">');
    expect(slide06).toContain('aria-label="幻灯片控制"');
    expect(slide06).toContain("先把修复飞轮拆成可执行判断");
    expect(slide06).toContain("修复飞轮的运行入口");
    expect(slide06).toContain("结构图解");
    expect(slide06).not.toContain("上下文工程首先是一套输入质量判断");
    expect(slide06).not.toContain("上下文类型总览图");
    expect(slide06).not.toContain("Agent 上下文系统");
    expect(slide06).not.toContain("来源图像 ·");
    expect(slide06).not.toContain('rel="noopener noreferrer"');
  });

  it("keeps the context engineering deck free of thin source fragments", () => {
    const forbiddenFragments = [
      "这一节聚焦对应上下文类型的工程挑战。",
      "该段围绕上下文工程展开",
      "格式示例：Examples:",
      "格式示例：Remove item from shopping cart:",
      "祝构建顺利。",
      "作者以希望读者喜欢本文并下周再见结束全文。",
      "精读拆解 · 09",
      "Wrapping up",
    ];

    for (const fragment of forbiddenFragments) {
      expect(contextEngineeringSlide07).not.toContain(fragment);
    }

    expect(contextEngineeringSlide07).toContain("系统提示词是模型输出的“护栏”");
    expect(contextEngineeringSlide07).toContain("结构化输出包括 JSON、HTML 片段或 SQL");
    expect(contextEngineeringSlide07).toContain("工具输出进入上下文前需要后处理");
  });

  it("keeps the self-repairing harness closing slides aligned with the source", () => {
    expect(slide06).toContain(
      "生产环境真正要问的是：当我修改提示词、替换模型或新增工具时，整个 agent graph 会如何响应。",
    );
    expect(slide06).toContain("非开发者也能在不触碰 git 的情况下安全测试配置。");
    expect(slide06).toContain("生产 Agent 的真正工作发生在 trace 之后");
    expect(slide06).toContain("6-algorithm Agent Optimizer 和 50+ 框架集成");
    expect(slide06).not.toContain(
      "Cursor 描述的手工循环，正是 Opik 自行闭合的循环：从一条坏 trace 一直到锁定的回归测试。",
    );
  });

  it("keeps repaired 06 and 07 scientific-computing slides source-specific", () => {
    expect(slide06).toContain("Trace 捕获生产失败，Ollie 读取 trace 并诊断");
    expect(slide06).toContain("每条 trace 还记录当时生效的 agent configuration");
    expect(slide06).toContain("plain-English assertions");
    expect(slide06).toContain("保存新的 Blueprint，将环境指针推进到 staging");

    expect(longRunningClaudeSlide07).toContain("Boltzmann solver 则是 deeply coupled pipeline");
    expect(longRunningClaudeSlide07).toContain("0.1% agreement");
    expect(longRunningClaudeSlide07).toContain("CHANGELOG.md");
    expect(longRunningClaudeSlide07).toContain(
      "Git 提供历史与回滚，tmux 提供会话持久性，SLURM 提供计算资源边界",
    );

    expect(slide07).not.toContain('data-slide-kind="terms"');
    expect(slide07).not.toContain("术语页不单独造概念");
  });

  it("keeps Building Effective Agents workflow examples filled in slides", () => {
    const requiredExamples = [
      "先生成营销文案，再把它翻译成另一种语言。",
      "先撰写文档大纲，检查大纲是否满足特定标准，然后基于该大纲撰写文档。",
      "把不同类型的客服查询",
      "简单/常见问题路由到成本更低的模型",
      "一个模型处理用户查询，另一个模型筛查不当内容或请求",
      "让多个提示审查同一段代码的漏洞",
      "每次都需要对多个文件做复杂修改的编码产品。",
      "需要从多个来源收集并分析信息",
      "文学翻译",
      "SWE-bench 任务",
    ];

    for (const example of requiredExamples) {
      expect(slide01).toContain(example);
    }
  });

  it("avoids deprecated generic slide and visual placeholder wording", () => {
    const bannedPhrases = [
      "Presentation Title",
      "Article Summary",
      "Untitled",
      "Source Visuals",
      "Source Fidelity Review",
      "generated by content-slides",
      "content-slides 的 HTML template",
      "输出路径",
      "生成时间",
      "图片在说什么",
      "对应文章观点",
    ];

    for (const slide of slides) {
      for (const phrase of bannedPhrases) {
        expect(slide.html).not.toContain(phrase);
      }
    }

    const latestBannedImageBridgePhrases = [
      "Slide Plan",
      "high density",
      "reading-first",
      "Edit mode",
      "视觉证据",
      "来源依据摘要",
      "相邻来源依据",
      "来源图像 ·",
      "术语表",
      "术语页不单独造概念",
      "原文术语或示例",
      'data-slide-kind="terms"',
      "<small>原文：",
      "对应来源图",
      "来源图如下",
      "相关配图",
      "配图说明",
      "图片对应内容",
      "这张图做什么",
      "对应什么",
    ];

    const regeneratedSlides = slides.filter((slide) => slide.id !== "05");

    for (const slide of regeneratedSlides) {
      for (const phrase of latestBannedImageBridgePhrases) {
        expect(slide.html).not.toContain(phrase);
      }
    }
  });
});
