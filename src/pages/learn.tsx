import { ArrowLeft, PanelLeftOpen, Presentation, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";

import {
  getResourceById,
  getResources,
  type ResourceItem,
  searchResources,
} from "../lib/resources";
import { cn } from "../lib/utils";

interface GroupSlide {
  resourceId: string;
  slug: string;
  name: string;
}

interface ResourceGroup {
  folderId: string;
  resources: ResourceItem[];
  slides: GroupSlide[];
}

const learnSidebarScrollKey = "learn:sidebar-scroll";

function learnStudyScrollKey(resourceId: string): string {
  return `learn:study-scroll:${resourceId}`;
}

function groupResources(resources: ResourceItem[]): ResourceGroup[] {
  const groups = new Map<string, ResourceGroup>();

  for (const resource of resources) {
    const group = groups.get(resource.folderId) ?? {
      folderId: resource.folderId,
      resources: [],
      slides: [],
    };

    group.resources.push(resource);
    for (const slide of resource.slides) {
      if (
        !group.slides.some((item) => item.resourceId === resource.id && item.slug === slide.slug)
      ) {
        group.slides.push({ resourceId: resource.id, slug: slide.slug, name: slide.name });
      }
    }

    groups.set(resource.folderId, group);
  }

  return Array.from(groups.values());
}

function getGroupLabel(group: ResourceGroup): string {
  return group.resources[0]?.id.split("-").shift() ?? group.folderId;
}

function ResourceSummary({
  item,
  index = 0,
  compact = false,
  showIndex = true,
}: {
  item: ResourceItem;
  index: number;
  compact?: boolean;
  showIndex?: boolean;
}) {
  return (
    <>
      <span className="flex items-baseline gap-2">
        {showIndex && (
          <span
            className={cn(
              "shrink-0 font-display font-black text-vermillion",
              compact ? "text-sm" : "text-[11px]",
            )}
          >
            {`${index === undefined ? item.id : index + 1}`.padStart(2, "0")}
          </span>
        )}
        <span className={cn("font-display font-bold text-ink", compact ? "text-base" : "text-sm")}>
          {item.meta.name}
        </span>
      </span>
      <span
        className={cn(
          "mt-1 line-clamp-2 block leading-relaxed text-muted-foreground",
          compact ? "text-sm" : "text-xs",
        )}
      >
        {item.meta.description}
      </span>
      {item.meta.tags && item.meta.tags.length > 0 && (
        <span className={cn("mt-2 flex flex-wrap", compact ? "gap-1.5" : "gap-1")}>
          {item.meta.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "rounded-full border border-border font-mono-tech text-[10px] text-muted-foreground",
                compact ? "px-2.5 py-0.5" : "px-2 py-0.5",
              )}
            >
              {tag}
            </span>
          ))}
        </span>
      )}
    </>
  );
}

