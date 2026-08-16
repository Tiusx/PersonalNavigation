import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * 构建时从 src/builtin-data.json 读取 site/seo 配置，注入到 index.html。
 * 原因：运行时 applySeo 只在 JS 环境生效，搜索引擎爬虫读取的是静态 HTML，
 * 必须把 SEO 标签直接写进构建产物 dist/index.html，爬虫才能识别。
 * 配合 GitHub 同步（同步会把数据写入 src/builtin-data.json），
 * 每次同步 → 触发 CI 重新构建部署后，产物即携带最新 SEO 信息。
 */
function injectSeoPlugin() {
  let builtin = null;
  try {
    builtin = JSON.parse(
      readFileSync(fileURLToPath(new URL("./src/builtin-data.json", import.meta.url)), "utf-8")
    );
  } catch (e) {
    console.warn("[seo] 无法读取 src/builtin-data.json，使用 index.html 默认 SEO:", e.message);
  }
  if (!builtin) return { name: "inject-seo" };

  const site = builtin.site || {};
  const seo = builtin.seo || {};
  const title = (site.tabTitle || site.name || "个人导航").trim();
  const siteName = (site.name || "个人导航").trim();
  const description = (seo.description || site.description || "").trim();
  const keywords = (seo.keywords || "").trim();
  const ogImage = (seo.ogImage || site.logo || "").trim();
  const favicon = (site.favicon || "./favicon.svg").trim();

  const esc = (s) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  /** 更新或插入 meta 标签（严格匹配 attr=key，避免误匹配其他同名属性如 viewport） */
  const setMeta = (html, attr, key, value) => {
    const tag = `<meta ${attr}="${key}" content="${esc(value)}">`;
    const keyRe = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`<meta[^>]*\\b${attr}=["']${keyRe}["'][^>]*>`, "i");
    if (re.test(html)) return html.replace(re, tag);
    return html.replace("</head>", `  ${tag}\n</head>`);
  };

  return {
    name: "inject-seo-from-data",
    transformIndexHtml(html) {
      let out = html;
      out = out.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${esc(title)}</title>`);
      if (description) out = setMeta(out, "name", "description", description);
      if (keywords) out = setMeta(out, "name", "keywords", keywords);
      if (siteName) out = setMeta(out, "property", "og:site_name", siteName);
      if (title) {
        out = setMeta(out, "property", "og:title", title);
        out = setMeta(out, "name", "twitter:title", title);
      }
      if (description) {
        out = setMeta(out, "property", "og:description", description);
        out = setMeta(out, "name", "twitter:description", description);
      }
      if (ogImage) {
        out = setMeta(out, "property", "og:image", ogImage);
        out = setMeta(out, "name", "twitter:image", ogImage);
      }
      out = out.replace(/<link[^>]*rel=["']icon["'][^>]*>/i, () => {
        const full = favicon.startsWith("http") ? favicon : "./" + favicon.replace(/^\.?\//, "");
        return `<link rel="icon" href="${esc(full)}">`;
      });
      return out;
    },
  };
}

// base 设为 "./"，保证部署到 GitHub Pages 子路径（/repo/）时资源路径正确
export default defineConfig({
  base: "./",
  plugins: [injectSeoPlugin()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
