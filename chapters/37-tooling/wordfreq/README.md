# wordfreq

**English** | [简体中文](README.zh-CN.md)

A small but complete Node.js project for chapter 37: a command line tool that prints the most frequent words in text files, with tests, linting, formatting, JSDoc type checking and a Vite web page that reuses the same code.

| Path                                                                      | What it is                                                                          |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/count.js`                                                            | `countWords()` and `topWords()`, with JSDoc types; works in Node.js and in browsers |
| `src/stop-words.js`                                                       | Common words to leave out                                                           |
| `bin/wordfreq.js`                                                         | The command line tool (`node:util` `parseArgs`, `node:fs/promises`)                 |
| `test/count.test.js`                                                      | Tests for `node --test`                                                             |
| `index.html`, `src/main.js`                                               | A web page that uses `topWords()`; works as is, or through Vite                     |
| `eslint.config.js`, `.prettierrc.json`, `tsconfig.json`, `vite.config.js` | Tool settings                                                                       |

## Try it

Copy this folder, then:

```sh
npm install                # install the tools listed in devDependencies
npm start                  # count the words in sample.txt
node bin/wordfreq.js --top 5 --min-length 4 sample.txt
npm test                   # node --test
npm run lint               # ESLint
npm run format:check       # Prettier
npm run typecheck          # TypeScript checks the JSDoc types
npm run dev                # Vite development server for index.html
npm run build              # Vite production build in dist/
npm run check              # lint, format check, type check and tests together
```

Node.js 20 or later is needed.
