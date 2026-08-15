// ========== 站点设置（基础信息 / 背景 / 主题 / SEO / 分类 / 搜索引擎 / 数据） ==========
import { state, mutate, resetData, replaceData, setEngine } from "../state.js";
import { $, $$, escapeHtml, uid } from "../utils/dom.js";
import { openModal, closeModal } from "./modal.js";
import { renderIconField } from "./iconFields.js";
import { iconHtmlFor } from "../icons.js";
import { applyThemeValues, DARK_THEME } from "../theme.js";
import { toast } from "./toast.js";
import { getCloudConfig, saveCloudConfig, testToken, syncToCloud, syncFromCloud } from "../cloud.js";

export function openSettings() {
  const site = state.data.site;
  const bg = state.data.background;
  const seo = state.data.seo || {};
  const theme = state.data.theme || {};
  const footer = site.footer || {};
  const cloudCfg = getCloudConfig();

  openModal({
    title: "站点设置",
    size: "modal-lg",
    confirmText: "保存设置",
    body: `
      <div class="settings-tabs">
        <button type="button" class="settings-tab active" data-panel="basic">基础信息</button>
        <button type="button" class="settings-tab" data-panel="theme">主题</button>
        <button type="button" class="settings-tab" data-panel="background">背景</button>
        <button type="button" class="settings-tab" data-panel="seo">SEO 优化</button>
        <button type="button" class="settings-tab" data-panel="category">分类管理</button>
        <button type="button" class="settings-tab" data-panel="engine">搜索引擎</button>
        <button type="button" class="settings-tab" data-panel="data">数据</button>
      </div>

      <div class="settings-panel active" id="panel-basic">
        <div class="form-group">
          <label class="form-label">站点名称</label>
          <input type="text" class="form-input" id="setSiteName" value="${escapeHtml(site.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">Logo 图片 URL（留空显示首字标记）</label>
          <input type="text" class="form-input" id="setLogo" value="${escapeHtml(site.logo || "")}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label">主页头像图片 URL（快捷导航上方显示）</label>
          <input type="text" class="form-input" id="setAvatar" value="${escapeHtml(site.avatar || "")}" placeholder="https://... 留空不显示头像">
        </div>
        <div class="form-group">
          <label class="form-label">副标题 / 描述</label>
          <input type="text" class="form-input" id="setDesc" value="${escapeHtml(site.description || "")}">
        </div>
        <div class="form-group">
          <label class="form-label">网页标签标题（浏览器标签页，留空则使用站点名称）</label>
          <input type="text" class="form-input" id="setTabTitle" value="${escapeHtml(site.tabTitle || "")}" placeholder="留空则使用站点名称">
        </div>
        <div class="form-group">
          <label class="form-label">Favicon 图标 URL（浏览器标签页图标）</label>
          <input type="text" class="form-input" id="setFavicon" value="${escapeHtml(site.favicon || "")}" placeholder="https://... 留空使用默认图标">
          <p class="form-hint">保存后网页标题、favicon、SEO 分享信息将同步更新。</p>
        </div>
        <div class="form-group">
          <label class="form-label">页脚</label>
          <label class="checkbox-label">
            <input type="checkbox" id="setFooterEnabled" ${footer.enabled !== false ? "checked" : ""}>
            显示页脚
          </label>
          <input type="text" class="form-input" id="setFooterText" value="${escapeHtml(footer.text || "")}" placeholder="Personal Navigation © 2026 · Powered by Vite" style="margin-top:8px;">
        </div>
      </div>

      <div class="settings-panel" id="panel-theme">
        <div class="form-group">
          <label class="form-label">主题模式</label>
          <select class="form-select" id="setThemeMode">
            <option value="system" ${theme.mode !== "light" && theme.mode !== "dark" ? "selected" : ""}>跟随系统</option>
            <option value="light" ${theme.mode === "light" ? "selected" : ""}>浅色</option>
            <option value="dark" ${theme.mode === "dark" ? "selected" : ""}>深色</option>
          </select>
          <p class="form-hint">跟随系统：自动根据操作系统深浅色设置切换。深色模式使用内置深色配色，主色与圆角与浅色共用。</p>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">主色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeAccent" value="${theme.accent || "#4f46e5"}">
              <input type="text" class="form-input" id="setThemeAccentText" value="${theme.accent || "#4f46e5"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">背景色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeBg" value="${bg.color || "#f6f8fb"}">
              <input type="text" class="form-input" id="setThemeBgText" value="${bg.color || "#f6f8fb"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">卡片 / 输入框底色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeSurface" value="${theme.surface || "#ffffff"}">
              <input type="text" class="form-input" id="setThemeSurfaceText" value="${theme.surface || "#ffffff"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">悬停底色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeSurfaceHover" value="${theme.surfaceHover || "#f1f5f9"}">
              <input type="text" class="form-input" id="setThemeSurfaceHoverText" value="${theme.surfaceHover || "#f1f5f9"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">边框色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeBorder" value="${theme.border || "#e5e7eb"}">
              <input type="text" class="form-input" id="setThemeBorderText" value="${theme.border || "#e5e7eb"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">主文字色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeText" value="${theme.text || "#111827"}">
              <input type="text" class="form-input" id="setThemeTextText" value="${theme.text || "#111827"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">次要文字色</label>
            <div class="color-picker-row">
              <input type="color" id="setThemeTextSecondary" value="${theme.textSecondary || "#6b7280"}">
              <input type="text" class="form-input" id="setThemeTextSecondaryText" value="${theme.textSecondary || "#6b7280"}">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">圆角大小</label>
            <select class="form-select" id="setThemeRadius">
              ${[8, 10, 12, 14, 16]
                .map((r) => `<option value="${r}px" ${(theme.radius || "10px") === `${r}px` ? "selected" : ""}>${r}px</option>`)
                .join("")}
            </select>
          </div>
        </div>
        <p class="form-hint">配色修改后实时预览，点击「保存设置」生效。</p>
      </div>

      <div class="settings-panel" id="panel-background">
        <div class="form-group">
          <label class="form-label">背景类型</label>
          <select class="form-select" id="setBgType">
            <option value="color" ${bg.type === "color" ? "selected" : ""}>纯色背景</option>
            <option value="image" ${bg.type === "image" ? "selected" : ""}>图片背景</option>
          </select>
        </div>
        <div class="form-group" id="bgColorGroup">
          <label class="form-label">背景颜色</label>
          <div class="color-picker-row">
            <input type="color" id="setBgColor" value="${bg.color || "#f6f8fb"}">
            <input type="text" class="form-input" id="setBgColorText" value="${bg.color || "#f6f8fb"}">
          </div>
        </div>
        <div class="form-group" id="bgImageGroup" style="display:none;">
          <label class="form-label">背景图片 URL</label>
          <input type="text" class="form-input" id="setBgImage" value="${escapeHtml(bg.image || "")}" placeholder="https://...">
        </div>
        <div class="form-group">
          <label class="form-label">背景蒙层</label>
          <input type="text" class="form-input" id="setBgOverlay" value="${escapeHtml(bg.overlay || "")}" placeholder="rgba(15,23,42,0.35)">
          <p class="form-hint">格式：rgba(红,绿,蓝,透明度)，图片背景下用于提升文字可读性</p>
        </div>
        <div class="bg-preview" id="bgPreview"></div>
      </div>

      <div class="settings-panel" id="panel-seo">
        <div class="form-group">
          <label class="form-label">SEO 关键词（逗号分隔）</label>
          <input type="text" class="form-input" id="setSeoKeywords" value="${escapeHtml(seo.keywords || "")}" placeholder="个人导航,网址导航,书签管理">
        </div>
        <div class="form-group">
          <label class="form-label">SEO 描述（留空则使用副标题）</label>
          <textarea class="form-textarea" id="setSeoDesc" placeholder="用于搜索引擎摘要的站点描述">${escapeHtml(seo.description || "")}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label">分享封面图 URL（OG 图片）</label>
          <input type="text" class="form-input" id="setSeoImage" value="${escapeHtml(seo.ogImage || "")}" placeholder="https://... 分享到微信/QQ 等平台时的封面">
        </div>
        <p class="form-hint">保存后会自动更新页面标题、描述、关键词以及社交平台（微信/QQ/微博等）分享时的预览信息。</p>
      </div>

      <div class="settings-panel" id="panel-category">
        <div id="categoryList"></div>
        <button type="button" class="btn btn-sm" id="addCategoryBtn" style="margin-top:12px;">+ 添加分类</button>
      </div>

      <div class="settings-panel" id="panel-engine">
        <div id="engineList"></div>
        <button type="button" class="btn btn-sm" id="addEngineBtn" style="margin-top:12px;">+ 添加搜索引擎</button>
      </div>

      <div class="settings-panel" id="panel-data">
        <div class="form-group">
          <label class="form-label">GitHub 云同步（多端共享数据）</label>
          <input type="password" class="form-input" id="cloudToken" value="${escapeHtml(cloudCfg.token || "")}" placeholder="GitHub Token（仅存本机浏览器，需 gist 权限）" autocomplete="off">
          <input type="text" class="form-input" id="cloudGist" value="${escapeHtml(cloudCfg.gistId === "new" ? "" : cloudCfg.gistId || "")}" placeholder="Gist ID（留空自动创建私有 Gist）" style="margin-top:8px;">
          <div class="cloud-actions" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;">
            <button type="button" class="btn btn-sm" id="cloudTestBtn">验证并保存</button>
            <button type="button" class="btn btn-sm" id="cloudSyncBtn">立即同步</button>
            <button type="button" class="btn btn-sm btn-danger" id="cloudClearBtn">解除绑定</button>
          </div>
          <p class="form-hint">所有修改将自动上传到私有 Gist，其他设备首次打开时自动拉取最新数据，实现多端同步。Token 只保存在本机浏览器，不会上传或写入代码。</p>
        </div>
        <div class="form-group">
          <button type="button" class="btn" id="exportDataBtn">📤 导出数据 (JSON)</button>
        </div>
        <div class="form-group">
          <label class="form-label">导入数据 (JSON)</label>
          <textarea class="form-textarea" id="importDataText" placeholder="粘贴 JSON 数据..."></textarea>
          <button type="button" class="btn btn-sm" id="importDataBtn" style="margin-top:8px;">导入</button>
        </div>
        <div class="form-group">
          <button type="button" class="btn btn-danger" id="resetDataBtn">🔄 恢复默认数据</button>
          <p class="form-hint">将清除所有自定义修改，恢复到初始状态</p>
        </div>
      </div>
    `,
    onConfirm: () => {
      mutate((data) => {
        data.site.name = $("#setSiteName").value.trim() || "快捷导航";
        data.site.logo = $("#setLogo").value.trim();
        data.site.avatar = $("#setAvatar").value.trim();
        data.site.description = $("#setDesc").value.trim();
        data.site.tabTitle = $("#setTabTitle").value.trim();
        data.site.favicon = $("#setFavicon").value.trim();
        data.site.footer = {
          enabled: $("#setFooterEnabled").checked,
          text: $("#setFooterText").value.trim() || "Personal Navigation © 2026 · Powered by Vite",
        };
        data.seo = data.seo || {};
        data.seo.keywords = $("#setSeoKeywords").value.trim();
        data.seo.description = $("#setSeoDesc").value.trim();
        data.seo.ogImage = $("#setSeoImage").value.trim();
        data.theme = {
          mode: $("#setThemeMode").value,
          accent: $("#setThemeAccentText").value.trim() || "#4f46e5",
          text: $("#setThemeTextText").value.trim() || "#111827",
          textSecondary: $("#setThemeTextSecondaryText").value.trim() || "#6b7280",
          surface: $("#setThemeSurfaceText").value.trim() || "#ffffff",
          surfaceHover: $("#setThemeSurfaceHoverText").value.trim() || "#f1f5f9",
          border: $("#setThemeBorderText").value.trim() || "#e5e7eb",
          radius: $("#setThemeRadius").value,
        };
        data.background.type = $("#setBgType").value;
        data.background.color = $("#setThemeBgText").value.trim() || "#f6f8fb";
        data.background.image = $("#setBgImage").value.trim();
        data.background.overlay = $("#setBgOverlay").value.trim() || "rgba(255,255,255,0)";
      });
      toast("设置已保存");
      return true;
    },
  });

  // ---------- 面板标签切换 ----------
  $$(".settings-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      $$(".settings-tab").forEach((t) => t.classList.remove("active"));
      $$(".settings-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      const panel = $("#panel-" + tab.dataset.panel);
      if (panel) panel.classList.add("active");
      if (tab.dataset.panel === "category") renderCategoryManager();
      if (tab.dataset.panel === "engine") renderEngineManager();
    });
  });

  // ---------- 主题实时预览 ----------
  const syncBgToTheme = () => {
    const v = $("#setBgColorText").value.trim() || "#f6f8fb";
    $("#setThemeBg").value = v;
    $("#setThemeBgText").value = v;
  };
  const syncThemeBgToBg = () => {
    const v = $("#setThemeBgText").value.trim() || "#f6f8fb";
    $("#setBgColor").value = v;
    $("#setBgColorText").value = v;
  };
  const previewTheme = () => {
    const mode = $("#setThemeMode").value;
    const dark =
      mode === "dark" || (mode === "system" && (window.matchMedia?.("(prefers-color-scheme: dark)").matches || false));
    const accent = $("#setThemeAccentText").value.trim();
    const radius = $("#setThemeRadius").value;
    if (dark) {
      applyThemeValues({ ...DARK_THEME, accent, radius });
    } else {
      applyThemeValues({
        accent,
        text: $("#setThemeTextText").value.trim(),
        textSecondary: $("#setThemeTextSecondaryText").value.trim(),
        surface: $("#setThemeSurfaceText").value.trim(),
        surfaceHover: $("#setThemeSurfaceHoverText").value.trim(),
        border: $("#setThemeBorderText").value.trim(),
        radius,
      });
    }
    syncThemeBgToBg();
    updateBgPreview();
  };
  const bindColorRow = (colorId, textId) => {
    $(`#${colorId}`).addEventListener("input", (e) => {
      $(`#${textId}`).value = e.target.value;
      previewTheme();
    });
    $(`#${textId}`).addEventListener("input", previewTheme);
  };
  bindColorRow("setThemeAccent", "setThemeAccentText");
  bindColorRow("setThemeSurface", "setThemeSurfaceText");
  bindColorRow("setThemeSurfaceHover", "setThemeSurfaceHoverText");
  bindColorRow("setThemeBorder", "setThemeBorderText");
  bindColorRow("setThemeText", "setThemeTextText");
  bindColorRow("setThemeTextSecondary", "setThemeTextSecondaryText");
  $("#setThemeRadius").addEventListener("change", previewTheme);
  $("#setThemeMode").addEventListener("change", previewTheme);
  // 背景色联动（主题面板 ↔ 背景面板）
  $("#setThemeBg").addEventListener("input", (e) => {
    $("#setThemeBgText").value = e.target.value;
    previewTheme();
  });
  $("#setThemeBgText").addEventListener("input", previewTheme);
  $("#setBgColor").addEventListener("input", (e) => {
    $("#setBgColorText").value = e.target.value;
    syncBgToTheme();
    updateBgPreview();
  });
  $("#setBgColorText").addEventListener("input", () => {
    syncBgToTheme();
    updateBgPreview();
  });

  // ---------- 背景实时预览 ----------
  $("#setBgType").addEventListener("change", (e) => {
    const isImage = e.target.value === "image";
    $("#bgColorGroup").style.display = isImage ? "none" : "block";
    $("#bgImageGroup").style.display = isImage ? "block" : "none";
    updateBgPreview();
  });
  $("#setBgImage").addEventListener("input", updateBgPreview);
  updateBgPreview();

  // ---------- 分类管理 ----------
  $("#addCategoryBtn").addEventListener("click", addCategory);
  renderCategoryManager();

  // ---------- 搜索引擎管理 ----------
  $("#addEngineBtn").addEventListener("click", () => openEngineEditor(-1));
  renderEngineManager();

  // ---------- 数据管理 ----------
  $("#exportDataBtn").addEventListener("click", exportData);
  $("#importDataBtn").addEventListener("click", importData);
  $("#resetDataBtn").addEventListener("click", () => {
    if (!confirm("确定恢复默认数据？所有自定义修改将丢失！")) return;
    resetData();
    toast("已恢复默认数据");
    closeModal();
  });

  // ---------- GitHub 云同步 ----------
  $("#cloudTestBtn").addEventListener("click", async () => {
    const token = $("#cloudToken").value.trim();
    if (!token) return toast("请填写 GitHub Token", "warning");
    try {
      const login = await testToken(token);
      const gistId = $("#cloudGist").value.trim();
      saveCloudConfig({ token, gistId: gistId || "new" });
      toast(`Token 有效（@${login}）`);
      // 先拉取云端数据，再上传本地，避免新设备覆盖云端数据
      await syncFromCloud();
      await syncToCloud();
    } catch (e) {
      toast("验证失败：" + e.message, "error");
    }
  });
  $("#cloudSyncBtn").addEventListener("click", async () => {
    await syncFromCloud();
    await syncToCloud();
  });
  $("#cloudClearBtn").addEventListener("click", () => {
    saveCloudConfig({ token: "", gistId: "" });
    $("#cloudToken").value = "";
    $("#cloudGist").value = "";
    toast("已解除云端同步绑定");
  });
}

