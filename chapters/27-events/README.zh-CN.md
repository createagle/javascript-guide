# 第 27 章 · 事件 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 27-1 事件传播可视化 | [01-propagation.html](https://createagle.github.io/javascript-guide/chapters/27-events/01-propagation.html) | 在 window、document、section、div 和按钮上各注册捕获和冒泡两个监听器：点击后查看执行顺序、`eventPhase`、`target` 与 `currentTarget`，以及 `stopPropagation()` 截断了哪些监听器 |
| 27-2 事件委托待办列表 | [02-delegated-todos.html](https://createagle.github.io/javascript-guide/chapters/27-events/02-delegated-todos.html) | `<ul>` 上的两个监听器处理所有任务，包括之后添加的任务；日志显示每次的 `event.target` 和用 `closest()` 找到的 `<li>` |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
