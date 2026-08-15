// ========== Remix Icon 图标库（供图标选择器使用） ==========
// Remix Icon：https://remixicon.com（国产开源图标库）
// 图标命名：ri-{名称}-{line | fill}，线性和实心两种风格
import { escapeHtml, isImageUrl } from "./utils/dom.js";

// 常用线性图标（line）
export const lineIcons = [
  // 通用 / 界面
  "home-4-line", "home-5-line", "home-smile-2-line", "star-line", "heart-line",
  "heart-3-line", "user-line", "user-3-line", "users-line", "user-heart-line",
  "notification-3-line", "bookmark-line", "bookmark-3-line", "thumb-up-line",
  "thumb-down-line", "search-line", "search-2-line", "zoom-in-line",
  "add-circle-line", "add-line", "close-line", "check-line", "check-double-line",
  "refresh-line", "refresh-3-line", "arrow-right-line", "arrow-right-up-line",
  "external-link-line", "download-2-line", "upload-2-line", "share-forward-2-line",
  "filter-line", "tune-line", "list-unordered", "list-check", "link", "links-line",
  "file-copy-line", "clipboard-line", "delete-bin-6-line", "edit-2-line",
  "pencil-line", "eraser-line", "flag-2-line", "crown-line", "trophy-line",
  "medal-line", "award-line", "rocket-2-line", "fire-line", "zap-line",
  "snowflake-line", "sun-line", "moon-line", "gem-line", "gift-line",
  "coins-line", "price-tag-3-line", "eye-line", "eye-off-line",
  "error-warning-line", "question-line", "information-line", "lightbulb-line",
  "compass-3-line", "map-pin-2-line",

  // 开发 / 技术
  "code-line", "code-s-slash-line", "git-branch-line", "git-commit-line",
  "git-merge-line", "github-line", "terminal-box-line", "database-2-line",
  "server-line", "cloud-line", "cloud-off-line", "cloud-download-line",
  "cloud-upload-line", "box-3-line", "stacks-line", "layout-masonry-line",
  "settings-3-line", "settings-4-line", "tools-line", "wrench-line",
  "paint-brush-line", "file-code-line", "file-text-line", "file-download-line",
  "code-box-line", "bug-line", "laptop-line", "computer-line", "cpu-line",
  "robot-3-line", "brain-line", "magic-line", "shield-keyhole-line", "lock-line",
  "lock-2-line", "key-2-line", "user-secret-line", "qr-code-line",
  "fingerprint-line", "flask-line", "earth-line", "global-line",
  "html5-line", "css3-line", "javascript-line", "nodejs-line", "reactjs-line",
  "vuejs-line",

  // 内容 / 媒体
  "camera-line", "image-line", "image-2-line", "video-line", "film-line",
  "movie-2-line", "play-circle-line", "music-2-line", "headphones-line",
  "microphone-line", "gamepad-line", "tv-2-line", "newspaper-line", "rss-line",
  "podcast-line", "calendar-2-line", "time-line", "hourglass-line", "alarm-line",
  "timer-2-line", "book-line", "book-open-line", "book-2-line", "books-line",
  "graduation-cap-line", "school-line", "pen-nib-line", "folder-line",
  "folder-open-line", "inbox-line", "file-chart-line", "file-user-line",
  "file-shield-line",

  // 商务 / 生活
  "shopping-cart-line", "shopping-bag-3-line", "store-3-line", "truck-line",
  "bank-card-line", "line-chart-line", "bar-chart-2-line", "pie-chart-box-line",
  "percent-line", "calculator-line", "phone-line", "mail-line", "mail-open-line",
  "chat-3-line", "chat-smile-3-line", "message-2-line", "send-plane-2-line",
  "plane-line", "car-line", "train-line", "bicycle-line", "bus-2-line",
  "coffee-line", "cup-line", "cake-3-line", "restaurant-2-line", "pizza-line",
  "heart-pulse-line", "hospital-line", "stethoscope-line", "first-aid-kit-line",
  "leaf-line", "tree-line", "flower-line", "mountain-line", "umbrella-line",
  "snow-line",
];

// 常用实心图标（fill）
export const fillIcons = [
  "home-4-fill", "star-fill", "heart-fill", "user-fill", "users-fill",
  "bookmark-fill", "notification-3-fill", "thumb-up-fill", "thumb-down-fill",
  "search-fill", "add-circle-fill", "close-fill", "check-fill", "refresh-fill",
  "arrow-right-fill", "delete-bin-6-fill", "edit-2-fill", "flag-2-fill",
  "crown-fill", "trophy-fill", "medal-fill", "rocket-2-fill", "fire-fill",
  "zap-fill", "sun-fill", "moon-fill", "gem-fill", "gift-fill", "eye-fill",
  "question-fill", "information-fill", "lightbulb-fill", "compass-3-fill",
  "github-fill", "terminal-box-fill", "server-fill", "cloud-fill", "box-3-fill",
  "settings-3-fill", "tools-fill", "paint-brush-fill", "bug-fill", "cpu-fill",
  "robot-3-fill", "shield-keyhole-fill", "lock-fill", "key-2-fill",
  "user-secret-fill", "qr-code-fill", "earth-fill", "camera-fill",
  "image-fill", "video-fill", "film-fill", "play-circle-fill", "music-2-fill",
  "headphones-fill", "microphone-fill", "gamepad-fill", "tv-2-fill",
  "newspaper-fill", "rss-fill", "calendar-2-fill", "time-fill", "alarm-fill",
  "book-fill", "book-open-fill", "graduation-cap-fill", "folder-fill",
  "inbox-fill", "shopping-cart-fill", "shopping-bag-3-fill", "store-3-fill",
  "bank-card-fill", "line-chart-fill", "pie-chart-box-fill", "phone-fill",
  "mail-fill", "chat-3-fill", "send-plane-2-fill", "plane-fill", "car-fill",
  "coffee-fill", "cup-fill", "heart-pulse-fill", "hospital-fill", "leaf-fill",
  "tree-fill",
];

export const DEFAULT_LIBRARY_ICON = "ri-home-4-line";

/**
 * 根据关键字搜索图标
 * @param {string} query 搜索关键字
 * @param {string} style "line" | "fill"
 * @returns {{ name: string, className: string }[]}
 */
export function searchIcons(query = "", style = "line") {
  const source = style === "fill" ? fillIcons : lineIcons;
  const q = query.trim().toLowerCase();
  const list = q ? source.filter((n) => n.includes(q)) : source;
  return list.map((name) => ({ name, className: `ri-${name}` }));
}

/**
 * 根据站点的 iconType 生成图标 HTML
 * @param {{ icon?: string, iconType?: string }} site
 */
export function iconHtmlFor(site) {
  const icon = site.icon || "";
  if (site.iconType === "library") {
    return `<i class="${escapeHtml(icon || DEFAULT_LIBRARY_ICON)}"></i>`;
  }
  if (site.iconType === "image" || isImageUrl(icon)) {
    return `<img src="${escapeHtml(icon)}" alt="" loading="lazy">`;
  }
  return escapeHtml(icon || "🌐");
}
