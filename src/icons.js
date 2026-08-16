// ========== SVG 品牌图标库 ==========
// 图标来源（MIT/Apache 等开源许可，已打包进项目，离线可用）：
//  - SuperTinyIcons：https://github.com/edent/SuperTinyIcons （294 个超小品牌图标）
//  - thesvg：https://github.com/GLINCKER/thesvg （品牌 SVG 图标集合）
// 图标 key 格式：st:{name}（SuperTinyIcons）/ svg:{name}（thesvg）
import { escapeHtml, isImageUrl } from "./utils/dom.js";

const superTinyRaw = import.meta.glob("./icons/supertiny/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const theSvgRaw = import.meta.glob("./icons/thesvg/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** 清理 SVG：去掉 XML 声明、DOCTYPE、注释，便于内联进 HTML */
function cleanSvg(raw) {
  return String(raw || "")
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
}

/**
 * 把图标内 <style> 的规则内联到对应元素上再移除 <style>。
 * 原因：内联 SVG 里的 <style> 作用于整个页面（非 scoped），
 * 类规则会跨图标串色，且 `svg{background:...}`（如 Snapchat 的 #FFFC00）会把所有 svg 染黄。
 * 支持类选择器规则（.cls-1{fill:#fff}）；根元素 `svg{...}` 规则只作用于该图标自身。
 * 解析失败时原样返回（安全降级）。
 */
function inlineStyles(svg) {
  if (!/<style/i.test(svg)) return svg;
  let doc;
  try {
    doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  } catch (e) {
    return svg;
  }
  const styles = [...doc.querySelectorAll("style")];
  if (!styles.length) return svg;

  const declsOf = (decl) => {
    const map = new Map();
    String(decl || "").split(";").forEach((d) => {
      const i = d.indexOf(":");
      if (i > 0) map.set(d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim());
    });
    return map;
  };

  for (const st of styles) {
    const css = String(st.textContent || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<!\[CDATA\[|\]\]>/g, "");
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const decl = m[2].trim();
      if (!decl) continue;
      for (const sel of m[1].split(",")) {
        const part = sel.trim();
        const cls = part.match(/^\.([\w-]+)$/);
        if (cls) {
          for (const el of doc.querySelectorAll("." + cls[1])) {
            const style = declsOf(el.getAttribute("style"));
            for (const [k, v] of declsOf(decl)) if (!style.has(k)) style.set(k, v);
            el.setAttribute("style", [...style].map(([k, v]) => `${k}:${v}`).join(";"));
          }
        } else if (/^svg\s*$/i.test(part)) {
          const root = doc.documentElement;
          const style = declsOf(root.getAttribute("style"));
          for (const [k, v] of declsOf(decl)) if (!style.has(k)) style.set(k, v);
          root.setAttribute("style", [...style].map(([k, v]) => `${k}:${v}`).join(";"));
        }
      }
    }
  }
  for (const st of styles) st.remove();
  return new XMLSerializer().serializeToString(doc);
}

/** 常见单色灰阶颜色名 → rgb */
const NAMED_ACHROMATIC = {
  black: [0, 0, 0],
  white: [255, 255, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  silver: [192, 192, 192],
  darkgray: [85, 85, 85],
  darkgrey: [85, 85, 85],
  dimgray: [105, 105, 105],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  gainsboro: [220, 220, 220],
  darkslategray: [47, 79, 79],
  darkslategrey: [47, 79, 79],
};

/** 解析颜色为 [r,g,b]，无法解析（品牌彩色/渐变等）返回 null */
function parseColor(c) {
  const v = String(c || "").trim().toLowerCase();
  if (!v) return null;
  let m = v.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    const h = m[1].length === 3 || m[1].length === 4 ? m[1].slice(0, 3).split("").map((x) => x + x).join("") : m[1].slice(0, 6);
    const n = parseInt(h, 16);
    if (!Number.isNaN(n)) return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return null;
  }
  m = v.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  if (NAMED_ACHROMATIC[v]) return [...NAMED_ACHROMATIC[v]];
  return null;
}

/** 是否无彩色（灰阶）：R/G/B 接近相等 */
function isAchromatic(rgb) {
  const mx = Math.max(rgb[0], rgb[1], rgb[2]);
  const mn = Math.min(rgb[0], rgb[1], rgb[2]);
  return mx - mn < 28;
}

