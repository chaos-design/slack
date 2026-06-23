import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ACCENTS } from "../hooks/use-accent";
import { AccentPicker } from "./accent-picker";

function getThemeVar(name: string) {
  return document.documentElement.style.getPropertyValue(name);
}

describe("<AccentPicker />", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--vermillion");
    document.documentElement.style.removeProperty("--background");
    document.documentElement.style.removeProperty("--paper");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--vermillion");
    document.documentElement.style.removeProperty("--background");
    document.documentElement.style.removeProperty("--paper");
  });

  it("opens the palette and shows the current accent", () => {
    render(<AccentPicker />);

    fireEvent.click(screen.getByRole("button", { name: "打开调色器" }));

    expect(screen.getByRole("group", { name: "强调色" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "墨青" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("墨青")).toBeInTheDocument();
  });

  it("selects an accent, persists it, and closes the palette", () => {
    render(<AccentPicker />);

    fireEvent.click(screen.getByRole("button", { name: "打开调色器" }));
    fireEvent.click(screen.getByRole("button", { name: "朱砂" }));

    expect(localStorage.getItem("accent")).toBe("zhusha");
    expect(getThemeVar("--vermillion")).toBe(ACCENTS[1].light);
    expect(getThemeVar("--background")).toBe(`hsl(${ACCENTS[1].backgroundLight})`);
    expect(getThemeVar("--paper")).toBe(ACCENTS[1].paperLight);
    expect(screen.queryByRole("group", { name: "强调色" })).not.toBeInTheDocument();
  });

  it("closes with the close button and on mouse leave", () => {
    const { container } = render(<AccentPicker />);

    fireEvent.click(screen.getByRole("button", { name: "打开调色器" }));
    fireEvent.click(screen.getByRole("button", { name: "收起调色器" }));
    expect(screen.queryByRole("group", { name: "强调色" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "打开调色器" }));
    expect(screen.getByRole("group", { name: "强调色" })).toBeInTheDocument();
    fireEvent.mouseLeave(container.firstElementChild as Element);
    expect(screen.queryByRole("group", { name: "强调色" })).not.toBeInTheDocument();
  });
});
