// ========== 全局状态 + 数据持久化 ==========
import { config } from "./config.js";
import { loadJSON, saveJSON } from "./utils/storage.js";
import { isImageUrl } from "./utils/dom.js";
import builtinData from "./builtin-data.json";

const DATA_KEY = "nav.data.v2";
const ENGINE_KEY = "nav.engine";
const AUTH_KEY = "nav.auth";

export const state = {
  data: null, // { site, background, categories }
  engineId: config.defaultEngine,
  categoryId: null,
  loggedIn: false,
};

const listeners = new Set();
const saveListeners = new Set();

/** 订阅状态变化，返回取消订阅函数 */
export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** 订阅数据保存事件（用于云同步等），返回取消订阅函数 */
export function onSave(fn) {
  saveListeners.add(fn);
  return () => saveListeners.delete(fn);
}

function emit() {
  listeners.forEach((fn) => fn());
}

function buildDefaultData() {
  return {
    site: { ...config.site },
    seo: { ...config.seo },
    theme: { ...config.theme },
    background: { ...config.background },
    searchEngines: JSON.parse(JSON.stringify(config.searchEngines)),
    categories: JSON.parse(JSON.stringify(config.defaultCategories)),
  };
}

/** 内置数据（部署时打包，访客无需网络即可看到站长数据），返回副本 */
export function getBuiltinData() {
  if (builtinData && Array.isArray(builtinData.categories)) {
    return JSON.parse(JSON.stringify(builtinData));
  }
  return null;
}

export function initState() {
  const local = loadJSON(DATA_KEY, null);
  const builtin = getBuiltinData();
  // 有无 Token 决定身份：有 Token 是管理员（多端同步，本地优先）；无 Token 是访客（始终以部署打包的内置数据为准）
  const hasToken = !!(loadJSON("nav.github", {}) || {}).token;
  if (hasToken) {
    state.data = migrateData(local || builtin || buildDefaultData());
  } else {
    state.data = migrateData(builtin || local || buildDefaultData());
  }
  state.engineId = loadJSON(ENGINE_KEY, config.defaultEngine);
  const engines = state.data.searchEngines || config.searchEngines;
  if (!engines.some((e) => e.id === state.engineId)) {
    state.engineId = engines[0]?.id || config.defaultEngine;
  }
  state.loggedIn = sessionStorage.getItem(AUTH_KEY) === "1";
}

/** 为旧数据补齐 iconType / seo / theme / avatar / searchEngines / _meta 字段 */
function migrateData(data) {
  if (!data || !Array.isArray(data.categories)) return data;
  if (!data._meta) data._meta = { updatedAt: "2000-01-01T00:00:00.000Z" };
  if (!data.seo) data.seo = { ...config.seo };
  if (!data.theme) data.theme = { ...config.theme };
  if (data.theme && !("mode" in data.theme)) data.theme.mode = "system";
  if (!data.searchEngines) data.searchEngines = JSON.parse(JSON.stringify(config.searchEngines));
  if (data.site) {
    if (!("avatar" in data.site)) data.site.avatar = "";
    if (!("tabTitle" in data.site)) data.site.tabTitle = "";
    if (!("favicon" in data.site)) data.site.favicon = "";
    if (!data.site.footer) {
      data.site.footer = { enabled: true, text: "Personal Navigation © 2026 · Powered by Vite" };
    }
  }
  data.categories.forEach((cat) => {
    if (!cat.iconType) {
      cat.iconType = isImageUrl(cat.icon || "") ? "image" : "emoji";
    }
    if (cat.icon && cat.icon.startsWith("svg:") || cat.icon && cat.icon.startsWith("st:")) {
      cat.iconType = "svg";
    }
    (cat.sites || []).forEach((site) => {
      if (!site.iconType) {
        site.iconType = isImageUrl(site.icon || "") ? "image" : "emoji";
      }
      if (site.icon && site.icon.startsWith("svg:") || site.icon && site.icon.startsWith("st:")) {
        site.iconType = "svg";
      }
    });
  });
  (data.searchEngines || []).forEach((engine) => {
    if (!engine.iconType) {
      engine.iconType = isImageUrl(engine.icon || "") ? "image" : "emoji";
    }
    if (engine.icon && engine.icon.startsWith("svg:") || engine.icon && engine.icon.startsWith("st:")) {
      engine.iconType = "svg";
    }
  });
  return data;
}

export function save() {
  // 记录数据更新时间，用于云同步冲突判断
  state.data._meta = state.data._meta || {};
  state.data._meta.updatedAt = new Date().toISOString();
  saveJSON(DATA_KEY, state.data);
  saveListeners.forEach((fn) => fn());
}

export function setEngine(id) {
  state.engineId = id;
  saveJSON(ENGINE_KEY, id);
  emit();
}

export function setCategory(id) {
  state.categoryId = id;
  emit();
}

export function setLoggedIn(value) {
  state.loggedIn = value;
  if (value) sessionStorage.setItem(AUTH_KEY, "1");
  else sessionStorage.removeItem(AUTH_KEY);
  emit();
}

/** 修改数据并自动保存、通知 */
export function mutate(fn) {
  fn(state.data);
  save();
  emit();
}

/** 整体替换数据（如导入） */
export function replaceData(data) {
  state.data = data;
  save();
  emit();
}

export function resetData() {
  state.data = buildDefaultData();
  save();
  emit();
}

/** 当前激活的分类，失效时回退到第一个 */
export function currentCategory() {
  if (!state.data || !state.data.categories.length) return null;
  return (
    state.data.categories.find((c) => c.id === state.categoryId) ||
    state.data.categories[0]
  );
}

/** 当前搜索引擎 */
export function currentEngine() {
  const engines = state.data?.searchEngines || config.searchEngines;
  return engines.find((e) => e.id === state.engineId) || engines[0];
}
