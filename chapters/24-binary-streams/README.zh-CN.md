# 第 24 章 · 二进制与流 · 示例

[English](README.md) | **简体中文**

| 示例 | 在线地址 | 说明 |
| --- | --- | --- |
| 24-1 文件哈希与十六进制查看器 | [01-file-inspector.html](https://createagle.github.io/javascript-guide/chapters/24-binary-streams/01-file-inspector.html) | 选择或拖入一个文件（也可以用示例文件）：显示它的 SHA-256、根据开头字节判断的格式、用 `DataView` 读出的 PNG 尺寸、base64 和十六进制内容 |
| 24-2 流式文本处理 | [02-stream-text.html](https://createagle.github.io/javascript-guide/chapters/24-binary-streams/02-stream-text.html) | 生成的访问日志依次流过 `TextDecoderStream`、按行拆分和过滤，最后写入 `WritableStream`；第一条匹配远早于结束就出现，`pipeTo` 可以取消 |

练习的初始代码和成品代码在 [exercises/](exercises/README.zh-CN.md)。
