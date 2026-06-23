import { useCallback, useEffect, useState } from "react";

/** A swappable accent colour expressed as raw HSL channels (used in `hsl(...)`). */
export interface AccentOption {
  id: string;
  /** Chinese name shown in the UI. */
  label: string;
  /** HSL channels for light theme, e.g. "200 28% 30%". */
  light: string;
  /** HSL channels for dark theme. */
  dark: string;
  /** HSL channels for the page background colour in light theme. */
  backgroundLight: string;
  /** HSL channels for the page background colour in dark theme. */
  backgroundDark: string;
  /** HSL channels for the rice-paper surface in light theme. */
  paperLight: string;
  /** HSL channels for the rice-paper surface in dark theme. */
  paperDark: string;
}

/** 水墨调色：墨青 / 朱砂 / 石青 / 赭石 / 黛紫 / 松绿 / 藤黄 / 胭脂 / 群青 / 茶褐 / 靛蓝 / 苍蓝 / 竹青 / 缃黄 / 杏红 / 海棠 / 绛紫 / 月白。 */
export const ACCENTS: AccentOption[] = [
  {
    id: "moqing",
    label: "墨青",
    light: "200 28% 30%",
    dark: "200 45% 58%",
    backgroundLight: "40 18% 90%",
    backgroundDark: "220 16% 8%",
    paperLight: "40 18% 90%",
    paperDark: "220 16% 8%",
  },
  {
    id: "zhusha",
    label: "朱砂",
    light: "2 68% 47%",
    dark: "4 72% 56%",
    backgroundLight: "18 26% 91%",
    backgroundDark: "356 18% 9%",
    paperLight: "18 30% 93%",
    paperDark: "356 16% 9%",
  },
  {
    id: "shiqing",
    label: "石青",
    light: "205 55% 36%",
    dark: "205 60% 56%",
    backgroundLight: "205 24% 91%",
    backgroundDark: "208 20% 9%",
    paperLight: "205 28% 93%",
    paperDark: "208 18% 9%",
  },
  {
    id: "zheshi",
    label: "赭石",
    light: "20 58% 42%",
    dark: "22 62% 56%",
    backgroundLight: "28 26% 90%",
    backgroundDark: "24 18% 9%",
    paperLight: "30 30% 92%",
    paperDark: "24 16% 9%",
  },
  {
    id: "daizi",
    label: "黛紫",
    light: "268 28% 40%",
    dark: "268 42% 64%",
    backgroundLight: "268 18% 91%",
    backgroundDark: "268 18% 9%",
    paperLight: "268 22% 93%",
    paperDark: "268 16% 9%",
  },
  {
    id: "songlv",
    label: "松绿",
    light: "158 42% 32%",
    dark: "158 46% 50%",
    backgroundLight: "158 20% 90%",
    backgroundDark: "164 18% 8%",
    paperLight: "158 24% 92%",
    paperDark: "164 16% 9%",
  },
  {
    id: "tenghuang",
    label: "藤黄",
    light: "42 78% 42%",
    dark: "44 80% 56%",
    backgroundLight: "44 30% 89%",
    backgroundDark: "42 18% 9%",
    paperLight: "44 34% 91%",
    paperDark: "42 16% 9%",
  },
  {
    id: "yanzhi",
    label: "胭脂",
    light: "342 52% 44%",
    dark: "342 58% 60%",
    backgroundLight: "342 22% 91%",
    backgroundDark: "342 18% 9%",
    paperLight: "342 26% 93%",
    paperDark: "342 16% 9%",
  },
  {
    id: "qunqing",
    label: "群青",
    light: "224 56% 44%",
    dark: "224 62% 64%",
    backgroundLight: "224 22% 91%",
    backgroundDark: "224 20% 9%",
    paperLight: "224 26% 93%",
    paperDark: "224 18% 9%",
  },
  {
    id: "chahe",
    label: "茶褐",
    light: "28 36% 34%",
    dark: "28 40% 52%",
    backgroundLight: "32 20% 90%",
    backgroundDark: "30 14% 9%",
    paperLight: "34 24% 92%",
    paperDark: "30 12% 9%",
  },
  {
    id: "dianlan",
    label: "靛蓝",
    light: "218 64% 38%",
    dark: "218 68% 62%",
    backgroundLight: "218 24% 91%",
    backgroundDark: "218 20% 9%",
    paperLight: "218 28% 93%",
    paperDark: "218 18% 9%",
  },
  {
    id: "canglan",
    label: "苍蓝",
    light: "190 46% 38%",
    dark: "190 56% 60%",
    backgroundLight: "190 22% 91%",
    backgroundDark: "192 18% 9%",
    paperLight: "190 26% 93%",
    paperDark: "192 16% 9%",
  },
  {
    id: "zhuqing",
    label: "竹青",
    light: "146 36% 35%",
    dark: "146 44% 54%",
    backgroundLight: "146 20% 90%",
    backgroundDark: "148 18% 8%",
    paperLight: "146 24% 92%",
    paperDark: "148 16% 9%",
  },
  {
    id: "xianghuang",
    label: "缃黄",
    light: "50 58% 42%",
    dark: "50 72% 58%",
    backgroundLight: "50 32% 89%",
    backgroundDark: "48 18% 9%",
    paperLight: "50 36% 91%",
    paperDark: "48 16% 9%",
  },
  {
    id: "xinghong",
    label: "杏红",
    light: "12 62% 50%",
    dark: "14 70% 60%",
    backgroundLight: "14 28% 91%",
    backgroundDark: "12 18% 9%",
    paperLight: "14 32% 93%",
    paperDark: "12 16% 9%",
  },
  {
    id: "haitang",
    label: "海棠",
    light: "350 58% 46%",
    dark: "350 66% 62%",
    backgroundLight: "350 24% 91%",
    backgroundDark: "350 18% 9%",
    paperLight: "350 28% 93%",
    paperDark: "350 16% 9%",
  },
  {
    id: "jiangzi",
    label: "绛紫",
    light: "288 36% 36%",
    dark: "288 48% 62%",
    backgroundLight: "288 18% 91%",
    backgroundDark: "288 18% 9%",
    paperLight: "288 22% 93%",
    paperDark: "288 16% 9%",
  },
  {
    id: "yuebai",
    label: "月白",
    light: "198 24% 42%",
    dark: "198 32% 68%",
    backgroundLight: "198 26% 93%",
    backgroundDark: "204 16% 9%",
    paperLight: "198 32% 95%",
    paperDark: "204 14% 10%",
  },
];

