import { X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getResourceById, getSlide } from "../lib/resources";

export function SlidesPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const resource = id ? getResourceById(id) : undefined;
  const slide = resource ? getSlide(resource, slug) : undefined;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeWindowRef = useRef<Window | null>(null);
  const resourceId = resource?.id;

  const closeSlide = useCallback(() => {
    if (resourceId) {
      navigate(`/learn/${resourceId}`);
    }
  }, [navigate, resourceId]);

  const closeOnEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSlide();
      }
    },
    [closeSlide],
  );

  useEffect(() => {
    if (!resourceId) return;

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      try {
        iframeWindowRef.current?.removeEventListener("keydown", closeOnEscape);
      } catch {
        iframeWindowRef.current = null;
      }
    };
  }, [closeOnEscape, resourceId]);

  const handleSlideLoad = useCallback(() => {
    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow) return;

    try {
      iframeWindowRef.current?.removeEventListener("keydown", closeOnEscape);
      iframeWindow.addEventListener("keydown", closeOnEscape);
      iframeWindowRef.current = iframeWindow;
    } catch {
      iframeWindowRef.current = null;
    }
  }, [closeOnEscape]);

  if (!resource || !slide) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink text-paper">
        <p className="font-display text-2xl font-bold">未找到对应的 Slide</p>
        <Link
          to="/learn"
          className="rounded-sm border border-paper px-4 py-2 font-mono-tech text-xs uppercase tracking-wide hover:bg-paper hover:text-ink"
        >
          返回学习
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <Link
        to={`/learn/${resource.id}`}
        aria-label="退出全屏"
        className="fixed right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-ink/80 text-paper backdrop-blur transition-transform hover:scale-110"
      >
        <X className="h-5 w-5" />
      </Link>
      <iframe
        ref={iframeRef}
        title={slide.name}
        src={slide.url}
        className="h-full w-full border-0"
        onLoad={handleSlideLoad}
      />
    </div>
  );
}
