// ========== 通用模态框（支持多级弹窗叠加） ==========

function animateClose(overlay) {
  overlay.classList.remove("show");
  setTimeout(() => overlay.remove(), 250);
}

/**
 * 打开模态框
 * @param {{ title: string, body: string, onConfirm?: () => boolean|void, confirmText?: string, size?: string, stack?: boolean }} opts
 *  - stack: true 时叠加在已有弹窗之上（如弹窗内再开子弹窗），false 时先关闭已有弹窗
 */
export function openModal({ title, body, onConfirm, confirmText = "确定", size = "", stack = false } = {}) {
  if (!stack) {
    document.querySelectorAll(".modal-overlay.show").forEach(animateClose);
  }

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal ${size}">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button type="button" class="modal-close" data-action="close" title="关闭">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-ghost" data-action="cancel">取消</button>
        <button type="button" class="btn btn-primary" data-action="confirm">${confirmText}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("show"));

  const close = () => animateClose(overlay);

  overlay.querySelector('[data-action="close"]').addEventListener("click", close);
  overlay.querySelector('[data-action="cancel"]').addEventListener("click", close);
  overlay.querySelector('[data-action="confirm"]').addEventListener("click", () => {
    if (onConfirm?.() !== false) close();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  // 支持回车确认
  overlay.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      overlay.querySelector('[data-action="confirm"]')?.click();
    }
  });
  setTimeout(() => overlay.querySelector("input")?.focus(), 60);
}

/** 关闭最上层弹窗 */
export function closeModal() {
  const overlays = [...document.querySelectorAll(".modal-overlay.show")];
  const top = overlays[overlays.length - 1];
  if (top) animateClose(top);
}
