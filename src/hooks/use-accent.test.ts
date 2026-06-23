import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ACCENTS, applyAccent, useAccent } from "./use-accent";

function getThemeVar(name: string) {
  return document.documentElement.style.getPropertyValue(name);
}

function getAccentVar() {
  return document.documentElement.style.getPropertyValue("--vermillion");
}

describe("useAccent", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--vermillion");
    document.documentElement.style.removeProperty("--background");
    document.documentElement.style.removeProperty("--paper");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.style.removeProperty("--vermillion");
    document.documentElement.style.removeProperty("--background");
    document.documentElement.style.removeProperty("--paper");
  });

  it("defaults to the first accent (墨青)", () => {
    const { result } = renderHook(() => useAccent());
    expect(result.current.accent.id).toBe(ACCENTS[0].id);
    expect(result.current.accents).toHaveLength(18);
    expect(result.current.accents.map((accent) => accent.label)).toEqual(
      expect.arrayContaining(["靛蓝", "苍蓝", "竹青", "缃黄", "杏红", "海棠", "绛紫", "月白"]),
    );
  });

  it("applies the light HSL channels to --vermillion on mount", () => {
    renderHook(() => useAccent());
    expect(getAccentVar()).toBe(ACCENTS[0].light);
  });

  it("applies the light page background tokens on mount", () => {
    renderHook(() => useAccent());
    expect(getThemeVar("--background")).toBe(`hsl(${ACCENTS[0].backgroundLight})`);
    expect(getThemeVar("--paper")).toBe(ACCENTS[0].paperLight);
  });

  it("changes the accent and persists it to localStorage", () => {
    const { result } = renderHook(() => useAccent());

    act(() => result.current.setAccent("zhusha"));

    expect(result.current.accent.id).toBe("zhusha");
    expect(getAccentVar()).toBe(ACCENTS[1].light);
    expect(getThemeVar("--background")).toBe(`hsl(${ACCENTS[1].backgroundLight})`);
    expect(getThemeVar("--paper")).toBe(ACCENTS[1].paperLight);
    expect(localStorage.getItem("accent")).toBe("zhusha");
  });

  it("ignores an unknown accent id", () => {
    const { result } = renderHook(() => useAccent());

    act(() => result.current.setAccent("does-not-exist"));

    expect(result.current.accent.id).toBe(ACCENTS[0].id);
    expect(getAccentVar()).toBe(ACCENTS[0].light);
    expect(getThemeVar("--background")).toBe(`hsl(${ACCENTS[0].backgroundLight})`);
    expect(getThemeVar("--paper")).toBe(ACCENTS[0].paperLight);
  });

  it("restores the stored accent on the next mount", () => {
    localStorage.setItem("accent", "shiqing");
    const { result } = renderHook(() => useAccent());
    expect(result.current.accent.id).toBe("shiqing");
    expect(getThemeVar("--background")).toBe(`hsl(${ACCENTS[2].backgroundLight})`);
  });

  it("applies dark channels and page background tokens when the dark theme is active", () => {
    document.documentElement.classList.add("dark");
    applyAccent(ACCENTS[1]);
    expect(getAccentVar()).toBe(ACCENTS[1].dark);
    expect(getThemeVar("--background")).toBe(`hsl(${ACCENTS[1].backgroundDark})`);
    expect(getThemeVar("--paper")).toBe(ACCENTS[1].paperDark);
  });

  it("skips document writes when document is unavailable", () => {
    vi.stubGlobal("document", undefined);

    expect(() => applyAccent(ACCENTS[1])).not.toThrow();
  });

  it("uses the default accent and skips persistence when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", undefined);
    const { result } = renderHook(() => useAccent());

    act(() => result.current.setAccent("zhusha"));

    expect(result.current.accent.id).toBe("zhusha");
    expect(getAccentVar()).toBe(ACCENTS[1].light);
  });
});