const STORAGE_KEY = "accent";
const DEFAULT_ACCENT = ACCENTS[0];

function isDarkTheme(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

/** Apply the accent's HSL channels to theme custom properties on <html>. */
export function applyAccent(accent: AccentOption): void {
  if (typeof document === "undefined") return;
  const isDark = isDarkTheme();
  document.documentElement.style.setProperty("--vermillion", isDark ? accent.dark : accent.light);
  document.documentElement.style.setProperty(
    "--background",
    `hsl(${isDark ? accent.backgroundDark : accent.backgroundLight})`,
  );
  document.documentElement.style.setProperty(
    "--paper",
    isDark ? accent.paperDark : accent.paperLight,
  );
}

function readStoredAccent(): AccentOption {
  if (typeof localStorage === "undefined") return DEFAULT_ACCENT;
  const stored = localStorage.getItem(STORAGE_KEY);
  return ACCENTS.find((a) => a.id === stored) ?? DEFAULT_ACCENT;
}

export interface UseAccentResult {
  accent: AccentOption;
  accents: AccentOption[];
  setAccent: (id: string) => void;
}

/**
 * Manages the swappable accent colour, persisting the choice to localStorage
 * and reflecting it on the document via the theme CSS variables.
 */
export function useAccent(): UseAccentResult {
  const [accent, setAccentState] = useState<AccentOption>(readStoredAccent);

  useEffect(() => {
    applyAccent(accent);
  }, [accent]);

  const setAccent = useCallback((id: string) => {
    const next = ACCENTS.find((a) => a.id === id);
    if (!next) return;
    setAccentState(next);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next.id);
    }
  }, []);

  return { accent, accents: ACCENTS, setAccent };
}