/** 颜色亮度（0~1） */
function luminance(rgb) {
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

/**
 * 归一化图标颜色，解决部分图标深浅主题不可见的问题：
 * - 没有任何颜色（缺省 fill，默认渲染纯黑）→ 根元素补 fill="currentColor"，跟随主题文字色
 * - 纯黑 / 纯白（单色灰阶）图标 → 全部替换为 currentColor
 * - 品牌彩色图标（如多彩渐变、单品牌色）→ 保留原色
 */
function normalizeSvg(svg) {
  const colors = [];
  svg.replace(/fill="([^"]*)"/g, (_, v) => colors.push(v.trim().toLowerCase()));
  svg.replace(/fill:([^;"']+)/g, (_, v) => colors.push(v.trim().toLowerCase()));
  svg.replace(/stop-color="([^"]*)"/g, (_, v) => colors.push(v.trim().toLowerCase()));
  svg.replace(/stop-color:([^;"']+)/g, (_, v) => colors.push(v.trim().toLowerCase()));

  const real = colors.filter((c) => c && c !== "none" && c !== "currentcolor" && !c.startsWith("url("));
  if (!real.length) {
    // 无任何颜色 → 根 svg 补 fill="currentColor"
    return svg.replace(/^<svg(\s|>)/, '<svg fill="currentColor"$1');
  }
  // 仅当所有颜色都是灰阶（黑/白/灰）时才按单色处理，避免误伤品牌彩色
  const rgbs = real.map(parseColor);
  const allAchromatic = rgbs.every((c) => c && isAchromatic(c));
  if (!allAchromatic) return svg;

  const lums = rgbs.map(luminance);
  const allDark = lums.every((l) => l < 0.3);
  const allLight = lums.every((l) => l > 0.75);
  if (!allDark && !allLight) return svg; // 黑白混合（如 Vercel 白底黑三角）保留

  // 纯黑 / 纯白单色图标 → 全部改为 currentColor（跟随主题色）
  let out = svg
    .replace(/fill="([^"]*)"/g, 'fill="currentColor"')
    .replace(/fill:([^;"']+)/g, "fill:currentColor")
    .replace(/stop-color="([^"]*)"/g, 'stop-color="currentColor"')
    .replace(/stop-color:([^;"']+)/g, "stop-color:currentColor");
  if (!/<svg[^>]*\bfill=/i.test(out)) {
    out = out.replace(/^<svg(\s|>)/, '<svg fill="currentColor"$1');
  }
  return out;
}

const buildList = (rawMap, prefix) =>
  Object.entries(rawMap)
    .map(([path, svg]) => {
      const name = path.slice(path.lastIndexOf("/") + 1, -4);
      return { key: prefix + name, name, svg: normalizeSvg(inlineStyles(cleanSvg(svg))) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

/** SuperTinyIcons 图标（key: st:xxx） */
export const superTinyIcons = buildList(superTinyRaw, "st:");
/** thesvg 图标（key: svg:xxx） */
export const theSvgIcons = buildList(theSvgRaw, "svg:");
/** 全部图标 */
export const allSvgIcons = [...superTinyIcons, ...theSvgIcons];
const iconMap = new Map(allSvgIcons.map((i) => [i.key, i]));

export const DEFAULT_SVG_ICON = "st:github";

/**
 * 搜索图标
 * @param {string} query
 * @param {"st"|"svg"|"all"} source
 */
export function searchSvgIcons(query = "", source = "all") {
  const q = query.trim().toLowerCase();
  const list = source === "st" ? superTinyIcons : source === "svg" ? theSvgIcons : allSvgIcons;
  return list.filter((i) => !q || i.name.toLowerCase().includes(q));
}

/** 通过 key 获取图标 */
export function getSvgIcon(key) {
  return iconMap.get(key) || null;
}

/**
 * 根据网址域名匹配品牌图标 key（如 github.com → st:github），匹配不到返回空
 * @param {string} host 如 "www.github.com"
 */
export function findIconForHost(host = "") {
  const h = String(host || "").toLowerCase().replace(/^www\./, "").split(".")[0];
  if (!h) return "";
  const lower = h.replace(/[^a-z0-9]/g, "");
  const hit = allSvgIcons.find((i) => {
    const n = i.name.replace(/[^a-z0-9]/g, "").toLowerCase();
    if (!n) return false;
    return n === lower || (lower.length > 2 && n.includes(lower)) || (n.length > 2 && lower.includes(n));
  });
  return hit ? hit.key : "";
}

/**
 * 根据站点的 iconType / icon 生成图标 HTML
 * - svg / library：匹配新图标库内联 SVG；匹配不到回退首字
 * - image / 图片 URL：<img>
 * - 其余（旧 emoji / 空）：emoji 直接显示，否则站点名首字
 */
export function iconHtmlFor(site = {}) {
  const icon = site.icon || "";
  const type = site.iconType || (isImageUrl(icon) ? "image" : "library");
  if (type === "image" || isImageUrl(icon)) {
    return `<img src="${escapeHtml(icon)}" alt="" loading="lazy">`;
  }
  if (type === "svg" || type === "library") {
    const found = iconMap.get(icon);
    if (found) return found.svg;
  }
  if (icon && /^[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u.test(icon)) {
    return escapeHtml(icon);
  }
  const name = site.name || "";
  return `<span class="icon-letter">${escapeHtml((name || "?")[0])}</span>`;
}
