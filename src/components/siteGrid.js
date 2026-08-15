// ========== 站点卡片网格 ==========
import { state, currentCategory } from "../state.js";
import { $, escapeHtml } from "../utils/dom.js";
import { iconHtmlFor } from "../icons.js";
import { openSiteEditor, deleteSite } from "./siteEditor.js";

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
      <a class="site-card" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" data-idx="${i}">
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
}
