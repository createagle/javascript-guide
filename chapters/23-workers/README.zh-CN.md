# 第 23 章 · Web Worker 与并发 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 23-1 主线程阻塞对比 | [01-blocking.html](https://createagle.github.io/javascript-guide/chapters/23-workers/01-blocking.html) | 分别在主线程和模块 Worker 里计算素数，同时用动画、帧计数和输入框观察页面是否还能响应 |
| 23-2 Worker 计算素数 | [02-prime-workers.html](https://createagle.github.io/javascript-guide/chapters/23-workers/02-prime-workers.html) | 把计算分给 1 到 8 个 Worker，显示各自的进度，用 `AbortController` 取消，结果以可转移的缓冲区传回 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