function updateBgPreview() {
  const preview = $("#bgPreview");
  const type = $("#setBgType").value;
  if (type === "image") {
    const url = $("#setBgImage").value;
    preview.style.backgroundImage = url ? `url("${url}")` : "";
    preview.style.backgroundColor = "#e2e8f0";
  } else {
    preview.style.backgroundImage = "";
    preview.style.backgroundColor = $("#setThemeBgText").value.trim() || "#f6f8fb";
  }
}

function addCategory() {
  const name = prompt("请输入分类名称：");
  if (!name || !name.trim()) return;
  mutate((data) => data.categories.push({ id: uid(), name: name.trim(), icon: "📁", iconType: "emoji", sites: [] }));
  renderCategoryManager();
}

function openCategoryIconPicker(i) {
  const cat = state.data.categories[i];
  if (!cat) return;
  let field;
  openModal({
    title: `分类图标 - ${cat.name}`,
    size: "",
    stack: true,
    body: `<div class="icon-field" id="catIconField"></div>`,
    confirmText: "保存",
    onConfirm: () => {
      const { icon, iconType } = field.getValue();
      mutate((data) => {
        data.categories[i].icon = icon;
        data.categories[i].iconType = iconType;
      });
      toast("分类图标已更新");
      renderCategoryManager();
      return true;
    },
  });
  field = renderIconField($("#catIconField"), { icon: cat.icon, iconType: cat.iconType });
}

