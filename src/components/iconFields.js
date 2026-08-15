// ========== 可复用的图标选择字段（Emoji / 图标库 / 图片） ==========
import { $, $$, escapeHtml } from "../utils/dom.js";
import { searchIcons, DEFAULT_LIBRARY_ICON } from "../icons.js";

/** 解析 "ri-home-4-line" 为 { style, name } */
function parseLibraryIcon(className = "") {
  const name = className.trim().replace(/^ri-/, "");
  return { style: name.endsWith("-fill") ? "fill" : "line", name };
}

/**
 * 在容器中渲染图标选择字段
 * @param {HTMLElement} container
 * @param {{ icon?: string, iconType?: string }} initial
 * @returns {{ getValue: () => ({ icon: string, iconType: string }) }}
 */
export function renderIconField(container, initial = {}) {
  let icon = initial.icon || "";
  let iconType = ["emoji", "library", "image"].includes(initial.iconType)
    ? initial.iconType
    : "emoji";
  const parsed = iconType === "library" ? parseLibraryIcon(icon) : null;
  let iconStyle = parsed?.style || "line";
  let selectedLibrary = parsed?.className || DEFAULT_LIBRARY_ICON;

  container.innerHTML = `
    <div class="icon-field-head">
      <div class="seg-control" id="iconTypeSeg">
        <button type="button" class="seg-btn ${iconType === "emoji" ? "active" : ""}" data-icon-type="emoji">Emoji</button>
        <button type="button" class="seg-btn ${iconType === "library" ? "active" : ""}" data-icon-type="library">图标库</button>
        <button type="button" class="seg-btn ${iconType === "image" ? "active" : ""}" data-icon-type="image">图片</button>
      </div>
      <span class="icon-preview" id="iconPreview"></span>
    </div>

    <div class="icon-field-group" data-group="emoji" ${iconType === "emoji" ? "" : 'style="display:none;"'}>
      <input type="text" class="form-input" placeholder="输入 emoji，如 🔍" value="${escapeHtml(
        iconType === "emoji" ? icon : ""
      )}">
    </div>

    <div class="icon-field-group" data-group="library" ${iconType === "library" ? "" : 'style="display:none;"'}>
      <div class="seg-control" id="libraryTypeSeg" style="margin-bottom:8px;">
        <button type="button" class="seg-btn ${iconStyle === "line" ? "active" : ""}" data-icon-style="line">线性</button>
        <button type="button" class="seg-btn ${iconStyle === "fill" ? "active" : ""}" data-icon-style="fill">实心</button>
      </div>
      <input type="text" class="form-input" id="iconSearch" placeholder="搜索图标，如 home、github、star...">
      <div class="icon-picker" id="iconPickerGrid"></div>
    </div>

    <div class="icon-field-group" data-group="image" ${iconType === "image" ? "" : 'style="display:none;"'}>
      <input type="text" class="form-input" placeholder="https://... 图标图片地址" value="${escapeHtml(
        iconType === "image" ? icon : ""
      )}">
    </div>
  `;

  const preview = $("#iconPreview", container);
  const updatePreview = () => {
    if (iconType === "emoji") {
      preview.innerHTML = escapeHtml(icon || "🌐");
    } else if (iconType === "library") {
      preview.innerHTML = `<i class="${selectedLibrary || DEFAULT_LIBRARY_ICON}"></i>`;
    } else {
      preview.innerHTML = icon
        ? `<img src="${escapeHtml(icon)}" alt="">`
        : `<span style="color:var(--text-muted);font-size:12px;">?</span>`;
    }
  };

  const switchType = (t) => {
    iconType = t;
    $$("#iconTypeSeg .seg-btn", container).forEach((b) =>
      b.classList.toggle("active", b.dataset.iconType === t)
    );
    $$(".icon-field-group", container).forEach((g) => {
      g.style.display = g.dataset.group === t ? "block" : "none";
    });
    if (t === "library") renderGrid();
    updatePreview();
  };

  const grid = $("#iconPickerGrid", container);
  const renderGrid = () => {
    const icons = searchIcons($("#iconSearch", container).value, iconStyle);
    grid.innerHTML = icons
      .map(
        ({ name, className }) => `
        <button type="button" class="icon-picker-item ${selectedLibrary === className ? "active" : ""}" data-icon-class="${className}" title="${name}">
          <i class="${className}"></i>
        </button>`
      )
      .join("");
    if (!grid.innerHTML) {
      grid.innerHTML = `<p class="form-hint" style="grid-column:1/-1;text-align:center;padding:12px 0;">未找到相关图标</p>`;
    }
  };

  $$("#iconTypeSeg .seg-btn", container).forEach((btn) => {
    btn.addEventListener("click", () => switchType(btn.dataset.iconType));
  });

  $$("#libraryTypeSeg .seg-btn", container).forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#libraryTypeSeg .seg-btn", container).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      iconStyle = btn.dataset.iconStyle;
      renderGrid();
    });
  });
  $("#iconSearch", container).addEventListener("input", renderGrid);

  grid.addEventListener("click", (e) => {
    const item = e.target.closest("[data-icon-class]");
    if (!item) return;
    selectedLibrary = item.dataset.iconClass;
    $$(".icon-picker-item", grid).forEach((el) => el.classList.toggle("active", el === item));
    updatePreview();
  });

  // emoji 输入
  const emojiInput = $('.icon-field-group[data-group="emoji"] input', container);
  emojiInput.addEventListener("input", (e) => {
    icon = e.target.value.trim();
    if (iconType === "emoji") updatePreview();
  });
  // 图片输入
  const imageInput = $('.icon-field-group[data-group="image"] input', container);
  imageInput.addEventListener("input", (e) => {
    icon = e.target.value.trim();
    if (iconType === "image") updatePreview();
  });

  renderGrid();
  updatePreview();

  return {
    getValue() {
      if (iconType === "library") return { icon: selectedLibrary, iconType };
      return { icon, iconType };
    },
  };
}
