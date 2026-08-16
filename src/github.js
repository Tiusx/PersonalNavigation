// ========== GitHub 仓库同步（手动上传/拉取数据文件，无需服务器） ==========
import { state, replaceData } from "./state.js";
import { loadJSON, saveJSON } from "./utils/storage.js";
import { toast } from "./components/toast.js";
import { confirmAsync } from "./components/confirm.js";

const GH_KEY = "nav.github";
const GH_API = "https://api.github.com";
const DEFAULT_PATH = "src/builtin-data.json";

export function getGithubConfig() {
  return loadJSON(GH_KEY, { token: "", repo: "", path: DEFAULT_PATH });
}

export function saveGithubConfig(cfg) {
  saveJSON(GH_KEY, cfg);
}

function authHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api(path, options = {}) {
  const res = await fetch(GH_API + path, options);
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

function parseRepo(repo) {
  const parts = (repo || "").split("/").map((s) => s.trim());
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { owner: parts[0], repoName: parts[1] };
}

function parsePath(path) {
  return (path || DEFAULT_PATH).trim().replace(/^\/+/, "") || DEFAULT_PATH;
}

/** 校验 Token 并确认仓库可访问，返回 { login, fullName } */
export async function testGithub(token, repo) {
  const userRes = await fetch(`${GH_API}/user`, { headers: authHeaders(token) });
  if (!userRes.ok) throw new Error(`Token 无效（${userRes.status}）`);
  const user = await userRes.json();
  const r = parseRepo(repo);
  if (!r) throw new Error("仓库格式应为 owner/repo");
  const rep = await api(`/repos/${r.owner}/${r.repoName}`, { headers: authHeaders(token) });
  return { login: user.login, fullName: rep.full_name };
}

async function getFileInfo(owner, repoName, path, token) {
  try {
    const r = await api(`/repos/${owner}/${repoName}/contents/${path}`, { headers: authHeaders(token) });
    return { sha: r.sha || null, content: r.content || null };
  } catch (e) {
    if (/404|Not Found/i.test(e.message)) return null;
    throw e;
  }
}

function encodeData(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeData(b64) {
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

/** 手动上传当前数据到 GitHub 仓库文件 */
export async function syncToGithub() {
  const cfg = getGithubConfig();
  if (!cfg.token || !cfg.repo) {
    toast("请先配置 GitHub Token 和仓库", "warning");
    return false;
  }
  const r = parseRepo(cfg.repo);
  if (!r) {
    toast("仓库格式应为 owner/repo", "warning");
    return false;
  }
  const path = parsePath(cfg.path);
  const data = state.data;
  if (!data) return false;
  try {
    const fileInfo = await getFileInfo(r.owner, r.repoName, path, cfg.token);
    // 远程已有数据且比本地更新时，提醒避免覆盖
    if (fileInfo?.content) {
      try {
        const remote = decodeData(fileInfo.content);
        const rt = remote._meta?.updatedAt || 0;
        const lt = data._meta?.updatedAt || 0;
        if (rt > lt) {
          const ok = await confirmAsync("仓库中的数据比当前更新，上传会覆盖远端修改，仍要继续？", {
            title: "确认同步",
            confirmText: "仍要继续",
            danger: true,
          });
          if (!ok) return false;
        }
      } catch (e) {
        /* 远程不是有效数据，直接覆盖 */
      }
    }
    const body = {
      message: "sync personal-nav data",
      content: encodeData(data),
    };
    if (fileInfo?.sha) body.sha = fileInfo.sha;
    await api(`/repos/${r.owner}/${r.repoName}/contents/${path}`, {
      method: "PUT",
      headers: authHeaders(cfg.token),
      body: JSON.stringify(body),
    });
    toast("已同步到 GitHub 仓库");
    return true;
  } catch (e) {
    console.warn("[github] 上传失败:", e);
    toast("同步失败：" + e.message, "error");
    return false;
  }
}

/** 手动从 GitHub 仓库文件拉取数据 */
export async function pullFromGithub() {
  const cfg = getGithubConfig();
  if (!cfg.token || !cfg.repo) {
    toast("请先配置 GitHub Token 和仓库", "warning");
    return false;
  }
  const r = parseRepo(cfg.repo);
  if (!r) {
    toast("仓库格式应为 owner/repo", "warning");
    return false;
  }
  const path = parsePath(cfg.path);
  try {
    const fileInfo = await getFileInfo(r.owner, r.repoName, path, cfg.token);
    if (!fileInfo?.content) {
      toast("仓库中还没有该数据文件，请先在其他设备上传", "warning");
      return false;
    }
    const remote = decodeData(fileInfo.content);
    if (!remote || !remote.categories) {
      toast("仓库文件不是有效的导航数据", "warning");
      return false;
    }
    replaceData(remote);
    toast("已从 GitHub 仓库拉取数据");
    return true;
  } catch (e) {
    console.warn("[github] 拉取失败:", e);
    toast("拉取失败：" + e.message, "error");
    return false;
  }
}