function renderCategoryManager() {
  const list = $("#categoryList");
  if (!list) return;
  const cats = state.data.categories;
  list.innerHTML = cats
    .map(
      (c, i) => `
      <div class="form-row cat-row">
        <button type="button" class="cat-icon-btn" data-cat-icon-edit="${i}" title="点击选择图标">${iconHtmlFor(c)}</button>
        <input type="text" class="form-input" value="${escapeHtml(c.name)}" data-cat-name="${i}" title="分类名称">
        <button type="button" class="btn btn-sm btn-danger" data-cat-del="${i}">删除</button>
      </div>`
    )
    .join("");

  $$("[data-cat-icon-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openCategoryIconPicker(parseInt(btn.dataset.catIconEdit, 10)));
  });
  $$("[data-cat-name]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const i = parseInt(e.target.dataset.catName, 10);
      mutate((data) => {
        data.categories[i].name = e.target.value;
      });
    });
  });
  $$("[data-cat-del]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const i = parseInt(e.target.dataset.catDel, 10);
      const cat = state.data.categories[i];
      if (!confirm(`确定删除分类「${cat.name}」？该分类下的 ${cat.sites.length} 个站点也会被删除。`)) return;
      mutate((data) => {
        data.categories.splice(i, 1);
      });
      renderCategoryManager();
    });
  });
}

