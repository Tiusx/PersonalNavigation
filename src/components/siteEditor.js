// ========== 站点编辑 / 删除 ==========
import { state, currentCategory, mutate, setCategory } from "../state.js";
import { $, escapeHtml } from "../utils/dom.js";
import { openModal } from "./modal.js";
import { renderIconField } from "./iconFields.js";
import { resolveSiteMeta } from "../site-meta.js";
import { showConfirm } from "./confirm.js";
import { toast } from "./toast.js";

/** 域名美化：www.github.com → Github */
function prettyHost(host) {
  const h = (host || "").toLowerCase().replace(/^www\./, "").split(".")[0];
  return h ? h.charAt(0).toUpperCase() + h.slice(1) : "";
}

export function openSiteEditor(idx) {
  const cat = currentCategory();
  if (!cat) return;
  const editing = idx >= 0;
  const site = editing ? cat.sites[idx] : { name: "", url: "", icon: "", iconType: "svg", desc: "" };

  const catOptions = state.data.categories
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id === cat.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`
    )
    .join("");

  openModal({
    title: editing ? "编辑站点" : "添加站点",
    body: `
      <div class="form-group">
        <label class="form-label">站点名称 *</label>
        <input type="text" class="form-input" id="editName" value="${escapeHtml(site.name)}" placeholder="例如：GitHub">
      </div>
      <div class="form-group">
        <label class="form-label">网址 *</label>
        <div class="url-row">
          <input type="text" class="form-input" id="editUrl" value="${escapeHtml(site.url)}" placeholder="https://...">
          <button type="button" class="btn btn-sm" id="resolveBtn" title="根据网址解析域名、匹配本地品牌图标">⚡ 自动解析</button>
        </div>
        <p class="form-hint">点击「自动解析」会抓取网页标题/关键词填入名称与描述、匹配品牌图标（优先本地图标库，其次在线图标 CDN / 网站 favicon），解析结果会直接覆盖当前填写内容。</p>
      </div>
      <div class="form-group">
        <label class="form-label">图标</label>
        <div class="icon-field" id="iconField"></div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">所属分类</label>
          <select class="form-select" id="editCategory">${catOptions}</select>
        </div>
        <div class="form-group">
          <label class="form-label">描述</label>
          <input type="text" class="form-input" id="editDesc" value="${escapeHtml(site.desc || "")}" placeholder="简短描述">
        </div>
      </div>
    `,
    confirmText: editing ? "保存" : "添加",
    onConfirm: () => {
      const name = $("#editName").value.trim();
      const url = $("#editUrl").value.trim();
      if (!name || !url) {
        toast("名称和网址不能为空", "error");
        return false;
      }
      const { icon, iconType } = iconField.getValue();
      const desc = $("#editDesc").value.trim();
      const targetCatId = $("#editCategory").value;

      mutate((data) => {
        const src = data.categories.find((c) => c.id === cat.id);
        const target = data.categories.find((c) => c.id === targetCatId);
        const siteObj = { name, url, icon, iconType, desc };
        if (editing) {
          if (targetCatId === cat.id) {
            target.sites[idx] = siteObj;
          } else {
            src.sites.splice(idx, 1);
            target.sites.push(siteObj);
          }
        } else {
          target.sites.push(siteObj);
        }
      });
      setCategory(targetCatId);
      toast(editing ? "站点已更新" : "站点已添加");
      return true;
    },
  });

  const iconField = renderIconField($("#iconField"), {
    icon: site.icon,
    iconType: site.iconType,
  });

  // ---------- 自动解析（本地图标库 → 在线图标 CDN → 抓取 TDK → favicon 兜底） ----------
  const nameInput = $("#editName");
  const urlInput = $("#editUrl");
  const resolveBtn = $("#resolveBtn");
  const descInput = $("#editDesc");

  const applyMeta = (meta) => {
    // 解析结果直接覆盖名称与描述（用户要求）
    nameInput.value = meta.name || prettyHost(meta.host);
    if (meta.desc) descInput.value = meta.desc;
    iconField.setValue({ icon: meta.icon, iconType: meta.iconType });
  };

  resolveBtn.addEventListener("click", () => {
    const raw = urlInput.value.trim();
    if (!raw) {
      toast("请先填写网址", "warning");
      return;
    }
    const meta = resolveSiteMeta(raw, {
      onUpdate: (refined) => {
        applyMeta(refined);
        toast("已补充网页标题 / 关键词，请确认后保存");
      },
    });
    if (!meta) {
      toast("网址格式不正确", "error");
      return;
    }
    applyMeta(meta);
    toast("已解析标题与图标（在线详情解析中…）");
  });
}

export function deleteSite(idx) {
  const cat = currentCategory();
  if (!cat) return;
  const site = cat.sites[idx];
  if (!site) return;
  showConfirm({
    title: "删除站点",
    message: `确定删除「${site.name}」吗？`,
    confirmText: "删除",
    danger: true,
    onConfirm: () => {
      mutate((data) => {
        const c = data.categories.find((cc) => cc.id === cat.id);
        c.sites.splice(idx, 1);
      });
      toast("站点已删除");
      return true;
    },
  });
}
