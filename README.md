# 🧭 个人导航站 (Personal Navigation)

一个**极简清新**的个人上网导航起始页：多搜索引擎、分类站点导航、登录后在线管理。基于**原生 JS + Vite** 构建，零运行时依赖，支持 GitHub Pages / **Cloudflare Pages / Vercel 一键部署**。

![Vite](https://img.shields.io/badge/Vite-build-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 功能

- 🔍 **多搜索引擎**：内置百度、Google、Bing、搜狗、360、DuckDuckGo、Brave、知乎、GitHub、Perplexity 等，一键切换并记住选择；快捷键 `/` 或 `Ctrl/⌘+K` 聚焦搜索
- 🏷️ **分类导航**：常用 / AI 工具 / 开发 / 学习 / 娱乐 / 购物 / 资讯，站点卡片式展示
- 🎨 **图标灵活**：站点图标支持 **Emoji**、**Remix Icon 图标库**（国产开源、可视化选择 + 搜索）、**图片 URL** 三种来源
- ✏️ **在线管理**：登录后添加 / 编辑 / 删除站点，管理分类，实时生效
- ⚙️ **站点设置**：站点名称、Logo、副标题、纯色 / 图片背景、**SEO 优化配置**、数据导出导入备份
- 🔍 **SEO 友好**：自动同步页面标题、关键词、描述与社交平台分享预览（OG 标签）
- 📱 **响应式**：桌面 / 平板 / 手机自适应

---

## 🚀 快速开始

需要 **Node.js 20+**。

```bash
npm install     # 安装依赖
npm run dev     # 本地开发（http://localhost:5173）
npm run build   # 构建到 dist/
npm run preview # 预览构建产物
```

> 默认管理密钥 `admin123`，本地使用请修改 `src/config.js` 中的 `adminPassword`。

---

## 📦 部署

### 方式一：Cloudflare Pages 一键部署（推荐）

1. 将项目推送到一个 **GitHub 公开仓库**
2. 点击下方按钮，登录 Cloudflare 后按提示导入仓库：

   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Tiusx/PersonalNavigation)

3. 构建配置（一般会自动识别，若未识别则手动填写）：
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`

**注入管理密钥（可选）**：在 Cloudflare Pages 项目 `Settings → Environment variables` 添加 `VITE_ADMIN_PASSWORD` 为你想要的密钥，重新部署后生效。

### 方式二：Vercel 一键部署

1. 将项目推送到 GitHub / GitLab / Bitbucket 仓库
2. 点击下方按钮，选择仓库并导入：

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Tiusx/PersonalNavigation)

3. Vercel 会自动识别 Vite 框架，无需额外配置
4. 若需自定义构建：`Settings → Build` 中确认 **Build Command** 为 `npm run build`、**Output Directory** 为 `dist`

**注入管理密钥（可选）**：在 Vercel 项目 `Settings → Environment Variables` 添加 `VITE_ADMIN_PASSWORD`，重新部署后生效。

### 方式三：GitHub Pages 自动部署

1. 推送代码到 `main` 分支
2. 仓库 `Settings → Secrets and variables → Actions` 新建 Secret：`ADMIN_PASSWORD`（可选）
3. 仓库 `Settings → Pages`，Source 选择 `GitHub Actions`
4. 推代码自动触发部署，访问 `https://<用户名>.github.io/<仓库名>/`

--- 

## ⚙️ 配置说明

所有配置集中在 [`src/config.js`](src/config.js)：

- `adminPassword`：管理密钥，可用环境变量 `VITE_ADMIN_PASSWORD` 覆盖
- `site`：站点名称 / Logo / 副标题
- `seo`：SEO 关键词 / 描述 / 分享封面图（也可在「设置 → SEO 优化」中在线修改）
- `background`：背景类型（纯色 / 图片）、颜色、蒙层
- `searchEngines`：搜索引擎列表（`url` 末尾为关键词拼接处）
- `defaultCategories`：默认分类与站点数据

数据保存在浏览器 `localStorage`，登录状态保存在 `sessionStorage`（关闭标签页失效）。建议定期在「设置 → 数据」中导出 JSON 备份。

### 🔄 GitHub 仓库同步（数据打包进项目，多端共享）

三个平台（GitHub Pages / Vercel / Cloudflare Pages）部署的是**独立页面，数据互不相通**。内置 **GitHub 仓库同步**（纯前端，无服务器）：把数据上传到你仓库的构建数据文件 `src/builtin-data.json`，触发重新部署后，**所有访客（包括新访客）都能看到这份最新数据**，其他设备也可拉取同一份数据：

1. 在 GitHub 生成一个 Token：`Settings → Developer settings → Personal access tokens → Tokens (classic)`，勾选 **`repo`** 权限（或 Fine-grained token，勾选仓库 Contents 读 + 写）
2. 打开任一已部署页面的「设置 → 数据 → GitHub 仓库同步」：
   - 填写 Token、仓库（`owner/repo`），数据文件路径默认 `src/builtin-data.json`
   - 点击「验证并保存」
3. **修改完数据后**，回到「设置 → 数据」，点击「⬆️ 同步到 GitHub」手动上传最新数据到仓库
4. 仓库收到更新后，部署平台（配置了 push 自动部署）会自动重新构建部署——**新访客打开即可看到你最新设置的数据**
5. 换设备 / 恢复时，点「⬇️ 从 GitHub 拉取」拉取仓库里的数据

> 数据改动**不会自动上传**，需手动点击「同步到 GitHub」；Token 仅保存在**各设备浏览器的 localStorage**，不会写入代码或仓库。

### 🌍 分享只读站点（访客查看你的数据，无需登录）

数据默认只在**你自己的浏览器**可见。若想把你的导航分享出去、让任何人打开都能看到你的数据（但无法修改）：

1. 在设置里配置好你的导航数据
2. **方式 A（推荐）**：在「设置 → 数据」点击「⬆️ 同步到 GitHub」，把数据上传到仓库的 `src/builtin-data.json`；重新部署后访客即可看到最新数据（数据内置进页面，**零网络请求、无访问限制**）
3. **方式 B（手动打包）**：点击「📦 生成内置数据文件」，下载 `builtin-data.json`，用它**替换**项目中的 `src/builtin-data.json`，重新部署

之后任何访客打开你的站点都会直接看到这些数据——数据已内置在页面里，**不需要任何网络请求，也不受 GitHub 匿名限流影响**。访客无法修改（修改需密码登录，且无你的 Token 无法写入仓库）。

> ⚠️ 安全提示：Token 仅保存在**各设备浏览器的 localStorage**，不会写入代码或仓库；请为 Token 开启过期时间并仅授予所需权限。若某设备不再使用，可在「设置 → 数据 → 解除绑定」。

---

## 📄 License

MIT License - 可自由使用、修改和分发。