export function LearnPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resources = getResources();
  const resourceGroups = useMemo(() => groupResources(resources), [resources]);
  const firstReadableResource = resources.find((item) => item.studyUrl);
  const active = id ? getResourceById(id) : firstReadableResource;

  const [keyword, setKeyword] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const results = useMemo(() => searchResources(keyword), [keyword]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sidebarScrollRef = useRef<HTMLElement>(null);
  const activeResourceRef = useRef<HTMLAnchorElement>(null);
  const studyIframeRef = useRef<HTMLIFrameElement>(null);

  // 无 id 时重定向到第一个资源
  useEffect(() => {
    if (!id && firstReadableResource) {
      navigate(`/learn/${firstReadableResource.id}`, { replace: true });
    }
  }, [id, firstReadableResource, navigate]);

  // 打开全屏搜索时聚焦输入框，并监听 ESC 关闭
  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const savedSidebarScroll = sessionStorage.getItem(learnSidebarScrollKey);
    if (!savedSidebarScroll) return;

    const scrollTop = Number(savedSidebarScroll);
    if (!Number.isFinite(scrollTop)) return;

    requestAnimationFrame(() => {
      if (sidebarScrollRef.current) {
        sidebarScrollRef.current.scrollTop = scrollTop;
      }
      sessionStorage.removeItem(learnSidebarScrollKey);
    });
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen || !active?.id) return;

    requestAnimationFrame(() => {
      activeResourceRef.current?.scrollIntoView?.({ block: "center" });
    });
  }, [active?.id, sidebarOpen]);

  const restoreStudyScroll = useCallback(() => {
    if (!active?.id) return;

    const savedStudyScroll = sessionStorage.getItem(learnStudyScrollKey(active.id));
    if (!savedStudyScroll) return;

    const scrollTop = Number(savedStudyScroll);
    if (!Number.isFinite(scrollTop)) return;

    requestAnimationFrame(() => {
      try {
        studyIframeRef.current?.contentWindow?.scrollTo({ top: scrollTop, left: 0 });
        sessionStorage.removeItem(learnStudyScrollKey(active.id));
      } catch {
        sessionStorage.removeItem(learnStudyScrollKey(active.id));
      }
    });
  }, [active?.id]);

  const saveLearnScrollState = useCallback(() => {
    if (active?.id) {
      try {
        const scrollTop = studyIframeRef.current?.contentWindow?.scrollY ?? 0;
        sessionStorage.setItem(learnStudyScrollKey(active.id), String(scrollTop));
      } catch {
        sessionStorage.removeItem(learnStudyScrollKey(active.id));
      }
    }

    if (sidebarScrollRef.current) {
      sessionStorage.setItem(learnSidebarScrollKey, String(sidebarScrollRef.current.scrollTop));
    }
  }, [active?.id]);

  const closeSearch = () => {
    setSearchOpen(false);
    setKeyword("");
  };

  return (
    <div className="flex min-h-screen bg-paper font-body text-foreground">
      {/* ===== 左侧菜单 ===== */}
      <aside
        className={cn(
          "sticky top-0 flex h-screen shrink-0 flex-col border-r-2 border-ink bg-paper/90 backdrop-blur transition-[width] duration-300 ease-out",
          sidebarOpen ? "w-72" : "w-16",
        )}
        aria-label="学习资料菜单"
      >
        {/* 顶部栏：返回首页 + 搜索按钮（与内容头部同高对齐） */}
        <div
          className={cn(
            "flex h-[65px] shrink-0 items-center border-b-2 border-ink",
            sidebarOpen ? "justify-between px-3" : "justify-center px-2",
          )}
        >
          {sidebarOpen ? (
            <>
              <Link
                to="/"
                className="group inline-flex min-w-0 items-center gap-2 text-muted-foreground hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                <span className="truncate font-mono-tech text-xs uppercase tracking-[0.2em]">
                  返回首页
                </span>
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="搜索学习资料"
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border-2 border-border text-muted-foreground transition-colors hover:border-ink hover:text-ink"
                >
                  <Search className="h-4 w-4" />
                </button>
                {/* <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="收起左侧菜单"
                  aria-expanded={sidebarOpen}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border-2 border-border text-muted-foreground transition-colors hover:border-ink hover:text-ink"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button> */}
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="展开左侧菜单"
              aria-expanded={sidebarOpen}
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-sm border-2 border-border text-muted-foreground transition-colors hover:border-ink hover:text-ink"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        {sidebarOpen && (
          <>
            {/* 「学习资料」标题固定不动 */}
            <div className="shrink-0 px-3 pb-2">
              <span className="eyebrow block w-full">学习资料</span>
            </div>

            {/* 列表独立滚动 */}
            <nav ref={sidebarScrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
              <ul className="flex flex-col gap-2 pt-2">
                {resourceGroups.map((group) => (
                  <li key={group.folderId} className="overflow-visible pb-4">
                    <div
                      className={cn(
                        "relative overflow-visible rounded-sm border-2 bg-card/20 p-1.5 pt-5 transition-colors",
                        active?.folderId === group.folderId ? "border-ink" : "border-border/60",
                      )}
                    >
                      <span className="-translate-y-1/2 pointer-events-none absolute left-2 top-0 z-10 shrink-0 whitespace-nowrap bg-paper px-1 font-display text-base font-black text-vermillion">
                        {getGroupLabel(group)}
                      </span>
                      <div className="flex flex-col gap-3">
                        {group.resources.map((item, index) => {
                          const showResourceIndex = group.resources.length > 1;

                          if (!item.studyUrl) {
                            return (
                              <div
                                key={item.id}
                                aria-disabled="true"
                                className="block cursor-not-allowed rounded-sm border-2 border-border/70 bg-card/50 px-3 py-2.5 opacity-75 shadow-[2px_2px_0_0_hsl(var(--border))]"
                              >
                                <ResourceSummary
                                  item={item}
                                  index={index}
                                  showIndex={showResourceIndex}
                                />
                              </div>
                            );
                          }

                          return (
                            <NavLink
                              key={item.id}
                              ref={active?.id === item.id ? activeResourceRef : undefined}
                              to={`/learn/${item.id}`}
                              aria-label={item.meta.name}
                              className={({ isActive }) =>
                                cn(
                                  "block cursor-pointer rounded-sm border-2 px-3 py-2.5 transition-all",
                                  isActive
                                    ? "border-ink bg-card shadow-[3px_3px_0_0_hsl(var(--ink))]"
                                    : "border-border/70 bg-card/60 shadow-[2px_2px_0_0_hsl(var(--border))] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-ink hover:bg-card hover:shadow-[3px_3px_0_0_hsl(var(--ink))]",
                                )
                              }
                            >
                              <ResourceSummary
                                item={item}
                                index={index}
                                showIndex={showResourceIndex}
                              />
                            </NavLink>
                          );
                        })}
                      </div>
                      {group.slides.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5 border-border px-1.5 py-2">
                          {group.slides.map((slide) => (
                            <button
                              key={`${slide.resourceId}-${slide.slug}`}
                              type="button"
                              title={slide.name}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                saveLearnScrollState();
                                navigate(`/slides/${slide.resourceId}/${slide.slug}`);
                              }}
                              className="btn-ink inline-flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-sm bg-vermillion px-2.5 py-1 font-mono-tech text-[10px] font-semibold uppercase tracking-wide text-primary-foreground"
                            >
                              <Presentation className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">
                                {group.slides.length > 1 ? slide.name : "打开 Slide"}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}
      </aside>

      {/* ===== 内容区 ===== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {active ? (
          active.studyUrl ? (
            <iframe
              ref={studyIframeRef}
              key={active.id}
              title={active.meta.name}
              src={active.studyUrl}
              className="min-h-0 w-full flex-1 border-0"
              onLoad={restoreStudyScroll}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              暂无精读文档
            </div>
          )
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            暂无学习资料
          </div>
        )}
      </div>

      {/* ===== 全局搜索蒙层弹窗 ===== */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          {/* 半透明遮罩，点击关闭 */}
          <button
            type="button"
            aria-label="关闭搜索"
            onClick={closeSearch}
            className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
          />
          <div
            className="relative flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-md border-2 border-ink bg-paper shadow-[6px_6px_0_0_hsl(var(--ink))]"
            role="dialog"
            aria-label="搜索学习资料"
          >
            <div className="flex items-center gap-3 border-b-2 border-ink px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-vermillion" />
              <input
                ref={searchInputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索名称、简介或标签…"
                className="w-full bg-transparent font-display text-lg text-ink outline-none placeholder:text-muted-foreground"
              />
              {keyword && (
                <button
                  type="button"
                  aria-label="清空搜索"
                  onClick={() => {
                    setKeyword("");
                    searchInputRef.current?.focus();
                  }}
                  className="grid h-7 w-7 shrink-0 cursor-pointer place-items-center rounded-full text-muted-foreground transition-colors hover:bg-ink/10 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {results.length > 0 ? (
                <ul className="flex flex-col gap-2">
                  {results.map((item, index) => (
                    <li key={item.id}>
                      {item.studyUrl ? (
                        <Link
                          to={`/learn/${item.id}`}
                          onClick={closeSearch}
                          className="block rounded-sm border-2 border-transparent p-4 transition-colors hover:border-border hover:bg-card/60"
                        >
                          <ResourceSummary item={item} index={index} compact />
                        </Link>
                      ) : (
                        <div
                          aria-disabled="true"
                          className="block cursor-not-allowed rounded-sm border-2 border-transparent p-4 opacity-75"
                        >
                          <ResourceSummary item={item} index={index} compact />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-10 text-center text-muted-foreground">
                  {keyword.trim() ? "未找到匹配的资料" : "输入关键字开始搜索"}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
