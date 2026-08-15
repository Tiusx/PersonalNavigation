/**
 * ============================================================
 *  站点配置文件
 * ============================================================
 *  部署到 GitHub Pages 时，可通过 GitHub Actions 将仓库
 *  Secrets 中的 ADMIN_PASSWORD 注入到此文件（替换下方占位值）。
 *  本地使用时直接修改下方 adminPassword 即可。
 * ============================================================
 */

export const config = {
  // ---------- 管理员登录密钥 ----------
  // 本地使用修改此默认值；部署时可通过环境变量 VITE_ADMIN_PASSWORD 注入覆盖
  // （GitHub Actions Secrets / Cloudflare Pages 环境变量）
  adminPassword: import.meta.env.VITE_ADMIN_PASSWORD || "admin123",

  // ---------- 站点基础信息 ----------
  site: {
    name: "快捷导航",
    logo: "", // 留空则显示首字 Logo 标记，可填图片 URL
    avatar: "", // 主页头像图片 URL（留空不显示头像）
    tabTitle: "", // 浏览器标签页标题（留空则使用站点名称）
    favicon: "", // 浏览器标签页图标 URL（留空则使用默认 ./favicon.svg）
    description: "极简 · 高效 · 你的上网起始页",
    footer: {
      enabled: true,
      text: "Personal Navigation © 2026 · Powered by Vite",
    },
  },

  // ---------- 主题配色（可通过环境设置修改） ----------
  theme: {
    mode: "system", // 主题模式："system" 跟随系统 | "light" 浅色 | "dark" 深色
    accent: "#4f46e5", // 主色
    text: "#111827", // 主要文字
    textSecondary: "#6b7280", // 次要文字
    surface: "#ffffff", // 卡片 / 输入框底色
    surfaceHover: "#f1f5f9", // 悬停底色
    border: "#e5e7eb", // 边框色
    radius: "10px", // 基础圆角
  },

  // ---------- 深色模式配色（主色 / 圆角与浅色共用） ----------
  themeDark: {
    text: "#e2e8f0", // 主要文字
    textSecondary: "#94a3b8", // 次要文字
    surface: "#1e293b", // 卡片 / 输入框底色
    surfaceHover: "#2d3c55", // 悬停底色
    border: "#334155", // 边框色
  },

  // ---------- SEO 优化 ----------
  seo: {
    keywords: "个人导航,快捷导航,上网起始页,网址导航,书签管理",
    description: "", // 留空则使用 site.description
    ogImage: "", // 分享到社交平台时的封面图 URL
  },

  // ---------- 背景设置 ----------
  background: {
    type: "color", // "color" | "image"
    color: "#f6f8fb", // 纯色背景
    image: "", // 图片背景 URL（type 为 image 时生效）
    overlay: "rgba(255, 255, 255, 0)", // 背景蒙层颜色（图片背景时用于提升文字可读性）
  },

  // ---------- 搜索引擎列表 ----------
  searchEngines: [
    { id: "baidu",     name: "百度",       icon: "🔍", url: "https://www.baidu.com/s?wd=" },
    { id: "google",    name: "Google",     icon: "🌐", url: "https://www.google.com/search?q=" },
    { id: "bing",      name: "Bing",       icon: "🅱️", url: "https://www.bing.com/search?q=" },
    { id: "sogou",     name: "搜狗",       icon: "🐶", url: "https://www.sogou.com/web?query=" },
    { id: "so360",     name: "360搜索",    icon: "🛡️", url: "https://www.so.com/s?q=" },
    { id: "duck",      name: "DuckDuckGo", icon: "🦆", url: "https://duckduckgo.com/?q=" },
    { id: "brave",     name: "Brave",      icon: "🦁", url: "https://search.brave.com/search?q=" },
    { id: "zhihu",     name: "知乎",       icon: "💡", url: "https://www.zhihu.com/search?q=" },
    { id: "github",    name: "GitHub",     icon: "🐙", url: "https://github.com/search?q=" },
    { id: "perplexity",name: "Perplexity", icon: "✨", url: "https://www.perplexity.ai/search?q=" },
  ],

  // ---------- 默认搜索引擎 ID ----------
  defaultEngine: "baidu",

  // ---------- 默认导航分类与站点 ----------
  defaultCategories: [
    {
      id: "common",
      name: "常用",
      icon: "⭐",
      sites: [
        { name: "百度",       url: "https://www.baidu.com",        icon: "🔍", desc: "中文搜索引擎" },
        { name: "Google",     url: "https://www.google.com",       icon: "🌐", desc: "全球搜索引擎" },
        { name: "GitHub",     url: "https://github.com",           icon: "🐙", desc: "代码托管平台" },
        { name: "B站",        url: "https://www.bilibili.com",     icon: "📺", desc: "弹幕视频" },
        { name: "知乎",       url: "https://www.zhihu.com",        icon: "💡", desc: "问答社区" },
        { name: "微博",       url: "https://weibo.com",            icon: "📱", desc: "社交媒体" },
        { name: "豆瓣",       url: "https://www.douban.com",       icon: "🎬", desc: "电影书籍评分" },
        { name: "网易云音乐", url: "https://music.163.com",        icon: "🎵", desc: "音乐平台" },
      ],
    },
    {
      id: "ai",
      name: "AI 工具",
      icon: "🤖",
      sites: [
        { name: "ChatGPT",    url: "https://chatgpt.com",          icon: "🤖", desc: "OpenAI 对话助手" },
        { name: "Claude",     url: "https://claude.ai",            icon: "🧠", desc: "Anthropic 对话助手" },
        { name: "Gemini",     url: "https://gemini.google.com",    icon: "✨", desc: "Google AI 助手" },
        { name: "DeepSeek",   url: "https://chat.deepseek.com",    icon: "🌊", desc: "国产开源大模型" },
        { name: "Kimi",       url: "https://kimi.moonshot.cn",     icon: "📄", desc: "长文本阅读助手" },
        { name: "豆包",       url: "https://www.doubao.com",       icon: "🥥", desc: "字节 AI 助手" },
        { name: "通义千问",   url: "https://tongyi.aliyun.com",    icon: "🌙", desc: "阿里 AI 助手" },
        { name: "文心一言",   url: "https://yiyan.baidu.com",      icon: "💬", desc: "百度 AI 助手" },
      ],
    },
    {
      id: "dev",
      name: "开发",
      icon: "⚙️",
      sites: [
        { name: "GitHub",          url: "https://github.com",           icon: "🐙", desc: "代码托管" },
        { name: "Gitee",           url: "https://gitee.com",            icon: "📦", desc: "国内代码托管" },
        { name: "Stack Overflow",  url: "https://stackoverflow.com",    icon: "💻", desc: "技术问答" },
        { name: "MDN",             url: "https://developer.mozilla.org",icon: "📘", desc: "Web 开发文档" },
        { name: "npm",             url: "https://www.npmjs.com",        icon: "📦", desc: "包管理" },
        { name: "CodePen",         url: "https://codepen.io",           icon: "✏️", desc: "前端在线编辑" },
        { name: "Can I use",       url: "https://caniuse.com",          icon: "✅", desc: "浏览器兼容性" },
        { name: "Regex101",        url: "https://regex101.com",         icon: "🔤", desc: "正则测试" },
        { name: "掘金",            url: "https://juejin.cn",            icon: "⛏️", desc: "技术社区" },
        { name: "菜鸟教程",        url: "https://www.runoob.com",       icon: "📗", desc: "编程入门教程" },
      ],
    },
    {
      id: "learn",
      name: "学习",
      icon: "📚",
      sites: [
        { name: "慕课网",       url: "https://www.imooc.com",        icon: "🎓", desc: "IT 技能学习" },
        { name: "中国大学MOOC", url: "https://www.icourse163.org",   icon: "🏛️", desc: "大学公开课" },
        { name: "Coursera",     url: "https://www.coursera.org",     icon: "📖", desc: "海外在线课程" },
        { name: "极客时间",     url: "https://time.geekbang.org",    icon: "⏰", desc: "技术专栏课程" },
        { name: "LeetCode",     url: "https://leetcode.cn",          icon: "🧩", desc: "算法刷题" },
        { name: "牛客",         url: "https://www.nowcoder.com",     icon: "🐮", desc: "面试求职" },
        { name: "W3Schools",    url: "https://www.w3schools.com",    icon: "🌐", desc: "Web 教程" },
        { name: "MDN",          url: "https://developer.mozilla.org",icon: "📘", desc: "开发文档" },
      ],
    },
    {
      id: "video",
      name: "娱乐",
      icon: "🎬",
      sites: [
        { name: "B站",        url: "https://www.bilibili.com",   icon: "📺", desc: "哔哩哔哩" },
        { name: "YouTube",    url: "https://www.youtube.com",    icon: "▶️", desc: "视频平台" },
        { name: "爱奇艺",     url: "https://www.iqiyi.com",      icon: "🎞️", desc: "在线视频" },
        { name: "腾讯视频",   url: "https://v.qq.com",           icon: "🎥", desc: "在线视频" },
        { name: "优酷",       url: "https://www.youku.com",      icon: "📹", desc: "在线视频" },
        { name: "芒果TV",     url: "https://www.mgtv.com",       icon: "🥭", desc: "在线视频" },
        { name: "抖音",       url: "https://www.douyin.com",     icon: "🎵", desc: "短视频" },
        { name: "网易云音乐", url: "https://music.163.com",      icon: "🎵", desc: "音乐平台" },
      ],
    },
    {
      id: "shop",
      name: "购物",
      icon: "🛒",
      sites: [
        { name: "淘宝",       url: "https://www.taobao.com",      icon: "🛍️", desc: "淘宝网" },
        { name: "京东",       url: "https://www.jd.com",          icon: "📦", desc: "京东商城" },
        { name: "天猫",       url: "https://www.tmall.com",       icon: "🐱", desc: "天猫商城" },
        { name: "拼多多",     url: "https://www.pinduoduo.com",   icon: "🍊", desc: "拼多多" },
        { name: "苏宁易购",   url: "https://www.suning.com",      icon: "🏪", desc: "苏宁易购" },
        { name: "Amazon",     url: "https://www.amazon.com",      icon: "📦", desc: "亚马逊" },
        { name: "闲鱼",       url: "https://www.goofish.com",     icon: "🐟", desc: "二手交易" },
      ],
    },
    {
      id: "news",
      name: "资讯",
      icon: "📰",
      sites: [
        { name: "新浪新闻",   url: "https://news.sina.com.cn",    icon: "📰", desc: "新浪新闻" },
        { name: "网易新闻",   url: "https://news.163.com",        icon: "📧", desc: "网易新闻" },
        { name: "腾讯新闻",   url: "https://news.qq.com",         icon: "🐧", desc: "腾讯新闻" },
        { name: "凤凰网",     url: "https://www.ifeng.com",       icon: "🔥", desc: "凤凰资讯" },
        { name: "澎湃新闻",   url: "https://www.thepaper.cn",     icon: "🌊", desc: "澎湃新闻" },
        { name: "36氪",       url: "https://36kr.com",            icon: "💹", desc: "科技创投" },
        { name: "虎嗅",       url: "https://www.huxiu.com",       icon: "🐯", desc: "商业资讯" },
        { name: "少数派",     url: "https://sspai.com",           icon: "🍎", desc: "效率科技" },
      ],
    },
  ],
};
