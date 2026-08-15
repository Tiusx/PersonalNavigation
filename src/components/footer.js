// ========== 页脚 ==========
import { state } from "../state.js";
import { $, escapeHtml } from "../utils/dom.js";

export const DEFAULT_FOOTER_TEXT = "Personal Navigation © 2026 · Powered by Vite";

export function renderFooter() {
  const el = $("#footer");
  if (!el) return;
  const f = state.data.site.footer || {};
  if (f.enabled === false) {
    el.style.display = "none";
    return;
  }
  el.style.display = "";
  el.innerHTML = `<p>${escapeHtml(f.text || DEFAULT_FOOTER_TEXT)}</p>`;
}
