# Chapter 35 · Performance · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 35-1 Layout thrashing | [01-layout-thrashing.html](https://createagle.github.io/javascript-guide/chapters/35-performance/01-layout-thrashing.html) | Resize hundreds of bars by reading and writing layout in turn, then by reading everything first; compare the time and the number of forced layouts |
| 35-2 Long tasks and INP | [02-long-tasks.html](https://createagle.github.io/javascript-guide/chapters/35-performance/02-long-tasks.html) | Run one second of work as one long task or in chunks (`setTimeout`, `scheduler.yield()`), and measure frame gaps and the latency of your clicks and key presses while it runs |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
