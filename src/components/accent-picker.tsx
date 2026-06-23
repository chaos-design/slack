import { Check, Palette, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAccent } from "../hooks/use-accent";
import { cn } from "../lib/utils";

/**
 * Floating ink-palette switcher pinned to the bottom-right corner. Lets the
 * user pick a swappable accent colour (persisted via `useAccent`).
 */
export function AccentPicker() {
  const { accent, accents, setAccent } = useAccent();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const closePicker = () => setOpen(false);
    container.addEventListener("mouseleave", closePicker);
    return () => container.removeEventListener("mouseleave", closePicker);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-20 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="reveal soft-card flex w-56 flex-col gap-3 bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="font-chinese text-xs font-bold tracking-[0.28em] text-muted-foreground">
              水墨 · 换色
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="收起调色器"
              className="cursor-pointer text-muted-foreground transition-colors hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <fieldset className="grid grid-cols-5 gap-2" aria-label="强调色">
            {accents.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setAccent(option.id);
                  setOpen(false);
                }}
                title={option.label}
                aria-label={option.label}
                aria-pressed={accent.id === option.id}
                className={cn(
                  "relative grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-ink/30 transition-transform hover:scale-110",
                  accent.id === option.id && "ring-2 ring-ink ring-offset-2 ring-offset-card",
                )}
                style={{ backgroundColor: `hsl(${option.light})` }}
              >
                {accent.id === option.id && <Check className="h-4 w-4 text-white drop-shadow" />}
              </button>
            ))}
          </fieldset>

          <span className="font-chinese text-sm font-black tracking-[0.18em] text-ink">
            {accent.label}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="打开调色器"
        aria-expanded={open}
        className="btn-ink grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-primary text-primary-foreground"
      >
        <Palette className="h-5 w-5" />
      </button>
    </div>
  );
}
