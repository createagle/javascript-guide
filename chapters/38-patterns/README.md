# Chapter 38 · Design Patterns & Architecture · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 38-1 Event bus | [01-event-bus.html](https://createagle.github.io/javascript-guide/chapters/38-patterns/01-event-bus.html) | A shop whose modules (products, cart, badge, notifications, analytics) only talk through a publish/subscribe bus. The monitor logs every event and the handlers that received it; switch modules off to unsubscribe them |
| 38-2 Mini signals | [02-signals.html](https://createagle.github.io/javascript-guide/chapters/38-patterns/02-signals.html) | An order form built on a 100-line signals library ([signals.js](signals.js)): `signal`, lazy cached `computed`, and `effect` with automatic dependency tracking. The panel shows which computeds and effects ran after each change |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
