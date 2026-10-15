# 第 20 章 · async/await · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 20-1 串行与并行计时 | [01-serial-parallel.html](https://createagle.github.io/javascript-guide/chapters/20-async-await/01-serial-parallel.html) | 三个模拟请求分别用逐个 `await`、`Promise.all` 和 `forEach` 等待：时间线显示每个请求何时运行、`await` 何时返回 |
| 20-2 带退避的重试器 | [02-retry-backoff.html](https://createagle.github.io/javascript-guide/chapters/20-async-await/02-retry-backoff.html) | 通过 `retry` 函数调用一个不稳定的服务：指数退避、可选的随机抖动、不重试的错误，以及用 `AbortController` 取消 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
