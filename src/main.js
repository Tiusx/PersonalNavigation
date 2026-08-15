// ========== 应用入口 ==========
import "./styles/style.css";
import "./styles/remixicon.css";
import { initState, subscribe } from "./state.js";
import { applyBackground } from "./background.js";
import { applyTheme } from "./theme.js";
import { applySeo } from "./seo.js";
import { renderHeader, updateClock } from "./components/header.js";
import { renderSearch, updateEngineUI } from "./components/search.js";
import { renderCategories } from "./components/categoryTabs.js";
import { renderSites } from "./components/siteGrid.js";
import { renderFooter } from "./components/footer.js";
import { closeModal } from "./components/modal.js";
import { isTypingTarget } from "./utils/dom.js";
import { initCloudSync, syncFromCloud } from "./cloud.js";

initState();
applyTheme();
applyBackground();
applySeo();

// 云同步：数据保存自动上传 + 启动时拉取最新
initCloudSync();
syncFromCloud();

renderHeader();
renderSearch();
renderCategories();
renderSites();
renderFooter();

// 状态变化时统一重渲染
subscribe(() => {
  applyTheme();
  applyBackground();
  applySeo();
  renderHeader();
  renderSearch();
  renderCategories();
  renderSites();
  renderFooter();
  updateEngineUI();
});

// 时钟
setInterval(updateClock, 1000);

// 系统深浅色变化时实时跟随
const colorScheme = window.matchMedia?.("(prefers-color-scheme: dark)");
if (colorScheme?.addEventListener) {
  colorScheme.addEventListener("change", () => {
    applyTheme();
    applyBackground();
    applySeo();
  });
}

// 全局快捷键
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    return;
  }
  // "/" 或 Ctrl/Cmd + K 聚焦搜索框
  if ((e.key === "/" || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) && !isTypingTarget(e.target)) {
    e.preventDefault();
    document.getElementById("searchInput")?.focus();
  }
});

// 点击外部关闭引擎下拉
document.addEventListener("click", (e) => {
  const selector = document.getElementById("engineSelector");
  if (selector && !selector.contains(e.target)) {
    selector.classList.remove("open");
  }
});
