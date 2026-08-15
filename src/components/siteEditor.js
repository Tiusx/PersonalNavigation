// ========== 站点编辑 / 删除 ==========
import { state, currentCategory, mutate, setCategory } from "../state.js";
import { $, escapeHtml } from "../utils/dom.js";
import { openModal } from "./modal.js";
import { renderIconField } from "./iconFields.js";
import { toast } from "./toast.js";

export function openSiteEditor(idx) {
  const cat = currentCategory();
  if (!cat) return;
  const editing = idx >= 0;
  const site = editing ? cat.sites[idx] : { name: "", url: "", icon: "", iconType: "emoji", desc: "" };

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
        <input type="text" class="form-input" id="editUrl" value="${escapeHtml(site.url)}" placeholder="https://...">
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
}

export function deleteSite(idx) {
  const cat = currentCategory();
  if (!cat) return;
  const site = cat.sites[idx];
  if (!site) return;
  if (!confirm(`确定删除「${site.name}」吗？`)) return;
  mutate((data) => {
    const c = data.categories.find((cc) => cc.id === cat.id);
    c.sites.splice(idx, 1);
  });
  toast("站点已删除");
}
