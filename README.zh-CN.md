# JavaScript 完全指南 · 示例

[English](README.md) | **简体中文**

《JavaScript 完全指南》（5 篇 40 章）的配套示例，部署在 GitHub Pages：

**https://createagle.github.io/javascript-guide/**

所有示例都能在线运行。讲语言的章节使用内置的代码运行器：修改代码，点 **Run**（或按 Ctrl/⌘ + Enter），控制台输出就显示在下方。讲浏览器 API 的章节是可以直接操作的交互页面。

## 目录结构

```text
index.html                     # 示例索引（按篇、章排列），由 tools/build_index.py 生成
404.html
assets/
  style.css                    # 公共样式：亮色/暗色主题、示例布局、代码运行器、减少动效
  demo.js                      # 每个页面都引用：?theme=light|dark，以及 iframe 内嵌时的自适应高度
  playground.js                # 代码运行器：编辑器、Web Worker / 沙箱 iframe、控制台、测试
chapters/
  01-intro/
    README.md                  # 本章示例列表
    01-script-timing.html      # 一个示例一个独立页面
    exercises/                 # 练习的初始版本（NN-start）和成品版本（NN-final）
  02-values-types/
  ...
tools/
  build_index.py               # 根据各章 README 重新生成 index.html
  check_pages.mjs              # 用 Chromium 打开页面：无报错、运行器跑完、练习测试通过
  reading_time.py              # 根据一章的 Markdown 导出估算阅读时长
.github/workflows/
  pages.yml                    # 推送到 main 时部署到 GitHub Pages
  sync-main.yml                # 把 claude/** 分支快进合并到 main，再触发部署
```

- 示例地址：`https://createagle.github.io/javascript-guide/chapters/<章目录>/<示例>.html`
- 源码地址：`https://github.com/createagle/javascript-guide/blob/main/chapters/<章目录>/<示例>.html`
- 示例页只放演示本身（英文文案、不写讲解），讲解都在教程文档里。

## 代码运行器

```html
<div class="playground" data-title="Hello">
  <script type="text/plain" class="code">
    console.log('Hello, JavaScript!');
  </script>
</div>
```

- 代码在 Web Worker 里运行，不会卡住或改动页面。连续运行 3 秒不停（死循环）会被终止；定时器在开始运行 15 秒后停止。
- 代码运行在严格模式下，可以在顶层直接使用 `await`。
- `console.log/info/warn/error/table/group/count/time` 的输出格式和浏览器控制台接近。
- `data-mode="dom"` 时，代码作为模块脚本在沙箱 iframe 里运行，页面结构来自 `<template class="html">`。
- 可选的 `<script type="text/plain" class="tests">` 用 `test(name, fn)` 和 `assert.equal / deepEqual / ok / throws / rejects / match` 写检查，练习页都用它。
- 修改会保存在浏览器里（`localStorage`），点 **Reset** 恢复原始代码。

## 作为 iframe 内嵌

所有页面都可以内嵌。在 iframe 里，页面不再撑满框架高度，而是把内容的实际高度发给父页面，父页面据此调整 iframe 高度：

```html
<iframe src="https://createagle.github.io/javascript-guide/chapters/01-intro/02-console.html"
        title="JavaScript 示例" loading="lazy" style="width: 100%; height: 480px; border: 0"></iframe>
<script>
  addEventListener('message', (event) => {
    if (event.origin !== 'https://createagle.github.io' || event.data?.type !== 'jsguide:resize') return;
    for (const frame of document.querySelectorAll('iframe')) {
      if (frame.contentWindow === event.source) frame.style.height = event.data.height + 'px';
    }
  });
</script>
```

在地址后加 `?theme=light` 或 `?theme=dark` 可以和父页面的主题保持一致；不加时跟随系统设置。

## 新增示例

1. 复制一个现有示例页，修改英文 `<title>` 和内容。
2. 在本章 `README.md` 和 `README.zh-CN.md` 的表格里各加一行。
3. 运行 `python3 tools/build_index.py` 重新生成 `index.html`。
4. 起本地服务（`python3 -m http.server 8000`），运行 `node tools/check_pages.mjs chapters/<章目录>/<示例>.html`。

## 部署

- `.github/workflows/sync-main.yml`：推送到 `claude/**` 分支后，快进合并到 `main` 并触发部署。
- `.github/workflows/pages.yml`：推送到 `main`（或被上面的 workflow 触发）时部署到 GitHub Pages。

首次使用：在 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**，并把 `main` 设为默认分支。

## 许可

[MIT](LICENSE)
