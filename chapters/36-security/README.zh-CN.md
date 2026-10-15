# 第 36 章 · 安全 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 36-1 XSS 沙箱 | [01-xss-sandbox.html](https://createagle.github.io/javascript-guide/chapters/36-security/01-xss-sandbox.html) | 把不可信的输入放进 HTML 文本、属性或链接，看哪些攻击代码会执行；再打开转义、URL 检查和内容安全策略。结果在沙箱 iframe 里渲染，通过 `postMessage` 报告 |
| 36-2 原型污染演示 | [02-prototype-pollution.html](https://createagle.github.io/javascript-guide/chapters/36-security/02-prototype-pollution.html) | 用简单的深合并把用户提供的 JSON 合并进设置，看 `"__proto__"` 怎样让每个对象都多出 `isAdmin` 属性；再换成安全的合并 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
