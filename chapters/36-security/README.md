# Chapter 36 · Security · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 36-1 XSS sandbox | [01-xss-sandbox.html](https://createagle.github.io/javascript-guide/chapters/36-security/01-xss-sandbox.html) | Put untrusted input into HTML text, an attribute or a link, and see which payloads run; switch on escaping, URL checking and a Content Security Policy. The result is rendered in a sandboxed iframe that reports back with `postMessage` |
| 36-2 Prototype pollution | [02-prototype-pollution.html](https://createagle.github.io/javascript-guide/chapters/36-security/02-prototype-pollution.html) | Merge user-supplied JSON into settings with a naive deep merge and watch `"__proto__"` give every object an `isAdmin` property; then try the safe merge |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
