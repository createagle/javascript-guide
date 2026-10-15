# Chapter 27 · Events · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 27-1 Event propagation | [01-propagation.html](https://createagle.github.io/javascript-guide/chapters/27-events/01-propagation.html) | Capture and bubble listeners on window, document, a section, a div and a button: click and watch the order, `eventPhase`, `target` and `currentTarget`, and what `stopPropagation()` cuts off |
| 27-2 Event delegation to-do list | [02-delegated-todos.html](https://createagle.github.io/javascript-guide/chapters/27-events/02-delegated-todos.html) | Two listeners on the `<ul>` handle every task, including tasks added later; a log shows each `event.target` and the `<li>` found with `closest()` |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
