import { ArrowRight, BookOpen, FolderTree, Layers, Presentation, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { GradientBadge } from "../components/gradient-badge";
import { Button } from "../components/ui/button";
import { getResources, type ResourceItem } from "../lib/resources";

const FEATURES = [
  {
    icon: FolderTree,
    title: "动态加载",
    text: "扫描 resources/ 目录，依据各文件夹的 meta.json 自动生成菜单与内容。",
  },
  {
    icon: BookOpen,
    title: "中英精读",
    text: "Studies 文档以 iframe 原样渲染，保留交互、词汇表与主题切换。",
  },
  {
    icon: Presentation,
    title: "全屏 Slide",
    text: "进入 Slide 自动隐藏菜单与 Header，沉浸式演示无干扰。",
  },
];

function ResourceCard({ item }: { item: ResourceItem }) {
  return (
    <>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-black text-vermillion">{item.id}</span>
        <span className="font-display text-xl font-bold text-ink">{item.meta.name}</span>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{item.meta.description}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {item.meta.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2.5 py-0.5 font-mono-tech text-[10px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </>
  );
}

export function HomePage() {
  const resources = getResources();

  return (
    <div className="flex flex-col gap-20">
      {/* ===== Hero ===== */}
      <header className="flex flex-col gap-7">
        <div className="reveal" style={{ animationDelay: "0ms" }}>
          <GradientBadge>
            <Sparkles className="h-3.5 w-3.5" />
            Studies · Slides · 动态资料库
          </GradientBadge>
        </div>

        <h1
          className="reveal font-display text-5xl font-black leading-[0.95] tracking-tight text-ink sm:text-7xl"
          style={{ animationDelay: "70ms" }}
        >
          <span className="ink-underline">Slack、松弛学习</span>
          <br />
          <span className="italic font-medium text-vermillion">精读 + 演示，一处呈现。</span>
        </h1>

        <p
          className="reveal max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
          style={{ animationDelay: "140ms" }}
        >
          按文件夹组织的学习资料库：每个主题包含一份中英对照精读（Studies）与一套配套幻灯片（Slides），
          通过 meta.json 描述名称、简介与标签，自动生成左侧菜单并直接渲染 HTML。
        </p>

        <div
          className="reveal flex flex-wrap items-center gap-4"
          style={{ animationDelay: "210ms" }}
        >
          <Button
            asChild
            className="btn-ink rounded-sm bg-vermillion px-6 font-mono-tech text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-vermillion"
          >
            <Link to="/learn">
              开始学习
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* ===== 功能介绍 ===== */}
      <section className="reveal flex flex-col gap-8" style={{ animationDelay: "280ms" }}>
        <span className="eyebrow">核心功能</span>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="soft-card flex flex-col gap-3 p-6">
              <Icon className="h-6 w-6 text-vermillion" />
              <span className="font-display text-lg font-bold text-ink">{title}</span>
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 资料列表 ===== */}
      <section className="reveal flex flex-col gap-8" style={{ animationDelay: "350ms" }}>
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-vermillion" />
          <h2 className="font-display text-3xl font-bold text-ink">资料库</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((item) =>
            item.studyUrl ? (
              <Link
                key={item.id}
                to={`/learn/${item.id}`}
                className="index-card flex flex-col gap-3 p-6"
              >
                <ResourceCard item={item} />
              </Link>
            ) : (
              <div
                key={item.id}
                aria-disabled="true"
                className="index-card flex cursor-not-allowed flex-col gap-3 p-6 opacity-75"
              >
                <ResourceCard item={item} />
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
