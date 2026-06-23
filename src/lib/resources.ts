export interface ResourceMeta {
  /** 展示标题；未定义时使用 name */
  title?: string;
  name: string;
  description: string;
  /** 标签可选，meta 中定义时才展示 */
  tags?: string[];
  /** 关联 studies 目录下的 HTML 文件名，不含 .html */
  path?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  sourceType?: string;
}

interface ResourceSlideMeta {
  id: string;
  /** 关联 slides 目录下的 HTML 文件名，不含 .html */
  path: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ResourceFolderMeta {
  /** 资源文件夹/路由基础 id，如 "03" */
  id: string;
  source?: string;
  sourceType?: string;
  studies: ResourceMeta[];
  slides?: ResourceSlideMeta[];
}

type ResourceMetaFile = ResourceFolderMeta;

export interface SlideItem {
  /** 幻灯片标识（取文件名，不含扩展名），用于路由 */
  slug: string;
  /** 展示名称 */
  name: string;
  /** 幻灯片 HTML 的 URL */
  url: string;
}

export interface ResourceItem {
  /** 资源路由 id，如 "01" 或 "01-2" */
  id: string;
  /** 资源文件夹 id，如 "01" */
  folderId: string;
  meta: ResourceMeta;
  /** Studies 精读 HTML 的 URL，可能不存在 */
  studyUrl?: string;
  /** Slides 幻灯片，可能为 0、1 或多个 */
  slides: SlideItem[];
}

const metaModules = import.meta.glob<ResourceMetaFile>("../../resources/*/meta.json", {
  eager: true,
  import: "default",
});

const studyModules = import.meta.glob<string>("../../resources/*/studies/*.html", {
  eager: true,
  query: "?url",
  import: "default",
});

const slideModules = import.meta.glob<string>("../../resources/*/slides/*.html", {
  eager: true,
  query: "?url",
  import: "default",
});

/** 从路径 `../../resources/01/meta.json` 中提取文件夹 id `01` */
function extractId(path: string): string {
  const match = path.match(/resources\/([^/]+)\//);
  return match ? match[1] : path;
}

/** 从路径中提取文件名（不含扩展名），如 `building-effective-agents` */
function extractSlug(path: string): string {
  const file = path.split("/").pop() ?? path;
  return file.replace(/\.html$/i, "");
}

/** 将 slug 转为更易读的展示名：`building-effective-agents` -> `Building Effective Agents` */
function prettify(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function firstUrlForId(modules: Record<string, string>, id: string): string | undefined {
  for (const [path, url] of Object.entries(modules)) {
    if (extractId(path) === id) return url;
  }
  return undefined;
}

function urlForSlug(
  modules: Record<string, string>,
  folderId: string,
  slug: string,
): string | undefined {
  for (const [path, url] of Object.entries(modules)) {
    if (extractId(path) === folderId && extractSlug(path) === slug) return url;
  }
  return undefined;
}

function slidesForId(
  modules: Record<string, string>,
  id: string,
  allowedSlugs?: string[],
): SlideItem[] {
  const allowed = allowedSlugs ? new Set(allowedSlugs) : undefined;

  return Object.entries(modules)
    .filter(([path]) => extractId(path) === id && (!allowed || allowed.has(extractSlug(path))))
    .map(([path, url]) => {
      const slug = extractSlug(path);
      return { slug, name: prettify(slug), url };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

function normalizeFolderMeta(folderId: string, metaFile: ResourceFolderMeta): ResourceItem[] {
  const slideSlugs = metaFile.slides?.map((slide) => slide.path);
  const entries = metaFile.studies;
  const useImplicitStudy = entries.length === 1;

  return entries.map((study, index) => {
    const baseId = metaFile.id || folderId;
    const id = entries.length === 1 || index === 0 ? baseId : `${baseId}-${index + 1}`;
    const meta = {
      ...study,
      source: study.source ?? metaFile.source,
      sourceType: study.sourceType ?? metaFile.sourceType,
    };

    return {
      id,
      folderId,
      meta,
      studyUrl: study.path
        ? urlForSlug(studyModules, folderId, study.path)
        : useImplicitStudy
          ? firstUrlForId(studyModules, folderId)
          : undefined,
      slides: slidesForId(
        slideModules,
        folderId,
        entries.length > 1 && study.path ? [study.path] : slideSlugs,
      ),
    };
  });
}

function normalizeMetaEntries(folderId: string, metaFile: ResourceMetaFile): ResourceItem[] {
  return normalizeFolderMeta(folderId, metaFile);
}

const resources: ResourceItem[] = Object.entries(metaModules)
  .flatMap(([path, metaFile]) => {
    const folderId = extractId(path);
    return normalizeMetaEntries(folderId, metaFile);
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export function getResources(): ResourceItem[] {
  return resources;
}

export function getResourceById(id: string): ResourceItem | undefined {
  return resources.find((item) => item.id === id);
}

/** 在指定资源下按 slug 查找幻灯片，未指定时返回第一个 */
export function getSlide(resource: ResourceItem, slug?: string): SlideItem | undefined {
  if (!slug) return resource.slides[0];
  return resource.slides.find((slide) => slide.slug === slug);
}

/** 按关键字过滤资源（匹配名称、描述、标签，大小写不敏感） */
export function searchResources(keyword: string): ResourceItem[] {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return resources;
  return resources.filter((item) => {
    const haystack = [item.meta.name, item.meta.description, ...(item.meta.tags ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(trimmed);
  });
}
