// ========== localStorage 持久化工具 ==========

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("[storage] 读取失败:", key, e);
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("[storage] 保存失败:", key, e);
  }
}

export function removeKey(key) {
  localStorage.removeItem(key);
}
