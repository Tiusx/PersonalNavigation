// 综合功能验证：图标渲染 / 自动解析 / 添加分类弹窗 / 拖拽排序 / 手机端
import { spawn } from "node:child_process";

// Node 22+ 提供全局 WebSocket（CDP over WS）

const preview = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--port", "4173", "--strictPort"], {
  cwd: "J:/ai/personal-nav",
  stdio: "ignore",
});

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const edge = spawn(
  edgePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-background-networking",
    "--remote-debugging-port=9223",
    "http://localhost:4173/",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function ok(name, cond, extra = "") {
  results.push({ name, pass: !!cond });
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  [" + extra + "]" : ""}`);
}

async function main() {
  await sleep(2500);
  console.log("连接 CDP...");

  let tabs;
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch("http://127.0.0.1:9223/json/list");
      const list = await res.json();
      const page = list.find((p) => p.type === "page");
      if (page) {
        tabs = await new Promise((resolve, reject) => {
          const ws = new WebSocket(page.webSocketDebuggerUrl);
          ws.onopen = () => resolve(ws);
          ws.onerror = () => reject(new Error("ws error"));
        });
        break;
      }
    } catch (e) {}
    await sleep(500);
  }
  if (!tabs) throw new Error("无法连接 CDP");

  let msgId = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(method + " 响应超时"));
      }, 10000);
      pending.set(id, {
        resolve: (v) => {
          clearTimeout(timer);
          resolve(v);
        },
        reject: (e) => {
          clearTimeout(timer);
          reject(e);
        },
      });
      tabs.send(JSON.stringify({ id, method, params }));
    });

  const js = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error("JS: " + JSON.stringify(r.exceptionDetails.exception?.description || r.exceptionDetails));
    return r.result.value;
  };
  const waitFor = async (expr, timeout = 6000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (await js(expr)) return true;
      await sleep(200);
    }
    return false;
  };
  const click = (sel) => js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.click(); return true; })()`);
  const type = (sel, val) =>
    js(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return false; el.focus(); el.value = ${JSON.stringify(val)}; el.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
  const topModal = `[...document.querySelectorAll('.modal-overlay.show')].pop()`;
  const topConfirm = () => js(`(() => { const m = ${topModal}; if (!m) return false; m.querySelector('[data-action="confirm"]').click(); return true; })()`);
  const topClose = () => js(`(() => { const m = ${topModal}; if (!m) return false; m.querySelector('[data-action="close"]').click(); return true; })()`);

  // 合并事件处理：CDP 响应 + 自动接受弹窗 + 拦截 google favicon（CORS）
  tabs.binaryType = "arraybuffer";
  tabs.onmessage = (ev) => {
    let text;
    if (typeof ev.data === "string") text = ev.data;
    else text = Buffer.from(ev.data).toString();
    const m = JSON.parse(text);
    if (m.id && pending.has(m.id)) {
      const p = pending.get(m.id);
      pending.delete(m.id);
      if (m.error) p.reject(new Error(m.method + ": " + JSON.stringify(m.error)));
      else p.resolve(m.result);
      return;
    }
    if (m.method === "Page.javascriptDialogOpening") {
      send("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
    }
    if (m.method === "Fetch.requestPaused") {
      const { requestId } = m.params;
      const cors = [
        { name: "Access-Control-Allow-Origin", value: "*" },
        { name: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        { name: "Access-Control-Allow-Headers", value: "*" },
      ];
      const body = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#ccc"/></svg>').toString("base64");
      send("Fetch.fulfillRequest", {
        requestId,
        responseCode: 200,
        responseHeaders: [...cors, { name: "Content-Type", value: "image/svg+xml" }],
        body,
      }).catch(() => {});
    }
  };

  await send("Page.enable");
  await send("Fetch.enable", {
    patterns: [{ urlPattern: "*favicons*", requestStage: "Request" }, { urlPattern: "*bing.com/favicon.ico*", requestStage: "Request" }],
  });

  // 捕获页面错误
  await js(`window.__errs = []; window.addEventListener('error', (e) => window.__errs.push(e.message)); window.addEventListener('unhandledrejection', (e) => window.__errs.push('unhandled: ' + ((e.reason && e.reason.message) || e.reason))); 'ok'`);

  ok("页面渲染出分类标签", await waitFor(`document.querySelectorAll('#categoryTabs .category-tab').length > 0`, 10000));
  ok("分类标签有图标（SVG/图片/首字）", await js(`document.querySelectorAll('#categoryTabs .tab-icon svg, #categoryTabs .tab-icon img, #categoryTabs .tab-icon .icon-letter').length > 0`));

  // 登录
  await click('[data-action="settings"]');
  ok("登录弹窗出现", await waitFor(`document.querySelector('.modal-overlay.show #loginPassword') !== null`));
  await sleep(150);
  await type("#loginPassword", "admin123");
  const clickInfo = await js(`(() => {
    const m = [...document.querySelectorAll('.modal-overlay.show')].pop();
    const btn = m && m.querySelector('[data-action="confirm"]');
    if (btn) btn.click();
    return { hasModal: !!m, hasBtn: !!btn };
  })()`);
  ok("登录确认已点击", clickInfo.hasModal && clickInfo.hasBtn);
  ok("登录成功", await waitFor(`document.querySelector('.modal-overlay.show .settings-tabs') !== null`, 4000));

  // 添加分类（DOM 弹窗）
  await click(`.settings-tab[data-panel="category"]`);
  await waitFor(`document.querySelector('#categoryList') !== null`);
  await click("#addCategoryBtn");
  ok("添加分类弹窗出现（含名称/图标表单）", await waitFor(`document.querySelector('.modal-overlay.show #newCatName') !== null && document.querySelector('.modal-overlay.show #newCatIcon') !== null`));
  ok("添加分类弹窗为 DOM 弹窗而非 prompt", await js(`!!document.querySelector('.modal-overlay.show')`));
  await sleep(150);
  await type("#newCatName", "测试分类");
  await topConfirm();
  ok("分类已添加并渲染", await waitFor(`[...document.querySelectorAll('#categoryList .cat-row .cat-name-input')].some(i => i.value === '测试分类')`));
  const catTabOk = await js(`[...document.querySelectorAll('#categoryTabs .category-tab')].some(b => b.textContent.includes('测试分类'))`);
  ok("首页出现新分类 tab", catTabOk);
  await topClose(); // 关闭设置

  // 切换新分类，添加站点（自动解析）
  await js(`(() => { const t = [...document.querySelectorAll('#categoryTabs .category-tab')].find(b => b.textContent.includes('测试分类')); if (t) t.click(); return !!t; })()`);
  await sleep(400);
  await waitFor(`document.querySelector('#addSiteBtn') !== null`);
  await click("#addSiteBtn");
  ok("添加站点弹窗出现", await waitFor(`document.querySelector('.modal-overlay.show #editUrl') !== null`));
  await sleep(150);
  await type("#editUrl", "https://github.com");
  await click("#resolveBtn");
  const resolvedName = await js(`(() => { const m = [...document.querySelectorAll('.modal-overlay.show')].pop(); return m ? (m.querySelector('#editName') || {}).value : ''; })()`);
  ok("自动解析填入名称（域名美化，快路径即时）", String(resolvedName).toLowerCase() === "github", resolvedName);
  ok("自动解析填入 favicon 图片（快路径，无需本地图标匹配）", await js(`(() => { const m = [...document.querySelectorAll('.modal-overlay.show')].pop(); return !!m && !!m.querySelector('#iconPreview img'); })()`));
  const previewSrc = await js(`(() => { const m = [...document.querySelectorAll('.modal-overlay.show')].pop(); const img = m && m.querySelector('#iconPreview img'); return img ? img.src : ''; })()`);
  ok("图标预览为 Bing favicon 兜底", previewSrc.includes("bing.com/favicon"), previewSrc);
  await topConfirm(); // 保存站点
  ok("站点添加成功", await waitFor(`[...document.querySelectorAll('.site-card')].some(c => c.textContent.toLowerCase().includes('github'))`, 5000));

  // 无本地品牌图标 → favicon 图片兜底
  await sleep(400);
  await click("#addSiteBtn");
  ok("第二次添加站点弹窗出现", await waitFor(`document.querySelector('.modal-overlay.show #editUrl') !== null`, 6000));
  await sleep(150);
  await type("#editUrl", "https://example.org");
  await click("#resolveBtn");
  await sleep(200);
  const r2 = await js(`(() => {
    const m = [...document.querySelectorAll('.modal-overlay.show')].pop();
    return {
      name: m && m.querySelector('#editName') ? m.querySelector('#editName').value : null,
      previewHtml: m && m.querySelector('#iconPreview') ? m.querySelector('#iconPreview').innerHTML : null,
    };
  })()`);
  ok("无本地图标时填入域名名称", String(r2.name).toLowerCase().startsWith("example"), JSON.stringify(r2));
  ok("无本地图标时使用 Favicon 图片兜底", !!r2.previewHtml && r2.previewHtml.includes("<img"), JSON.stringify(r2));
  await topClose(); // 取消

  // 分类管理（设置页已移除拖拽手柄，改为行内编辑 + 自定义删除确认）
  await click('[data-action="settings"]');
  await waitFor(`document.querySelector('.modal-overlay.show .settings-tabs') !== null`, 6000);
  await sleep(200);
  await click(`.settings-tab[data-panel="category"]`);
  await sleep(300);
  const catList = await js(`(() => {
    const list = document.querySelector('#categoryList');
    if (!list) return null;
    const rows = [...list.querySelectorAll('.cat-row')];
    return {
      rowCount: rows.length,
      noDragHandle: rows.every(r => !r.querySelector('.drag-handle') && !r.querySelector('[data-cat-drag]')),
      iconBtn: !!rows[0] && !!rows[0].querySelector('.cat-icon-btn'),
      delBtn: !!rows[0] && !!rows[0].querySelector('[data-cat-del]'),
    };
  })()`);
  ok("分类管理行存在图标/删除按钮", catList && catList.rowCount > 0 && catList.iconBtn && catList.delBtn, JSON.stringify(catList));
  ok("分类管理已移除拖拽手柄", catList && catList.noDragHandle, JSON.stringify(catList));

  // 自定义删除确认弹窗（替代原生 confirm）
  await js(`(() => { const b = document.querySelector('#categoryList [data-cat-del]'); if (b) b.click(); return !!b; })()`);
  ok("删除分类弹出应用内确认框（非原生 confirm）", await waitFor(`document.querySelector('.modal-overlay.show .confirm-message') !== null`, 4000));
  await topClose(); // 取消删除

  // 首页分类 tab 拖拽
  await topClose();
  await sleep(300);
  const tabDrag = await js(`(async () => {
    const nav = document.querySelector('#categoryTabs');
    const tabs = () => [...nav.querySelectorAll('.category-tab')];
    const before = tabs().map(t => t.textContent.trim());
    const dt = new DataTransfer();
    const from = tabs()[1];
    const to = tabs()[0];
    from.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
    const rect = to.getBoundingClientRect();
    to.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, clientX: rect.left + 10, clientY: rect.top + 10, dataTransfer: dt }));
    to.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, clientX: rect.left + 10, clientY: rect.top + 10, dataTransfer: dt }));
    nav.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 300));
    return { before, after: tabs().map(t => t.textContent.trim()) };
  })()`);
  const tabOk = tabDrag && tabDrag.before[0] === tabDrag.after[1] && tabDrag.before[1] === tabDrag.after[0];
  ok("首页分类 tab 拖拽排序生效", tabOk, JSON.stringify(tabDrag));

  // 手机端
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  await send("Page.reload", { ignoreCache: true });
  await sleep(2500);
  ok("手机端渲染正常", await waitFor(`document.querySelectorAll('#categoryTabs .category-tab').length > 0`, 8000));
  await waitFor(`document.querySelector('[data-action="settings"]') !== null`, 8000);
  await click('[data-action="settings"]');
  // reload 后 sessionStorage 仍保留登录态，直接打开设置面板
  ok("手机端设置面板出现", await waitFor(`document.querySelector('.modal-overlay.show .settings-tabs') !== null`, 6000));
  const mobileStyle = await js(`(() => { const t = document.querySelector('.modal-overlay.show .settings-tabs'); const c = document.querySelector('#categoryTabs'); if (!t || !c) return null; return { tabsOverflow: getComputedStyle(t).overflowX, tabsWrap: getComputedStyle(t).flexWrap, catOverflow: getComputedStyle(c).overflowX, catWrap: getComputedStyle(c).flexWrap }; })()`);
  ok("手机端设置标签可横向滚动", mobileStyle && mobileStyle.tabsOverflow === "auto", JSON.stringify(mobileStyle));
  ok("手机端首页分类可横向滚动", mobileStyle && mobileStyle.catOverflow === "auto", JSON.stringify(mobileStyle));
  const pageErrs = await js(`window.__errs || []`);
  if (pageErrs.length) console.log("页面错误:", JSON.stringify(pageErrs));

  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n======== 结果：${results.length - failed}/${results.length} 通过 ========`);
  if (failed) process.exitCode = 1;
}

main()
  .catch((e) => {
    console.error("ERROR:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      edge.kill();
    } catch {}
    try {
      preview.kill();
    } catch {}
    setTimeout(() => process.exit(), 800);
  });
