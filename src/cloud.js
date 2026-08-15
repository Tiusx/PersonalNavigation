// ========== GitHub Gist 云同步（多端共享数据，无需服务器） ==========
import { state, replaceData, onSave } from "./state.js";
import { loadJSON, saveJSON } from "./utils/storage.js";
import { toast } from "./components/toast.js";

const CLOUD_KEY = "nav.cloud";
const FILE_NAME = "personal-nav-data.json";
const GIST_API = "https://api.github.com/gists";

export function getCloudConfig() {
  return loadJSON(CLOUD_KEY, { token: "", gistId: "" });
}

export function saveCloudConfig(cfg) {
  saveJSON(CLOUD_KEY, cfg);
}

function authHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api(path, options = {}) {
  const res = await fetch(GIST_API + path, options);
  if (!res.ok) {
    let msg = `GitHub API ${res.status}`;
    try {
      const j = await res.json();
      msg = j.message || msg;
    } catch (e) {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}

/** 校验 Token 是否有效（返回 GitHub 登录名） */
export async function testToken(token) {
  const res = await fetch("https://api.github.com/user", {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`Token 无效（${res.status}）`);
  const user = await res.json();
  return user.login;
}

/** 检查 Gist 是否公开（供设置页提示访客可读性） */
export async function checkGistPublic(gistId, token) {
  try {
    const g = await api(`/${gistId}`, { headers: authHeaders(token) });
    return g.public === true;
  } catch (e) {
    return undefined;
  }
}

async function fetchGist(gistId, token) {
  const g = await api(`/${gistId}`, { headers: authHeaders(token) });
  const file = g.files && g.files[FILE_NAME];
  if (!file) return null;
  try {
    return JSON.parse(file.content);
  } catch (e) {
    return null;
  }
}

async function createGist(content, token) {
  const g = await api("", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      description: "Personal Navigation 数据备份（公开只读）",
      public: true,
      files: { [FILE_NAME]: { content } },
    }),
  });
  return g.id;
}

async function updateGist(gistId, content, token) {
  await api(`/${gistId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ files: { [FILE_NAME]: { content } } }),
  });
}

async function doUpload(cfg, silent) {
  const data = state.data;
  if (!data) return;
  try {
    if (cfg.gistId === "new") {
      const id = await createGist(JSON.stringify(data), cfg.token);
      saveCloudConfig({ ...cfg, gistId: id });
      if (!silent) toast("已创建公开 Gist 并同步");
    } else {
      await updateGist(cfg.gistId, JSON.stringify(data), cfg.token);
      if (!silent) toast("已同步到云端");
    }
  } catch (e) {
    console.warn("[cloud] 上传失败:", e);
    if (!silent) toast("同步失败：" + e.message, "error");
  }
}

let uploadTimer = null;

/** 数据变化后自动上传（防抖） */
export function scheduleUpload() {
  const cfg = getCloudConfig();
  if (!cfg.token || !cfg.gistId) return;
  if (uploadTimer) clearTimeout(uploadTimer);
  uploadTimer = setTimeout(() => doUpload(cfg, true), 1200);
}

/** 立即上传（用于手动「同步」按钮） */
export async function syncToCloud() {
  const cfg = getCloudConfig();
  if (!cfg.token) {
    toast("请先配置 GitHub Token", "warning");
    return false;
  }
  await doUpload(cfg, false);
  return true;
}

/** 从云端拉取并合并（云端数据更新时覆盖本地） */
export async function syncFromCloud() {
  const cfg = getCloudConfig();
  if (!cfg.token || !cfg.gistId || cfg.gistId === "new") return;
  try {
    const remote = await fetchGist(cfg.gistId, cfg.token);
    if (!remote || !remote.categories) return;
    const local = state.data;
    const remoteT = remote._meta?.updatedAt || 0;
    const localT = local._meta?.updatedAt || 0;
    if (remoteT > localT) {
      replaceData(remote);
      toast("已从云端同步最新数据");
    }
  } catch (e) {
    console.warn("[cloud] 拉取失败:", e);
  }
}

/** 部署时注入的公开 Gist ID（构建时通过环境变量 VITE_PUBLIC_GIST_ID 配置） */
function publicGistId() {
  return (import.meta.env && import.meta.env.VITE_PUBLIC_GIST_ID) || "";
}

/** 访客只读拉取站长分享的数据（无需 Token） */
export async function pullPublicGist() {
  const gistId = publicGistId();
  if (!gistId) return;
  try {
    const remote = await fetchGist(gistId, "");
    if (!remote || !remote.categories) return;
    const localT = state.data?._meta?.updatedAt || 0;
    const remoteT = remote._meta?.updatedAt || 0;
    // 访客无写入权限，本地修改无意义，始终以云端数据为准
    replaceData(remote);
    if (remoteT > localT) toast("已加载站长分享的数据");
  } catch (e) {
    console.warn("[cloud] 公开数据拉取失败:", e);
  }
}

/** 注册：每次数据保存后自动上传 */
export function initCloudSync() {
  onSave(scheduleUpload);
}
