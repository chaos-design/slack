import { Asterisk } from "lucide-react";
import type { MouseEvent, SVGProps } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/utils";

const NAV_LINKS = [
  { to: "/learn", label: "Learn", index: "01", end: false },
  { to: "/about", label: "About", index: "02", end: false },
];

function getPointerExitSide(event: MouseEvent<HTMLElement>): "left" | "right" {
  const rect = event.currentTarget.getBoundingClientRect();
  return event.clientX < rect.left + rect.width / 2 ? "left" : "right";
}

function handleNavMouseLeave(event: MouseEvent<HTMLAnchorElement>) {
  event.currentTarget.dataset.exit = getPointerExitSide(event);
}

function GithubMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.22-3.37-1.22-.45-1.19-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05A9.4 9.4 0 0 1 12 6.95c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.76 0 3.95-2.34 4.82-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.14 10.14 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function RootLayout() {
  return (
    <div className="paper-backdrop flex min-h-screen flex-col font-body text-foreground">
      <header className="sticky top-0 z-20 border-b-2 border-ink bg-paper/85 backdrop-blur">
        <nav className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="group flex items-baseline gap-2">
            <Asterisk className="h-5 w-5 self-center text-primary transition-transform duration-300 group-hover:rotate-90" />
            <span className="font-display text-2xl font-black tracking-tight text-ink">Slack</span>
            <span className="font-mono-tech text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Agent
            </span>
          </NavLink>

          <div className="flex items-center gap-5">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onMouseLeave={handleNavMouseLeave}
                className={({ isActive }) =>
                  cn(
                    "nav-menu-link group font-mono-tech text-sm transition-colors",
                    isActive
                      ? "nav-menu-link-active text-ink"
                      : "text-muted-foreground hover:text-ink",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 py-20">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t-2 border-ink bg-paper/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-start justify-between gap-2 px-6 py-6 font-mono-tech text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Slack AI Agent — Apache-2.0</span>
          <a
            href="https://github.com/chaos-design/slack"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-ink transition-colors hover:text-vermillion"
          >
            <GithubMark className="h-6 w-6 text-primary" />
            <span className="font-mono-tech text-xs">chaos-design/slack</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
