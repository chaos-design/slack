import { BookOpen, FolderTree, Presentation, Search } from "lucide-react";

const FLOW_STEPS = [
  {
    code: "01",
    title: "组织",
    text: "在 resources/ 下按主题建立文件夹，用 meta.json 描述名称、简介与标签。",
  },
  {
    code: "02",
    title: "扫描",
    text: "构建时自动扫描各文件夹，生成左侧菜单并加载 Studies 与 Slides。",
  },
  {
    code: "03",
    title: "呈现",
    text: "精读文档以 iframe 原样渲染，幻灯片进入全屏沉浸式演示。",
  },
];

const PRINCIPLES = [
  { icon: FolderTree, title: "动态加载", text: "新增文件夹即出现在菜单，无需改动代码。" },
  { icon: BookOpen, title: "中英精读", text: "Studies 文档保留交互、词汇表与主题切换。" },
  { icon: Presentation, title: "全屏 Slide", text: "演示时自动隐藏菜单与 Header，专注内容。" },
  { icon: Search, title: "快速检索", text: "按名称、简介或标签即时过滤全部资料。" },
];

export function AboutPage() {
  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-5">
        <span className="eyebrow">关于本项目</span>
        <h1 className="font-display text-5xl font-black tracking-tight text-ink sm:text-6xl">
          <span className="ink-underline">Slack</span>
        </h1>
        <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          一个按文件夹组织的学习资料库：每个主题包含一份中英对照精读（Studies）与一套配套幻灯片（Slides），
          通过 meta.json 自动生成菜单并直接渲染 HTML，让精读与演示在同一处呈现。
        </p>
      </header>

      <section className="grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-16">
        <span className="eyebrow self-start">工作方式</span>
        <ol className="flex flex-col">
          {FLOW_STEPS.map((step, i) => (
            <li
              key={step.code}
              className={`flex items-start gap-5 py-5 ${i > 0 ? "border-t border-border" : ""}`}
            >
              <span className="font-display text-2xl font-black text-vermillion">{step.code}</span>
              <div className="flex flex-col gap-1">
                <span className="font-display text-xl font-bold text-ink">{step.title}</span>
                <span className="text-muted-foreground">{step.text}</span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="soft-card flex flex-col gap-3 p-6">
            <Icon className="h-6 w-6 text-vermillion" />
            <span className="font-display text-lg font-bold text-ink">{title}</span>
            <span className="text-sm text-muted-foreground">{text}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
