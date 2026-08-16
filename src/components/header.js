// ========== 顶部工具条（大号时钟 / 设置 / 退出） ==========
import { state, setLoggedIn } from "../state.js";
import { $, escapeHtml } from "../utils/dom.js";
import { openLoginModal } from "./login.js";
import { openSettings } from "./settings.js";
import { toast } from "./toast.js";

export function renderHeader() {
  const el = $("#topbar");
  if (!el) return;
  const site = state.data.site;

  el.innerHTML = `
    <div class="clock" id="clock" title="${escapeHtml(site.name)}">
      <span class="clock-time" id="clockTime">--:--:--</span>
      <span class="clock-date" id="clockDate"></span>
    </div>
    <div class="topbar-actions">
      ${
        state.loggedIn
          ? `<button type="button" class="btn btn-ghost btn-sm" data-action="logout">退出</button>`
          : ""
      }
      <button type="button" class="btn btn-icon" data-action="settings" title="设置">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>
  `;

  el.querySelector('[data-action="settings"]')?.addEventListener("click", () => {
    if (state.loggedIn) openSettings();
    else openLoginModal({ afterLogin: true });
  });
  el.querySelector('[data-action="logout"]')?.addEventListener("click", () => {
    setLoggedIn(false);
    toast("已退出编辑模式");
  });

  updateClock();
}

export function updateClock() {
  const el = $("#clock");
  if (!el) return;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const time = $("#clockTime");
  const date = $("#clockDate");
  if (time) time.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  if (date) date.textContent = `${now.getMonth() + 1}月${now.getDate()}日 周${days[now.getDay()]}`;
}
