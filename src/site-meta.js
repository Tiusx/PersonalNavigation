// ========== 站点信息解析（TDK / 图标） ==========
// 所有 TDK 信息（名称、描述、关键词、favicon）统一来自 webscanner.online 服务端抓取，
// 不再使用本地代码匹配或其他代理链。CDN 图标库仅用于手动选择，自动解析全部走 webscanner。
import { config } from "./config.js";

/** 域名美化：www.github.com → Github */
export function prettyHost(host = "") {
  const h = String(host || "").toLowerCase().replace(/^www\./, "").split(".")[0];
  return h ? h.charAt(0).toUpperCase() + h.slice(1) : "";
}

/** 清理标题：取品牌段（去掉 " - 网站名" 等后缀），控制长度 */
function cleanTitle(title = "") {
  const t = String(title || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const seg = t.split(/\s*[-–—|｜·•_]\s*/)[0].trim();
  return seg.length > 40 ? seg.slice(0, 40) : seg;
}

// ---------- 在线品牌图标（simple-icons CDN，仅引用不下载） ----------
const REMOTE_SLUGS = {
  taobao: "taobao", meituan: "meituan", kuaishou: "kuaishou", xiaohongshu: "xiaohongshu",
  zhihu: "zhihu", csdn: "csdn", juejin: "juejin", qq: "qq", wechat: "wechat",
  gitee: "gitee", alipay: "alipay", sogou: "sogou", bilibili: "bilibili", baidu: "baidu",
  xiaomi: "xiaomi", huawei: "huawei", bytedance: "bytedance", douban: "douban",
  deepseek: "deepseek", kimi: "kimi", qwen: "qwen", dazhongdianping: "dazhongdianping",
  leetcode: "leetcode", coursera: "coursera", w3schools: "w3schools", mozilla: "mozilla",
  github: "github", gitlab: "gitlab", stackoverflow: "stackoverflow", npm: "npm",
  cloudflare: "cloudflare", vercel: "vercel", docker: "docker", kubernetes: "kubernetes",
  vite: "vite", figma: "figma", wordpress: "wordpress", vuedotjs: "vuedotjs",
  nodedotjs: "nodedotjs", tailwindcss: "tailwindcss", nextdotjs: "nextdotjs",
  numpy: "numpy", react: "react", python: "python", javascript: "javascript",
  anthropic: "anthropic", claude: "claude", googlegemini: "googlegemini",
  alibabacloud: "alibabacloud", google: "google", youtube: "youtube", facebook: "facebook",
  x: "x", instagram: "instagram", linkedin: "linkedin", telegram: "telegram",
  discord: "discord", reddit: "reddit", spotify: "spotify", netflix: "netflix",
  tiktok: "tiktok", wikipedia: "wikipedia", evernote: "evernote", slack: "slack",
  apple: "apple", android: "android", firefox: "firefox", linux: "linux",
  steam: "steam", oppo: "oppo", vivo: "vivo", oneplus: "oneplus", amazon: "amazon",
};

/** 域名 → slug 的特殊映射（子域名 / 别名） */
const REMOTE_HOST_SLUGS = {
  "developer.mozilla.org": "mozilla",
  "npmjs.com": "npm",
  "music.163.com": "neteasecloudmusic",
  "163.com": "neteasecloudmusic",
  "news.163.com": "neteasecloudmusic",
  "aliyun.com": "alibabacloud",
  "tongyi.aliyun.com": "alibabacloud",
  "gemini.google.com": "googlegemini",
  "kimi.moonshot.cn": "kimi",
  "moonshot.cn": "kimi",
  "stackoverflow.com": "stackoverflow",
  "tailwindcss.com": "tailwindcss",
};

/** 根据域名返回 CDN 图标 URL（匹配不到返回空字符串） */
export function remoteIconForHost(host = "") {
  const h = String(host || "").toLowerCase().replace(/^www\./, "");
  if (!h) return "";
  const slug = REMOTE_HOST_SLUGS[h] || REMOTE_SLUGS[h.split(".")[0]];
  if (!slug) return "";
  const base = String(config.iconCdnBase || "").trim().replace(/\/+$/, "");
  return base ? `${base}/${slug}.svg` : "";
}

// ---------- 在线图标选择列表（供图标选择器「在线」页使用） ----------
export const ONLINE_BRAND_ICONS = [
  { slug: "github", name: "GitHub" },
  { slug: "gitlab", name: "GitLab" },
  { slug: "gitee", name: "Gitee 码云" },
  { slug: "stackoverflow", name: "Stack Overflow" },
  { slug: "mozilla", name: "Mozilla" },
  { slug: "npm", name: "npm" },
  { slug: "codepen", name: "CodePen" },
  { slug: "leetcode", name: "LeetCode" },
  { slug: "coursera", name: "Coursera" },
  { slug: "w3schools", name: "W3Schools" },
  { slug: "baidu", name: "百度" },
  { slug: "bilibili", name: "哔哩哔哩" },
  { slug: "taobao", name: "淘宝" },
  { slug: "tmall", name: "天猫" },
  { slug: "jd", name: "京东" },
  { slug: "meituan", name: "美团" },
  { slug: "dianping", name: "大众点评" },
  { slug: "kuaishou", name: "快手" },
  { slug: "xiaohongshu", name: "小红书" },
  { slug: "zhihu", name: "知乎" },
  { slug: "csdn", name: "CSDN" },
  { slug: "juejin", name: "掘金" },
  { slug: "douban", name: "豆瓣" },
  { slug: "qq", name: "QQ" },
  { slug: "wechat", name: "微信" },
  { slug: "weibo", name: "微博" },
  { slug: "alipay", name: "支付宝" },
  { slug: "sogou", name: "搜狗" },
  { slug: "xiaomi", name: "小米" },
  { slug: "huawei", name: "华为" },
  { slug: "oppo", name: "OPPO" },
  { slug: "vivo", name: "vivo" },
  { slug: "oneplus", name: "一加" },
  { slug: "bytedance", name: "字节跳动" },
  { slug: "deepseek", name: "DeepSeek" },
  { slug: "kimi", name: "Kimi" },
  { slug: "qwen", name: "通义千问" },
  { slug: "neteasecloudmusic", name: "网易云音乐" },
  { slug: "google", name: "Google" },
  { slug: "googlegemini", name: "Gemini" },
  { slug: "youtube", name: "YouTube" },
  { slug: "facebook", name: "Facebook" },
  { slug: "x", name: "X (Twitter)" },
  { slug: "instagram", name: "Instagram" },
  { slug: "linkedin", name: "LinkedIn" },
  { slug: "telegram", name: "Telegram" },
  { slug: "discord", name: "Discord" },
  { slug: "reddit", name: "Reddit" },
  { slug: "spotify", name: "Spotify" },
  { slug: "netflix", name: "Netflix" },
  { slug: "tiktok", name: "TikTok" },
  { slug: "wikipedia", name: "Wikipedia" },
  { slug: "evernote", name: "Evernote" },
  { slug: "slack", name: "Slack" },
  { slug: "amazon", name: "Amazon" },
  { slug: "apple", name: "Apple" },
  { slug: "android", name: "Android" },
  { slug: "firefox", name: "Firefox" },
  { slug: "chrome", name: "Chrome" },
  { slug: "safari", name: "Safari" },
  { slug: "linux", name: "Linux" },
  { slug: "nodedotjs", name: "Node.js" },
  { slug: "vuedotjs", name: "Vue.js" },
  { slug: "react", name: "React" },
  { slug: "python", name: "Python" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "numpy", name: "NumPy" },
  { slug: "docker", name: "Docker" },
  { slug: "kubernetes", name: "Kubernetes" },
  { slug: "vercel", name: "Vercel" },
  { slug: "cloudflare", name: "Cloudflare" },
  { slug: "anthropic", name: "Anthropic" },
  { slug: "claude", name: "Claude" },
  { slug: "alibabacloud", name: "阿里云" },
  { slug: "tailwindcss", name: "Tailwind CSS" },
  { slug: "nextdotjs", name: "Next.js" },
  { slug: "steam", name: "Steam" },
];

/** 在线图标 CDN URL（供选择器「在线」页使用） */
export function onlineIconUrl(slug) {
  const base = String(config.iconCdnBase || "").trim().replace(/\/+$/, "");
  return base ? `${base}/${slug}.svg` : "";
}

// ---------- webscanner.online 服务端抓取 ----------
const WEBSCANNER_API = "https://webscanner.online/api/web/scan/?url=";

/** 通过 webscanner.online 服务器端解析 TDK（返回 null 表示无可用数据） */
async function fetchTdkFromWebScanner(url) {
  const res = await fetch(WEBSCANNER_API + encodeURIComponent(url), {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const j = await res.json();
  if (!j || j.status !== 1 || !j.data) return null;
  const tdk = j.data.tdk || {};
  const title = String(tdk.title || "").trim();
  const keywords = String(tdk.keywords || "").trim();
  const desc = String(tdk.description || "").trim();
  if (!title && !keywords && !desc) return null;
  return { title, keywords, desc, icon: String(j.data.favicon || "").trim() };
}

/** favicon 兜底：使用国内可访问的 Bing favicon 服务（仅拼 URL，不读取内容） */
export function faviconUrl(url) {
  return `https://www.bing.com/favicon.ico?size=64&page_url=${encodeURIComponent(url)}`;
}

/**
 * 解析站点元信息（即时返回基础结果；webscanner TDK 在后台抓取后通过 onUpdate 回调补充）
 * TDK 信息统一来自 webscanner.online，不再使用本地代码匹配或其他代理链
 * @param {string} raw 网址（可省略协议）
 * @param {{ onUpdate?: (meta: object) => void }} opts onUpdate 在抓取到 TDK 后调用（可能较慢/失败）
 * @returns {{ name:string, desc:string, icon:string, iconType:string, host:string, url:string }|null}
 */
export function resolveSiteMeta(raw, { onUpdate } = {}) {
  const input = String(raw || "").trim();
  if (!input) return null;
  const url = input.startsWith("http") ? input : "https://" + input;
  let host = "";
  try {
    host = new URL(url).hostname;
  } catch (e) {
    return null;
  }

  // 即时基础结果：域名美化名 + Bing favicon 兜底
  const meta = {
    name: prettyHost(host),
    desc: "",
    icon: faviconUrl(url),
    iconType: "image",
    host,
    url,
  };

  if (typeof onUpdate === "function") {
    fetchTdkFromWebScanner(url)
      .then((tdk) => {
        if (!tdk) return;
        const cleaned = cleanTitle(tdk.title);
        if (cleaned) meta.name = cleaned;
        const keywords = String(tdk.keywords || "")
          .split(/[,，;；]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .join("，");
        meta.desc = keywords || tdk.desc || "";
        const wIcon = String(tdk.icon || "").trim();
        if (wIcon && !/data:\s*,?\s*$/i.test(wIcon)) {
          meta.icon = wIcon;
          meta.iconType = "image";
        }
        onUpdate({ ...meta });
      })
      .catch(() => {});
  }

  return meta;
}
