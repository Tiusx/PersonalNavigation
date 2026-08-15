// ========== 分类标签 ==========
import { state, currentCategory, setCategory } from "../state.js";
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
      <button type="button" class="category-tab ${c.id === active.id ? "active" : ""}" data-cat="${c.id}">
        <span class="tab-icon">${iconHtmlFor(c)}</span>
        <span>${escapeHtml(c.name)}</span>
      </button>`
    )
    .join("");

  $$(".category-tab", el).forEach((btn) => {
    btn.addEventListener("click", () => setCategory(btn.dataset.cat));
  });
}
