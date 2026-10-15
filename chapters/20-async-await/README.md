# Chapter 20 · async/await · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 20-1 Serial vs parallel await | [01-serial-parallel.html](https://createagle.github.io/javascript-guide/chapters/20-async-await/01-serial-parallel.html) | Three fake requests awaited one by one, with `Promise.all`, and inside `forEach`: a timeline shows when each one runs and when `await` returns |
| 20-2 Retry with exponential backoff | [02-retry-backoff.html](https://createagle.github.io/javascript-guide/chapters/20-async-await/02-retry-backoff.html) | An unreliable service called through a `retry` function with exponential backoff, optional jitter, non-retryable errors and cancellation via `AbortController` |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
