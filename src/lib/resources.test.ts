import { getResourceById, getResources, getSlide, searchResources } from "./resources";

describe("resources", () => {
  it("loads the Anthropic resource from the folder-level meta schema", () => {
    const resource = getResourceById("01");

    expect(resource?.meta.name).toBe("构建高效 AI Agent");
    expect(resource?.studyUrl).toContain("building-effective-agents.html");
    expect(resource?.slides.map((slide) => slide.slug)).toEqual(["building-effective-agents"]);
  });

  it("resolves the OpenAI agent guide study and slide", () => {
    const resource = getResourceById("02");

    expect(resource?.meta.name).toBe("构建 AI Agent 的实践指南");
    expect(resource?.studyUrl).toContain("openai-agent-guide.html");
    expect(resource?.slides[0]?.slug).toBe("openai-agent-guide");
  });

  it("loads studies and slide objects from the Responses API resource", () => {
    const resource = getResourceById("03");

    expect(resource?.meta.name).toBe("Responses API 的计算机环境");
    expect(resource?.meta.path).toBe("responses-api-computer-environment");
    expect(resource?.meta.source).toBe(
      "https://openai.com/index/equip-responses-api-computer-environment",
    );
    expect(resource?.studyUrl).toContain("responses-api-computer-environment.html");
    expect(resource?.slides.map((slide) => slide.slug)).toEqual([
      "responses-api-computer-environment",
    ]);
  });

  it("loads the Claude Code dynamic workflows resource", () => {
    const resource = getResourceById("04");

    expect(resource?.meta.name).toBe("Claude Code 动态工作流");
    expect(resource?.meta.path).toBe("claude-code-dynamic-workflows");
    expect(resource?.meta.source).toBe(
      "https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code",
    );
    expect(resource?.studyUrl).toContain("claude-code-dynamic-workflows.html");
    expect(resource?.slides.map((slide) => slide.slug)).toEqual(["claude-code-dynamic-workflows"]);
  });

  it("loads the X article resources created by ai-doc-creator", () => {
    const contextEngineering = getResourceById("05");
    const selfRepairingHarness = getResourceById("06");

    expect(contextEngineering?.meta.name).toBe("AI Agent 上下文工程完整指南");
    expect(contextEngineering?.studyUrl).toContain("context-engineering-ai-agents.html");
    expect(contextEngineering?.slides.map((slide) => slide.slug)).toEqual([
      "context-engineering-ai-agents",
    ]);
    expect(selfRepairingHarness?.meta.name).toBe("可自我修复的 Agent Harness");
    expect(selfRepairingHarness?.studyUrl).toContain("self-repairing-agent-harness.html");
    expect(selfRepairingHarness?.slides.map((slide) => slide.slug)).toEqual([
      "self-repairing-agent-harness",
    ]);
  });

  it("loads the MindStudio loop engineering resource", () => {
    const resource = getResourceById("07");

    expect(resource?.meta.name).toBe("Loop Engineering：AI Coding Agents 的新范式");
    expect(resource?.meta.source).toBe(
      "https://www.mindstudio.ai/blog/what-is-loop-engineering-ai-coding-agents",
    );
    expect(resource?.studyUrl).toContain("what-is-loop-engineering-ai-coding-agents.html");
    expect(resource?.slides.map((slide) => slide.slug)).toEqual([
      "what-is-loop-engineering-ai-coding-agents",
    ]);
  });

  it("keeps per-study source metadata for multiple studies in one folder", () => {
    const resource = getResourceById("07-2");

    expect(resource?.meta.name).toBe("Long-running Claude：面向科学计算的长任务 Agent 工作流");
    expect(resource?.meta.source).toBe("https://www.anthropic.com/research/long-running-Claude");
    expect(resource?.studyUrl).toContain("long-running-claude-for-scientific-computing.html");
    expect(resource?.slides.map((slide) => slide.slug)).toEqual([
      "long-running-claude-for-scientific-computing",
    ]);
  });

  it("resolves slides by default and explicit slug", () => {
    const resource = getResourceById("01");

    expect(resource && getSlide(resource)?.slug).toBe("building-effective-agents");
    expect(resource && getSlide(resource, "building-effective-agents")?.name).toBe(
      "Building Effective Agents",
    );
    expect(resource && getSlide(resource, "missing")).toBeUndefined();
  });

  it("searches resources by trimmed keyword, tag, and no-match input", () => {
    expect(searchResources("  openai  ").map((resource) => resource.id)).toEqual(["02", "03"]);
    expect(searchResources("LLM").map((resource) => resource.id)).toEqual(["01"]);
    expect(searchResources("")).toEqual(getResources());
    expect(searchResources("not-a-resource")).toEqual([]);
  });

  it("sorts resources by route id", () => {
    expect(getResources().map((resource) => resource.id)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "07-2",
      "07-3",
    ]);
  });
});
