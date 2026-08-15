// ========== 主题配色应用（支持浅色 / 深色 / 跟随系统） ==========
import { state } from "./state.js";
import { mix, rgba } from "./utils/color.js";

export const DEFAULT_THEME = {
  accent: "#4f46e5",
  text: "#111827",
  textSecondary: "#6b7280",
  surface: "#ffffff",
  surfaceHover: "#f1f5f9",
  border: "#e5e7eb",
  radius: "10px",
};

export const DARK_THEME = {
  text: "#e2e8f0",
  textSecondary: "#94a3b8",
  surface: "#1e293b",
  surfaceHover: "#2d3c55",
  border: "#334155",
};

/** 深色模式的页面底色 */
export const DARK_BACKGROUND = "#0f172a";

/** 当前生效的主题模式："light" | "dark" */
export function currentMode() {
  const mode = state.data?.theme?.mode || "system";
  if (mode === "system") {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode === "dark" ? "dark" : "light";
}

/** 将主题对象写入 CSS 变量（用于预览 / 应用） */
export function applyThemeValues(theme = {}) {
  const t = { ...DEFAULT_THEME, ...theme };
  const root = document.documentElement;
  const accent = t.accent || DEFAULT_THEME.accent;

  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-hover", mix(accent, "#000000", 0.18));
  root.style.setProperty("--accent-soft", rgba(accent, 0.08));
  root.style.setProperty(
    "--accent-grad",
    `linear-gradient(135deg, ${accent}, ${mix(accent, "#ffffff", 0.3)})`
  );
  root.style.setProperty("--text", t.text || DEFAULT_THEME.text);
  root.style.setProperty("--text-secondary", t.textSecondary || DEFAULT_THEME.textSecondary);
  root.style.setProperty("--surface", t.surface || DEFAULT_THEME.surface);
  root.style.setProperty("--surface-hover", t.surfaceHover || DEFAULT_THEME.surfaceHover);
  root.style.setProperty("--border", t.border || DEFAULT_THEME.border);
  if (t.radius) root.style.setProperty("--radius", t.radius);
}

/** 应用当前已保存的主题（根据模式选择浅色 / 深色配色） */
export function applyTheme() {
  const theme = state.data?.theme || {};
  const dark = currentMode() === "dark";
  const accent = theme.accent || DEFAULT_THEME.accent;
  const radius = theme.radius || DEFAULT_THEME.radius;
  const base = dark ? { ...DARK_THEME, accent, radius } : { ...theme, accent, radius };
  applyThemeValues(base);
}
