// ========== 搜索区域 ==========
import { state, currentEngine, setEngine } from "../state.js";
import { $, $$, escapeHtml } from "../utils/dom.js";
import { iconHtmlFor } from "../icons.js";
import { toast } from "./toast.js";

export function renderSearch() {
  const el = $("#search");
  const engine = currentEngine();
  const engines = state.data.searchEngines;
  const avatar = state.data.site.avatar;

  el.innerHTML = `
    ${avatar ? `<div class="hero-avatar" id="heroAvatar"><img src="${escapeHtml(avatar)}" alt="avatar"></div>` : ""}
    <h1 class="search-title">${escapeHtml(state.data.site.name)}</h1>
    <p class="search-subtitle">${escapeHtml(state.data.site.description)}</p>
    <form class="search-box" id="searchForm" autocomplete="off">
      <div class="engine-selector" id="engineSelector">
        <button type="button" class="engine-current" id="engineCurrent" title="切换搜索引擎">
          <span class="engine-icon">${iconHtmlFor(engine)}</span>
          <span class="engine-name">${engine.name}</span>
          <span class="arrow">▾</span>
        </button>
        <div class="engine-dropdown" id="engineDropdown">
          ${engines
            .map(
              (e) => `
              <button type="button" class="engine-option ${e.id === engine.id ? "active" : ""}" data-engine="${e.id}">
                <span class="engine-icon">${iconHtmlFor(e)}</span>
                <span>${escapeHtml(e.name)}</span>
              </button>`
            )
            .join("")}
        </div>
      </div>
      <input type="text" class="search-input" id="searchInput" placeholder="输入关键词，回车搜索… (快捷键 /)" >
      <button type="submit" class="search-btn" id="searchBtn" title="搜索">搜索</button>
    </form>
  `;

  const selector = $("#engineSelector");
  $("#engineCurrent").addEventListener("click", (e) => {
    e.stopPropagation();
    selector.classList.toggle("open");
  });
  $$(".engine-option", el).forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      setEngine(opt.dataset.engine);
      selector.classList.remove("open");
      $("#searchInput").focus();
    });
  });

  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#searchInput").value.trim();
    if (!q) {
      toast("请输入搜索关键词", "warning");
      return;
    }
    window.open(currentEngine().url + encodeURIComponent(q), "_blank", "noopener");
  });
}

/** 引擎切换后仅更新展示，不重渲染整个搜索框 */
export function updateEngineUI() {
  const engine = currentEngine();
  const name = $(".engine-current .engine-name");
  const icon = $(".engine-current .engine-icon");
  if (name) name.textContent = engine.name;
  if (icon) icon.innerHTML = iconHtmlFor(engine);
  $$(".engine-option").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.engine === engine.id);
  });
}
