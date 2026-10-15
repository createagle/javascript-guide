# Chapter 30 · Observers and Rendering Timing · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 30-1 Debounce and throttle | [01-debounce-throttle.html](https://createagle.github.io/javascript-guide/chapters/30-observers/01-debounce-throttle.html) | Move the pointer or type, and watch on a timeline when the raw events, a debounced handler, a throttled handler and a `requestAnimationFrame` handler run; the canvas is resized with `ResizeObserver` |
| 30-2 Infinite scroll | [02-infinite-scroll.html](https://createagle.github.io/javascript-guide/chapters/30-observers/02-infinite-scroll.html) | A feed that loads the next page when a sentinel element comes near the bottom (`IntersectionObserver` with `rootMargin`), with loading, error and end states, and a second observer that reports which items are in view |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
