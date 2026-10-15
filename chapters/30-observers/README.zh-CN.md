# 第 30 章 · 观察者与渲染时机 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 30-1 防抖与节流对比 | [01-debounce-throttle.html](https://createagle.github.io/javascript-guide/chapters/30-observers/01-debounce-throttle.html) | 移动指针或输入文字，在时间轴上比较原始事件、防抖、节流和 `requestAnimationFrame` 四种处理函数各在什么时候执行；画布尺寸由 `ResizeObserver` 维护 |
| 30-2 无限滚动列表 | [02-infinite-scroll.html](https://createagle.github.io/javascript-guide/chapters/30-observers/02-infinite-scroll.html) | 哨兵元素接近底部时加载下一页的列表（带 `rootMargin` 的 `IntersectionObserver`），包含加载中、出错和到底三种状态，另一个观察者报告哪些条目在可见区域内 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
