import { defineConfig } from "vite";

// base 设为 "./"，保证部署到 GitHub Pages 子路径（/repo/）时资源路径正确
export default defineConfig({
  base: "./",
  plugins: [],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
