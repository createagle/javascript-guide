# JavaScript 完全指南 · 协作约定

本仓库是《JavaScript 完全指南》（5 篇 40 章）的配套示例。教程正文写在 Claude Docs 文档里，
示例代码放在这里并部署到 https://createagle.github.io/javascript-guide/ ，正文引用线上地址。
约定与姊妹项目《CSS 完全指南》（createagle/css-guide）、《HTML 完全指南》（createagle/html-guide）保持一致，
另外多了「在线代码运行器」和「iframe 自适应高度」两项。

## 提交与部署（每次改动都要做）

1. 改完代码后先本地验证：`python3 -m http.server 8000` 起服务，运行 `node tools/check_pages.mjs`（可传入页面路径），
   它用 Playwright（Chromium 已预装）打开页面，检查没有报错、代码运行器都跑完、练习成品的测试全部通过。
   `SHOTS=<目录>` 会保存亮色、暗色截图，新页面要看一遍截图，交互控件实际操作一次。
2. 提交并推送到当前会话指定的 `claude/**` 分支：`git push -u origin <分支>`。
3. 推送会触发 `.github/workflows/sync-main.yml`：把分支快进合并到 `main`（没有 `main` 时直接创建），
   再触发 `pages.yml` 部署。不需要手动开 PR 或合并。
4. 推送后检查两个 workflow 是否成功；失败要排查修复，不要把失败的部署留着。
5. 文档里引用的示例链接只写已部署成功的页面。

快进失败说明 `main` 上有分支没有的提交（例如有人在网页上直接改了 main）：
先 `git fetch origin main && git merge origin/main`，解决冲突后再推送。

## 示例约定

- 目录：`chapters/<NN-slug>/<NN-name>.html`，每章一个 `README.md`（及 `README.zh-CN.md`）。
- 两类示例页：
  - **运行器页**（讲语言的章节）：页面里放一个或几个 `<div class="playground">`，由 `assets/playground.js`
    变成可编辑、可运行的代码框。代码默认在 Web Worker 里运行（没有 DOM，3 秒无响应视为死循环并终止）；
    `data-mode="dom"` 时在沙箱 iframe 里以模块脚本运行，配 `<template class="html">` 提供页面结构。
    写法见 `assets/playground.js` 开头的注释。
  - **界面页**（讲浏览器 API 的章节）：`<body class="demo">` 内放可选的 `<div class="controls">` 和 `<div class="stage">`，
    脚本直接写在页面里。
- 每个页面的 `<head>` 都先引用 `../../assets/demo.js`（练习页是 `../../../assets/demo.js`），再引用 `style.css`；
  运行器页再加 `<script src="…/assets/playground.js" defer></script>`。`demo.js` 负责 `?theme=light|dark`
  和 iframe 内嵌时的自适应高度（向父页面发送 `{ type: 'jsguide:resize', height }`）。
- 练习：`exercises/` 放每道题的初始版本 `NN-start.html` 和成品版本 `NN-final.html`（没有代码的题不放）。
  **两个版本都必须能在 GitHub Pages 上直接运行**。能用运行器的题都用运行器：初始版本是待补全的代码 + 测试，
  成品版本是参考答案 + 同一组测试（`check_pages.mjs` 要求成品页测试全部通过）。
  README 用表格列出每题的在线预览链接和源码文件。题目与参考答案写在文档里：每道题一个三级标题，题目下写
  `初始效果：[在线预览](Pages 地址) · [查看源码](GitHub 地址)`；参考答案用可折叠 widget
  （`<details>` + `<summary>参考答案</summary>`，默认收起，不加 text id），末尾写
  `最终效果：在线预览 · 查看源码` 两个链接。
- **示例页只放演示本身**：不写标题、说明文字、面包屑。讲解全部写在 Claude Docs 文档里。页面要能直接作为 iframe 内嵌，
  在 360px 宽的 iframe 里也不能出现横向滚动。
- **GitHub Pages 上的页面文案一律用英文**（`<title>`、控件标签、代码注释、`aria-label`、测试名）；
  演示中文处理、国际化等必须出现中文的地方除外。
- **仓库里的 Markdown 一律中英双语**：英文写在 `README.md`，中文写在同目录的 `README.zh-CN.md`，
  两个文件 H1 下第一行放语言切换：英文版 `**English** | [简体中文](README.zh-CN.md)`，
  中文版 `[English](README.md) | **简体中文**`。两版内容保持一致。`CLAUDE.md` 是协作约定，不需要双语。
- 零依赖、不需要构建；支持暗色模式和 `prefers-reduced-motion`。运行器页依赖 Web Worker 和 `srcdoc`，
  需要通过 http(s) 访问；界面页能双击打开（模块、Worker、存储等章节除外）。
- 示例本身要符合本书讲的写法：`const`/`let`、严格模式或模块、事件委托、不用 `innerHTML` 拼接用户输入；
  HTML 语义正确、能用键盘操作、表单控件有 label。演示较新的特性时先做特性检测，页面在不支持的浏览器里也不能坏掉。
- 新增示例后同步更新本章 `README.md`、`README.zh-CN.md`，再运行 `python3 tools/build_index.py` 重新生成根目录 `index.html`。
- 文档里引用的代码片段要与页面源码一致；改了页面就同步改文档。

## 文档约定（Claude Docs）

- 文档结构：「教学大纲」标签页在最前；五个「第 N 篇」标签页按顺序排列，每章是所属篇下的子标签页，
  名为「第 N 章 标题」。
- 小标题带序号，每个标签页内从 1 开始逐级编号：二级标题 `1.`、`2.`…，三级标题 `1.1`、`1.2`…。不要把章号带进小标题。
- 每章按大纲的 7 段式结构写，每个示例配「在线演示」「查看源码」两个链接。
- 阅读时长：只在章标题下一行写 `*全章阅读约 N 分钟，不含练习动手时间*`。必须用 `tools/reading_time.py` 实测：
  用 Claude Docs `export`（format=markdown）导出该章，把返回的 `bytes_b64` 存成文件，
  运行 `python3 tools/reading_time.py --b64 <文件>`。内容改动后重新实测并更新。

## 链接格式

- 在线演示：`https://createagle.github.io/javascript-guide/chapters/<章目录>/<示例>.html`
- 查看源码：`https://github.com/createagle/javascript-guide/blob/main/chapters/<章目录>/<示例>.html`
