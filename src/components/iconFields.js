// ========== 可复用的图标选择字段（SVG 品牌图标库 / 在线 CDN / 图片） ==========
import { $, $$, escapeHtml } from "../utils/dom.js";
import { searchSvgIcons, getSvgIcon, DEFAULT_SVG_ICON } from "../icons.js";
import { ONLINE_BRAND_ICONS, onlineIconUrl } from "../site-meta.js";

/**
 * 在容器中渲染图标选择字段
 * @param {HTMLElement} container
 * @param {{ icon?: string, iconType?: string }} initial
 * @returns {{ getValue: () => ({ icon: string, iconType: string }), setValue: (v: {icon:string, iconType:string}) => void }}
 */
export function renderIconField(container, initial = {}) {
  // 旧数据（emoji / 已移除的 ri- 图标库）统一进入 SVG 图标库，避免空选
  const startIsSvg = initial.iconType === "svg" || initial.iconType === "library";
  let icon = startIsSvg && getSvgIcon(initial.icon) ? initial.icon : "";
  let iconType = ["svg", "image"].includes(initial.iconType) ? initial.iconType : "svg";
  let selectedKey = icon || DEFAULT_SVG_ICON;
  let source = selectedKey.startsWith("svg:") ? "svg" : "st";

  container.innerHTML = `
    <div class="icon-field-head">
      <div class="seg-control" id="iconTypeSeg">
        <button type="button" class="seg-btn ${iconType === "svg" ? "active" : ""}" data-icon-type="svg">图标库</button>
        <button type="button" class="seg-btn ${iconType === "online" ? "active" : ""}" data-icon-type="online">在线</button>
        <button type="button" class="seg-btn ${iconType === "image" ? "active" : ""}" data-icon-type="image">图片</button>
      </div>
      <span class="icon-preview" id="iconPreview"></span>
    </div>

    <div class="icon-field-group" data-group="svg" ${iconType === "svg" ? "" : 'style="display:none;"'}>
      <div class="seg-control" id="iconLibSeg" style="margin-bottom:8px;">
        <button type="button" class="seg-btn ${source === "st" ? "active" : ""}" data-icon-src="st">SuperTinyIcons</button>
        <button type="button" class="seg-btn ${source === "svg" ? "active" : ""}" data-icon-src="svg">thesvg</button>
      </div>
      <input type="text" class="form-input" id="iconSearch" placeholder="搜索图标，如 github、google、bilibili...">
      <div class="icon-picker" id="iconPickerGrid"></div>
    </div>

    <div class="icon-field-group" data-group="online" ${iconType === "online" ? "" : 'style="display:none;"'}>
      <input type="text" class="form-input" id="onlineSearch" placeholder="搜索在线品牌图标，如 淘宝、bilibili、github...">
      <div class="online-picker" id="onlinePickerGrid"></div>
      <p class="form-hint">在线图标来自 simple-icons CDN（仅引用，不下载进项目）。</p>
    </div>

    <div class="icon-field-group" data-group="image" ${iconType === "image" ? "" : 'style="display:none;"'}>
      <input type="text" class="form-input" placeholder="https://... 图标图片地址" value="${escapeHtml(
        iconType === "image" ? initial.icon || "" : ""
      )}">
    </div>
  `;

  const preview = $("#iconPreview", container);
  const updatePreview = () => {
    if (iconType === "svg") {
      const ic = getSvgIcon(selectedKey);
      preview.innerHTML = ic ? ic.svg : `<span style="color:var(--text-muted);font-size:12px;">?</span>`;
    } else {
      const img = $('.icon-field-group[data-group="image"] input', container).value.trim();
      preview.innerHTML = img
        ? `<img src="${escapeHtml(img)}" alt="">`
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
    if (t === "svg") renderGrid();
    if (t === "online") renderOnline();
    updatePreview();
  };

  const grid = $("#iconPickerGrid", container);
  const renderGrid = () => {
    const icons = searchSvgIcons($("#iconSearch", container).value, source);
    grid.innerHTML = icons
      .map(
        ({ key, name, svg }) => `
        <button type="button" class="icon-picker-item ${selectedKey === key ? "active" : ""}" data-icon-key="${key}" title="${escapeHtml(name)}">
          ${svg}
        </button>`
      )
      .join("");
    if (!grid.innerHTML) {
      grid.innerHTML = `<p class="form-hint" style="grid-column:1/-1;text-align:center;padding:12px 0;">未找到相关图标</p>`;
    }
  };

  const onlineGrid = $("#onlinePickerGrid", container);
  const renderOnline = () => {
    const q = $("#onlineSearch", container).value.trim().toLowerCase();
    const items = ONLINE_BRAND_ICONS.filter(
      (i) => !q || i.name.toLowerCase().includes(q) || i.slug.includes(q)
    );
    onlineGrid.innerHTML = items
      .map(
        ({ slug, name }) => `
        <button type="button" class="online-item" data-online-slug="${slug}" title="${escapeHtml(name)} (${slug})">
          <img src="${escapeHtml(onlineIconUrl(slug))}" alt="${escapeHtml(name)}" loading="lazy"
               onerror="this.closest('.online-item').style.display='none'">
        </button>`
      )
      .join("");
    if (!onlineGrid.innerHTML) {
      onlineGrid.innerHTML = `<p class="form-hint" style="grid-column:1/-1;text-align:center;padding:12px 0;">未找到相关图标</p>`;
    }
  };

  $$("#iconTypeSeg .seg-btn", container).forEach((btn) => {
    btn.addEventListener("click", () => switchType(btn.dataset.iconType));
  });

  $$("#iconLibSeg .seg-btn", container).forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#iconLibSeg .seg-btn", container).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      source = btn.dataset.iconSrc;
      renderGrid();
    });
  });
  $("#iconSearch", container).addEventListener("input", renderGrid);

  grid.addEventListener("click", (e) => {
    const item = e.target.closest("[data-icon-key]");
    if (!item) return;
    selectedKey = item.dataset.iconKey;
    source = selectedKey.startsWith("svg:") ? "svg" : "st";
    $$(".icon-picker-item", grid).forEach((el) => el.classList.toggle("active", el === item));
    updatePreview();
  });

  $("#onlineSearch", container).addEventListener("input", renderOnline);

  // 图片输入
  const imageInput = $('.icon-field-group[data-group="image"] input', container);

  onlineGrid.addEventListener("click", (e) => {
    const item = e.target.closest("[data-online-slug]");
    if (!item) return;
    const url = onlineIconUrl(item.dataset.onlineSlug);
    if (!url) return;
    imageInput.value = url;
    iconType = "image";
    switchType("image");
  });

  imageInput.addEventListener("input", () => {
    if (iconType === "image") updatePreview();
  });

  renderGrid();
  renderOnline();
  updatePreview();

  return {
    getValue() {
      if (iconType === "svg") return { icon: selectedKey, iconType: "svg" };
      return { icon: imageInput.value.trim(), iconType: "image" };
    },
    /** 外部（如自动解析）设置图标，支持 SVG 库 key 与图片 URL */
    setValue(v) {
      if (!v) return;
      if (v.iconType === "svg" && getSvgIcon(v.icon)) {
        iconType = "svg";
        selectedKey = v.icon;
        source = v.icon.startsWith("svg:") ? "svg" : "st";
        switchType("svg");
        $("#iconSearch", container).value = "";
        renderGrid();
      } else if (v.iconType === "image" && v.icon) {
        imageInput.value = v.icon;
        switchType("image");
      }
    },
  };
}
