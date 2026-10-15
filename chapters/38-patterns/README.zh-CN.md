# 第 38 章 · 设计模式与架构 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 38-1 发布订阅事件总线 | [01-event-bus.html](https://createagle.github.io/javascript-guide/chapters/38-patterns/01-event-bus.html) | 一个小商店，各模块（商品、购物车、角标、通知、统计）只通过发布订阅总线通信。监视器记录每个事件和收到它的处理函数；取消勾选模块即可退订 |
| 38-2 迷你信号库 | [02-signals.html](https://createagle.github.io/javascript-guide/chapters/38-patterns/02-signals.html) | 基于约 100 行的信号库（[signals.js](signals.js)）实现的订单表单：`signal`、惰性缓存的 `computed`、自动追踪依赖的 `effect`。右侧显示每次改动后哪些计算和副作用重新运行了 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
