// ========== 颜色工具 ==========

/** "#4f46e5" / "4f46e5" / "rgb(79,70,229)" → { r, g, b } */
export function hexToRgb(hex) {
  let h = String(hex || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) {
    h = h.replace(/(.)/g, "$1$1");
  }
  if (!/^[0-9a-f]{6}$/i.test(h)) return { r: 79, g: 70, b: 229 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHex(n) {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
}

/** 与目标色按比例混合（ratio=0 保持原色，1 变为目标色） */
export function mix(hex, targetHex, ratio) {
  const a = hexToRgb(hex);
  const b = hexToRgb(targetHex);
  return `#${toHex(a.r + (b.r - a.r) * ratio)}${toHex(a.g + (b.g - a.g) * ratio)}${toHex(a.b + (b.b - a.b) * ratio)}`;
}

/** 变深 */
export function darken(hex, amt = 0.15) {
  return mix(hex, "#000000", amt);
}

/** 变浅 */
export function lighten(hex, amt = 0.2) {
  return mix(hex, "#ffffff", amt);
}

/** 生成带透明度的 rgba 字符串 */
export function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
