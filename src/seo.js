// ========== SEO / 分享元信息同步 ==========
import { state } from "./state.js";
import { currentMode, DARK_BACKGROUND } from "./theme.js";

function setMeta(selector, attr, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** 根据设置更新 title、description、keywords 等 meta 标签 */
export function applySeo() {
  if (!state.data) return;
  const site = state.data.site;
  const seo = state.data.seo || {};
  const bg = state.data.background || {};

  const title = site.tabTitle || site.name || "个人导航";
  const siteName = site.name || "个人导航";
  const description = seo.description || site.description || "";
  const keywords = seo.keywords || "";
  const ogImage = seo.ogImage || site.logo || "";

  document.title = title;

  setMeta('meta[name="description"]', "content", description);
  setMeta('meta[name="keywords"]', "content", keywords);
  setMeta('meta[property="og:site_name"]', "content", siteName);
  setMeta('meta[property="og:title"]', "content", title);
  setMeta('meta[property="og:description"]', "content", description);
  setMeta('meta[property="og:image"]', "content", ogImage);
  setMeta('meta[name="twitter:card"]', "content", "summary");
  setMeta('meta[name="twitter:title"]', "content", title);
  setMeta('meta[name="twitter:description"]', "content", description);

  // 浏览器标签页图标（Favicon）同步
  const favicon = site.favicon || "./favicon.svg";
  let icon = document.querySelector('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }
  icon.href = favicon;
  let apple = document.querySelector('link[rel="apple-touch-icon"]');
  if (!apple) {
    apple = document.createElement("link");
    apple.rel = "apple-touch-icon";
    document.head.appendChild(apple);
  }
  apple.href = favicon;

  const themeColor = currentMode() === "dark" ? DARK_BACKGROUND : bg.color;
  if (themeColor) setMeta('meta[name="theme-color"]', "content", themeColor);
}
