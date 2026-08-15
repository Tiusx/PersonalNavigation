// ========== 背景应用（浅色 / 深色感知） ==========
import { state } from "./state.js";
import { currentMode, DARK_BACKGROUND } from "./theme.js";

export function applyBackground() {
  const bg = state.data?.background;
  if (!bg) return;
  const body = document.body;
  const dark = currentMode() === "dark";

  if (bg.type === "image" && bg.image) {
    body.style.backgroundImage = `url("${bg.image}")`;
    body.style.backgroundColor = dark ? DARK_BACKGROUND : "";
  } else {
    body.style.backgroundImage = "";
    body.style.backgroundColor = dark ? DARK_BACKGROUND : bg.color || "#f6f8fb";
  }
  document.documentElement.style.setProperty(
    "--bg-overlay",
    bg.overlay || "rgba(255, 255, 255, 0)"
  );
}
