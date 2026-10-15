# 第 35 章 · 性能 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 35-1 布局抖动对比 | [01-layout-thrashing.html](https://createagle.github.io/javascript-guide/chapters/35-performance/01-layout-thrashing.html) | 先交替读写布局、再先读后写，调整几百个条形的宽度，对比耗时和强制布局的次数 |
| 35-2 长任务拆分与 INP | [02-long-tasks.html](https://createagle.github.io/javascript-guide/chapters/35-performance/02-long-tasks.html) | 把一秒钟的工作作为一个长任务运行，或者拆成小块（`setTimeout`、`scheduler.yield()`），测量运行期间的帧间隔，以及点击和按键的响应延迟 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