// ---------- 搜索引擎管理 ----------
function openEngineEditor(idx) {
  const engines = state.data.searchEngines;
  const eng = idx >= 0 ? engines[idx] : { name: "", url: "", icon: "", iconType: "emoji" };
  let field;
  openModal({
    title: idx >= 0 ? "编辑搜索引擎" : "添加搜索引擎",
    stack: true,
    body: `
      <div class="form-group">
        <label class="form-label">名称 *</label>
        <input type="text" class="form-input" id="engineName" value="${escapeHtml(eng.name)}" placeholder="例如：Google">
      </div>
      <div class="form-group">
        <label class="form-label">搜索 URL *（末尾为关键词拼接处）</label>
        <input type="text" class="form-input" id="engineUrl" value="${escapeHtml(eng.url)}" placeholder="https://www.google.com/search?q=">
      </div>
      <div class="form-group">
        <label class="form-label">图标</label>
        <div class="icon-field" id="engineIconField"></div>
      </div>
      <p class="form-hint">在搜索框输入关键词后，会拼接到 URL 末尾打开搜索结果。</p>
    `,
    confirmText: idx >= 0 ? "保存" : "添加",
    onConfirm: () => {
      const name = $("#engineName").value.trim();
      const url = $("#engineUrl").value.trim();
      if (!name || !url) {
        toast("名称和搜索 URL 不能为空", "error");
        return false;
      }
      const { icon, iconType } = field.getValue();
      mutate((data) => {
        if (idx >= 0) {
          data.searchEngines[idx] = { id: engines[idx].id, name, url, icon, iconType };
        } else {
          data.searchEngines.push({ id: uid(), name, url, icon, iconType });
        }
      });
      toast(idx >= 0 ? "搜索引擎已更新" : "搜索引擎已添加");
      renderEngineManager();
      return true;
    },
  });
  field = renderIconField($("#engineIconField"), { icon: eng.icon, iconType: eng.iconType });
}

