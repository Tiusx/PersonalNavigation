// ========== 自定义确认弹窗（替代原生 confirm，保持应用内 UI 一致） ==========
import { openModal } from "./modal.js";
import { escapeHtml } from "../utils/dom.js";

/**
 * 弹出确认框
 * @param {{ title?: string, message: string, confirmText?: string, danger?: boolean, stack?: boolean, onConfirm?: () => boolean|void, onCancel?: () => void }} opts
 *  - onConfirm 返回 false 时不关闭弹窗
 */
export function showConfirm({ title = "确认操作", message = "", confirmText = "确定", danger = false, stack = true, onConfirm, onCancel } = {}) {
  openModal({
    title,
    stack,
    body: `<p class="confirm-message">${escapeHtml(message)}</p>`,
    confirmText,
    onConfirm: () => {
      if (onConfirm?.() === false) return false;
      return true;
    },
    onCancel,
  });
  if (danger) {
    const overlay = document.querySelector(".modal-overlay.show");
    overlay?.querySelector('[data-action="confirm"]')?.classList.add("btn-danger");
  }
}

/**
 * Promise 版确认：确定 resolve(true)，取消/关闭 resolve(false)
 */
export function confirmAsync(message, { title = "确认操作", confirmText = "确定", danger = false } = {}) {
  return new Promise((resolve) => {
    showConfirm({
      title,
      message,
      confirmText,
      danger,
      onConfirm: () => {
        resolve(true);
        return true;
      },
      onCancel: () => resolve(false),
    });
  });
}
