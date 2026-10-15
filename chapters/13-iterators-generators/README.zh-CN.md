# 第 13 章 · 迭代器与生成器 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 13-1 惰性无限序列 | [01-lazy-sequences.html](https://createagle.github.io/javascript-guide/chapters/13-iterators-generators/01-lazy-sequences.html) | 从无限生成器经过 `filter`、`map`、`take` 逐个拉取值，观察每一级只在被请求时才运行；包含带回退的 `Iterator.concat()` |
| 13-2 手写可迭代对象 | [02-custom-iterable.html](https://createagle.github.io/javascript-guide/chapters/13-iterators-generators/02-custom-iterable.html) | 手写实现迭代协议的 `Range` 类，用八种方式消费，记录每一次 `next()` 和 `return()` 调用 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