function deleteEngine(i) {
  const engines = state.data.searchEngines;
  if (engines.length <= 1) {
    toast("至少保留一个搜索引擎", "warning");
    return;
  }
  const eng = engines[i];
  if (!confirm(`确定删除「${eng.name}」吗？`)) return;
  const wasCurrent = state.engineId === eng.id;
  mutate((data) => {
    data.searchEngines.splice(i, 1);
  });
  if (wasCurrent) setEngine(state.data.searchEngines[0]?.id || "");
  renderEngineManager();
}

function renderEngineManager() {
  const list = $("#engineList");
  if (!list) return;
  const engines = state.data.searchEngines;
  list.innerHTML = engines
    .map(
      (e, i) => `
      <div class="engine-row">
        <span class="engine-icon-static">${iconHtmlFor(e)}</span>
        <input type="text" class="form-input" value="${escapeHtml(e.name)}" data-engine-name="${i}" title="引擎名称">
        <div class="engine-actions">
          <button type="button" class="btn btn-sm" data-engine-edit="${i}">编辑</button>
          <button type="button" class="btn btn-sm btn-danger" data-engine-del="${i}">删除</button>
        </div>
      </div>`
    )
    .join("");

  $$("[data-engine-name]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const i = parseInt(e.target.dataset.engineName, 10);
      mutate((data) => {
        data.searchEngines[i].name = e.target.value;
      });
    });
  });
  $$("[data-engine-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openEngineEditor(parseInt(btn.dataset.engineEdit, 10)));
  });
  $$("[data-engine-del]").forEach((btn) => {
    btn.addEventListener("click", () => deleteEngine(parseInt(btn.dataset.engineDel, 10)));
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nav-data.json";
  a.click();
  URL.revokeObjectURL(url);
  toast("数据已导出");
}

function importData() {
  const text = $("#importDataText").value.trim();
  if (!text) return toast("请粘贴 JSON 数据", "warning");
  try {
    const imported = JSON.parse(text);
    if (!imported || !Array.isArray(imported.categories)) {
      throw new Error("数据格式不正确（缺少 categories）");
    }
    replaceData(imported);
    toast("数据已导入");
    closeModal();
  } catch (e) {
    toast("导入失败：" + e.message, "error");
  }
}
