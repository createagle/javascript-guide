# Pocket Ledger

[English](README.md) | **简体中文**

本书的综合实战项目：一个断网也能使用的小记账本。没有框架，不需要构建，没有依赖。

[打开应用](https://createagle.github.io/javascript-guide/chapters/39-capstone/ledger/)

| 文件 | 作用 |
| --- | --- |
| [index.html](index.html) | 页面：三个自定义元素和几个控件 |
| [src/main.js](src/main.js) | 把各部分连接起来：存储 → 状态 → 组件，事件再反向传回 |
| [src/ledger.js](src/ledger.js) | `Ledger` 类（继承 `EventTarget`）：保存记录列表；先写入存储，再触发 `change` |
| [src/db.js](src/db.js) | IndexedDB 的 Promise 封装，以及内存版的替代实现 |
| [src/money.js](src/money.js) | 纯函数：把金额解析成分、汇总、格式化、校验导入的数据 |
| [src/rates.js](src/rates.js) | 带超时地获取汇率，失败时使用上次保存的副本 |
| [src/components/](src/components/) | `<entry-form>`、`<entry-list>`、`<ledger-summary>` 三个 Web Components |
| [sw.js](sw.js) | Service Worker：缓存应用外壳（缓存优先）和汇率（先用缓存、后台更新） |
| [manifest.webmanifest](manifest.webmanifest) | 让浏览器可以安装这个应用 |
| [data/rates.json](data/rates.json) | 示例汇率（不是实时数据） |
| [test/money.test.js](test/money.test.js) | `money.js` 的单元测试 |

## 在本地运行

Service Worker 和模块都需要通过 http(s) 访问，所以在仓库根目录启动服务器，再打开 `chapters/39-capstone/ledger/`：

```bash
python3 -m http.server 8000
```

用 Node.js 20 或更高版本运行测试：

```bash
cd chapters/39-capstone/ledger
npm test
```

修改了任何被缓存的文件后，要把 `sw.js` 里的 `VERSION` 加一，否则访问者会一直拿到旧的副本。
