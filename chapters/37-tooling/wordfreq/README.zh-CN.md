# wordfreq

[English](README.md) | **简体中文**

第 37 章用到的一个小而完整的 Node.js 项目：命令行工具，统计文本文件里出现最多的词，带有测试、代码检查、格式化、JSDoc 类型检查，以及一个复用同一份代码的 Vite 网页。

| 路径                                                                      | 内容                                                                       |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `src/count.js`                                                            | `countWords()` 和 `topWords()`，带 JSDoc 类型；在 Node.js 和浏览器里都能用 |
| `src/stop-words.js`                                                       | 要排除的常见词                                                             |
| `bin/wordfreq.js`                                                         | 命令行工具（`node:util` 的 `parseArgs`、`node:fs/promises`）               |
| `test/count.test.js`                                                      | 用 `node --test` 运行的测试                                                |
| `index.html`、`src/main.js`                                               | 使用 `topWords()` 的网页；直接打开或通过 Vite 运行都可以                   |
| `eslint.config.js`、`.prettierrc.json`、`tsconfig.json`、`vite.config.js` | 各个工具的配置                                                             |

## 试一试

把这个文件夹复制出来，然后运行：

```sh
npm install                # 安装 devDependencies 里列出的工具
npm start                  # 统计 sample.txt 里的词
node bin/wordfreq.js --top 5 --min-length 4 sample.txt
npm test                   # node --test
npm run lint               # ESLint
npm run format:check       # Prettier
npm run typecheck          # TypeScript 检查 JSDoc 类型
npm run dev                # 用 Vite 开发服务器打开 index.html
npm run build              # 用 Vite 生成正式版本，输出到 dist/
npm run check              # 依次运行代码检查、格式检查、类型检查和测试
```

需要 Node.js 20 或更高版本。
