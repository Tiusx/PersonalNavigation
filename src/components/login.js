// ========== 管理员登录 ==========
import { config } from "../config.js";
import { setLoggedIn } from "../state.js";
import { $ } from "../utils/dom.js";
import { openModal } from "./modal.js";
import { toast } from "./toast.js";
import { openSettings } from "./settings.js";

export function openLoginModal({ afterLogin = false } = {}) {
  openModal({
    title: "管理员登录",
    body: `
      <div class="form-group">
        <label class="form-label">管理密钥</label>
        <input type="password" class="form-input" id="loginPassword" placeholder="请输入管理密钥" autocomplete="off">
      </div>
      <p class="form-hint">密钥在 src/config.js 中配置，部署时可通过环境变量注入</p>
    `,
    confirmText: "登录",
    onConfirm: () => {
      const pwd = $("#loginPassword").value;
      if (pwd === config.adminPassword) {
        setLoggedIn(true);
        toast("登录成功，已进入编辑模式");
        // 登录成功后自动打开设置面板
        if (afterLogin) setTimeout(openSettings, 260);
        return true;
      }
      toast("密钥错误", "error");
      return false;
    },
  });
}
