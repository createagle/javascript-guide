# JavaScript 零基础入门

面向零基础的 JavaScript 教程，共 8 章。课程文字在 Claude Docs 中编写，本仓库存放每章配套的示例代码，并通过 GitHub Pages 提供可交互的预览站：在浏览器里直接修改示例、运行、查看输出。

在线预览：<https://createagle.github.io/javascript-guide/>（首次部署完成后可访问）

## 章节进度

| 章 | 主题 | 状态 |
| --- | --- | --- |
| 1 | 认识 JavaScript 与开发环境 | 已完成 |
| 2 | 变量与数据类型 | 编写中 |
| 3 | 运算符与流程控制 | 编写中 |
| 4 | 函数与作用域 | 编写中 |
| 5 | 对象与数组 | 编写中 |
| 6 | DOM 与事件 | 编写中 |
| 7 | 异步编程 | 编写中 |
| 8 | 综合项目：待办清单 | 编写中 |

## 本地预览

站点是纯静态文件，不需要构建。由于运行示例用到了 Web Worker，不能直接双击打开 HTML，需要起一个本地服务：

```bash
python3 -m http.server 8000 -d site
# 然后访问 http://localhost:8000
```

## 目录结构

```text
site/
  index.html                  课程首页
  assets/
    style.css                 全站样式
    app.js                    把 .playground 元素变成可编辑、可运行的示例
    runner.js                 主线程侧运行器：启动 Worker，限制运行时间和输出量
    sandbox-worker.js         在 Web Worker 中执行代码并格式化 console 输出
  chapters/NN/
    index.html                第 NN 章页面
    demo/                     需要独立打开的完整示例页面（如有）
.github/workflows/pages.yml   推送到 main 后自动发布 site/ 到 GitHub Pages
```

## 新增一章

1. 复制 `site/chapters/01/index.html` 到 `site/chapters/NN/index.html`，替换正文
2. 示例代码写成 `<div class="playground" data-key="chNN-xxx" data-title="标题">`，里面放一个 `<script type="text/plain">` 存代码；`data-key` 全站唯一，用来在浏览器里保存学习者的修改
3. 在 `site/index.html` 的目录里，把该章从「编写中」改成链接
4. 本地预览确认能运行，再推送到 `main`

## Playground 如何运行代码

学习者的代码在 Web Worker 中执行，页面本身不会受影响：

- 3 秒内没有跑完会被判定为死循环，并强制终止
- 单次输出超过 500 行会自动停止
- Worker 最长存活 10 秒，用来兜底未清理的 `setInterval`
- 代码默认运行在严格模式下，并支持顶层 `await`
- 学习者的修改保存在浏览器的 `localStorage`，点击「重置」可恢复原始示例

Worker 里没有 DOM，所以涉及 DOM 的章节（第 6 章）会改用沙箱 iframe 运行。

## 部署到 GitHub Pages

仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**，之后每次推送到 `main` 都会自动部署。
