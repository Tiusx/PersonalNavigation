// ========== 分类标签（支持拖拽排序） ==========
import { state, currentCategory, setCategory, mutate } from "../state.js";
import { $, $$, escapeHtml } from "../utils/dom.js";
import { iconHtmlFor } from "../icons.js";

export function renderCategories() {
  const el = $("#categoryTabs");
  const cats = state.data.categories;
  const active = currentCategory();
  if (!active) {
    el.innerHTML = "";
    return;
  }
  state.categoryId = active.id;

  el.innerHTML = cats
    .map(
      (c) => `
      <button type="button" class="category-tab ${c.id === active.id ? "active" : ""}" data-cat="${c.id}" draggable="${state.loggedIn}">
        <span class="tab-icon">${iconHtmlFor(c)}</span>
        <span>${escapeHtml(c.name)}</span>
      </button>`
    )
    .join("");

  $$(".category-tab", el).forEach((btn) => {
    btn.addEventListener("click", () => setCategory(btn.dataset.cat));
  });

  if (state.loggedIn) bindTabDragSort(el);
}

/** 登录状态下分类 tab 拖拽排序 */
function bindTabDragSort(el) {
  let dragId = null;
  const clear = () =>
    el.querySelectorAll(".category-tab").forEach((t) => t.classList.remove("dragging", "drag-before", "drag-after"));

  el.ondragstart = (e) => {
    const tab = e.target.closest(".category-tab");
    if (!tab) return;
    dragId = tab.dataset.cat;
    tab.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragId);
  };

  el.ondragover = (e) => {
    const tab = e.target.closest(".category-tab");
    if (!tab || !dragId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = tab.getBoundingClientRect();
    const after = e.clientX > rect.left + rect.width / 2;
    clear();
    tab.classList.add(after ? "drag-after" : "drag-before");
  };

  el.ondrop = (e) => {
    e.preventDefault();
    const tab = e.target.closest(".category-tab");
    clear();
    if (!tab || !dragId) {
      dragId = null;
      return;
    }
    const idx = [...el.querySelectorAll(".category-tab")].indexOf(tab);
    const rect = tab.getBoundingClientRect();
    const after = e.clientX > rect.left + rect.width / 2;
    const cur = state.data.categories.findIndex((c) => c.id === dragId);
    if (cur === idx || (cur === idx - 1 && after)) {
      dragId = null;
      return;
    }
    mutate((data) => {
      const [moved] = data.categories.splice(cur, 1);
      let insert = after ? idx + 1 : idx;
      if (cur < insert) insert -= 1;
      data.categories.splice(insert, 0, moved);
    });
    dragId = null;
  };

  el.ondragend = () => {
    clear();
    dragId = null;
  };
}
