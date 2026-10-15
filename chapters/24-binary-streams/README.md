# Chapter 24 · Binary Data and Streams · Demos

**English** | [简体中文](README.zh-CN.md)

| Demo | Live | Notes |
| --- | --- | --- |
| 24-1 File hash and hex viewer | [01-file-inspector.html](https://createagle.github.io/javascript-guide/chapters/24-binary-streams/01-file-inspector.html) | Pick or drop a file (or use a sample): its SHA-256, the format guessed from its first bytes, PNG dimensions read with a `DataView`, base64, and a hex dump |
| 24-2 Processing text as a stream | [02-stream-text.html](https://createagle.github.io/javascript-guide/chapters/24-binary-streams/02-stream-text.html) | A generated access log flows through `TextDecoderStream`, a line splitter and a filter into a `WritableStream`; matches appear long before the end, and `pipeTo` can be cancelled |

Starter and finished code for the exercises lives in [exercises/](exercises/README.md).
