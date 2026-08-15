// ========== 站点卡片网格（支持拖拽排序） ==========
import { state, currentCategory, mutate } from "../state.js";
import { $, escapeHtml } from "../utils/dom.js";
import { iconHtmlFor } from "../icons.js";
import { openSiteEditor, deleteSite } from "./siteEditor.js";

let dragIdx = null;

export function renderSites() {
  const grid = $("#sitesGrid");
  const cat = currentCategory();

  if (!cat) {
    grid.innerHTML = `<div class="empty-state">暂无分类，登录后在「设置 → 分类管理」中添加</div>`;
    return;
  }

  const sites = cat.sites || [];
  let html = sites
    .map(
      (s, i) => `
      <a class="site-card" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" data-idx="${i}" draggable="${state.loggedIn}">
        <span class="site-icon">${iconHtmlFor(s)}</span>
        <span class="site-info">
          <span class="site-name">${escapeHtml(s.name)}</span>
          ${s.desc ? `<span class="site-desc">${escapeHtml(s.desc)}</span>` : ""}
        </span>
        ${
          state.loggedIn
            ? `<span class="card-actions">
                <button type="button" class="card-action-btn" data-action="edit" data-idx="${i}" title="编辑">✏️</button>
                <button type="button" class="card-action-btn danger" data-action="delete" data-idx="${i}" title="删除">🗑️</button>
              </span>`
            : ""
        }
      </a>`
    )
    .join("");

  if (state.loggedIn) {
    html += `<button type="button" class="site-card add-card" id="addSiteBtn">
      <span class="plus">+</span><span class="add-text">添加站点</span>
    </button>`;
  }

  grid.innerHTML = html;
  grid.classList.toggle("edit-mode", state.loggedIn);

  // 事件委托（赋值 onclick 覆盖旧监听，避免重复绑定）
  grid.onclick = (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const idx = parseInt(btn.dataset.idx, 10);
    if (btn.dataset.action === "edit") openSiteEditor(idx);
    else if (btn.dataset.action === "delete") deleteSite(idx);
  };

  $("#addSiteBtn")?.addEventListener("click", () => openSiteEditor(-1));

  bindDragSort(grid);
}

/** 拖拽排序：同一分类内调整顺序 */
function bindDragSort(grid) {
  const clearIndicators = () => {
    grid.querySelectorAll(".site-card").forEach((c) => c.classList.remove("dragging", "drag-before", "drag-after"));
  };

  grid.ondragstart = (e) => {
    const card = e.target.closest(".site-card");
    if (!card || card.classList.contains("add-card")) {
      e.preventDefault();
      return;
    }
    dragIdx = parseInt(card.dataset.idx, 10);
    card.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    // Firefox 需要 setData 才会开始拖拽
    e.dataTransfer.setData("text/plain", String(dragIdx));
  };

  grid.ondragover = (e) => {
    const card = e.target.closest(".site-card");
    if (!card || card.classList.contains("add-card") || dragIdx === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = card.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    clearIndicators();
    card.classList.add(after ? "drag-after" : "drag-before");
  };

  grid.ondrop = (e) => {
    e.preventDefault();
    const card = e.target.closest(".site-card");
    clearIndicators();
    if (!card || card.classList.contains("add-card") || dragIdx === null) {
      dragIdx = null;
      return;
    }
    const targetIdx = parseInt(card.dataset.idx, 10);
    const rect = card.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    if (dragIdx === targetIdx || (dragIdx === targetIdx - 1 && after)) {
      dragIdx = null;
      return;
    }
    const cat = currentCategory();
    mutate((data) => {
      const cur = data.categories.find((c) => c.id === cat.id);
      if (!cur) return;
      const sites = cur.sites;
      const [moved] = sites.splice(dragIdx, 1);
      let insert = after ? targetIdx + 1 : targetIdx;
      if (dragIdx < insert) insert -= 1;
      sites.splice(insert, 0, moved);
    });
    dragIdx = null;
  };

  grid.ondragend = () => {
    clearIndicators();
    dragIdx = null;
  };
}
