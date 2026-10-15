# 第 26 章 · 修改 DOM · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 26-1 列表渲染器 | [01-list-renderer.html](https://createagle.github.io/javascript-guide/chapters/26-modifying-dom/01-list-renderer.html) | 用 `<template>` 根据数据渲染列表：每次重建所有行，或按 id 复用已有的行（支持时用 `moveBefore()` 移动）；在某行输入备注后打乱顺序，看哪些状态能保留 |
| 26-2 三种插入方式的安全对比 | [02-safe-insertion.html](https://createagle.github.io/javascript-guide/chapters/26-modifying-dom/02-safe-insertion.html) | 同一段用户输入分别用 `textContent`、`innerHTML`（放在沙箱 iframe 里）和 `setHTML()`（或白名单回退）插入；试试「An attack」预设 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
