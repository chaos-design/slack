import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("<App /> routing", () => {
  it("renders the home page at /", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /Slack/ })).toBeInTheDocument();
  });

  it("lists the resource library on the home page", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { name: /资料库/ })).toBeInTheDocument();
  });

  it("renders the about page at /about", () => {
    renderAt("/about");
    expect(screen.getByText(/关于本项目/)).toBeInTheDocument();
  });

  it("navigates from home to the learn page via the nav link", () => {
    renderAt("/");
    fireEvent.click(screen.getByRole("link", { name: /learn/i }));
    expect(screen.getByText(/返回首页/)).toBeInTheDocument();
  });

  it("opens and closes learn search with Escape", () => {
    renderAt("/learn/01");

    fireEvent.click(screen.getByRole("button", { name: "搜索学习资料" }));
    expect(screen.getByRole("dialog", { name: "搜索学习资料" })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "搜索学习资料" })).not.toBeInTheDocument();
  });

  it("closes the slide page with Escape", () => {
    renderAt("/slides/01/building-effective-agents");

    expect(screen.getByLabelText("退出全屏")).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.getByText(/返回首页/)).toBeInTheDocument();
  });

  it("closes the slide page with Escape from inside the iframe", () => {
    renderAt("/slides/01/building-effective-agents");

    const iframe = screen.getByTitle("Building Effective Agents") as HTMLIFrameElement;
    fireEvent.load(iframe);
    fireEvent.keyDown(iframe.contentWindow as Window, { key: "Escape" });

    expect(screen.getByText(/返回首页/)).toBeInTheDocument();
  });

  it("keeps the slide page open for non-Escape keys", () => {
    renderAt("/slides/01/building-effective-agents");

    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.getByLabelText("退出全屏")).toBeInTheDocument();
    expect(screen.queryByText(/返回首页/)).not.toBeInTheDocument();
  });

  it("restores learn study and sidebar scroll after returning from slides", async () => {
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });

    renderAt("/learn/05");

    const studyIframe = screen.getByTitle("AI Agent 上下文工程完整指南") as HTMLIFrameElement;
    Object.defineProperty(studyIframe.contentWindow, "scrollY", {
      configurable: true,
      value: 640,
    });

    const sidebarNav = document.querySelector("nav") as HTMLElement;
    sidebarNav.scrollTop = 220;

    fireEvent.click(screen.getByTitle("Context Engineering Ai Agents"));
    expect(screen.getByLabelText("退出全屏")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("退出全屏"));

    const restoredIframe = screen.getByTitle("AI Agent 上下文工程完整指南") as HTMLIFrameElement;
    const scrollTo = vi.fn();
    Object.defineProperty(restoredIframe.contentWindow, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    fireEvent.load(restoredIframe);

    await waitFor(() => {
      expect(scrollTo).toHaveBeenCalledWith({ top: 640, left: 0 });
      expect((document.querySelector("nav") as HTMLElement).scrollTop).toBe(220);
    });

    requestAnimationFrameSpy.mockRestore();
  });

  it("scrolls the active learn menu item into view after refresh", async () => {
    const originalScrollIntoView = HTMLElement.prototype.scrollIntoView;
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        callback(0);
        return 0;
      });

    renderAt("/learn/07-2");

    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({ block: "center" });
    });

    if (originalScrollIntoView) {
      HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    } else {
      // @ts-expect-error jsdom does not define scrollIntoView by default.
      delete HTMLElement.prototype.scrollIntoView;
    }
    requestAnimationFrameSpy.mockRestore();
  });

  it("hides the accent picker on slide routes", () => {
    renderAt("/slides/01/building-effective-agents");

    expect(screen.queryByRole("button", { name: "打开调色器" })).not.toBeInTheDocument();
  });

  it("tracks the header menu exit direction for hover highlight animation", () => {
    renderAt("/");
    const aboutLink = screen.getByRole("link", { name: /about/i });
    aboutLink.getBoundingClientRect = () =>
      ({
        bottom: 20,
        height: 20,
        left: 100,
        right: 180,
        top: 0,
        width: 80,
        x: 100,
        y: 0,
        toJSON: () => undefined,
      }) as DOMRect;

    fireEvent.mouseLeave(aboutLink, { clientX: 190 });
    expect(aboutLink).toHaveAttribute("data-exit", "right");

    fireEvent.mouseLeave(aboutLink, { clientX: 90 });
    expect(aboutLink).toHaveAttribute("data-exit", "left");
  });

  it("renders a 404 page for unknown routes", () => {
    renderAt("/does-not-exist");
    expect(screen.getByRole("heading", { name: /404/i })).toBeInTheDocument();
  });
});
