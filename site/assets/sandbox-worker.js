// 在 Web Worker 中运行学习者的代码，并把 console 输出转发给主线程。
// 这是普通脚本（不是 ES module），由 runner.js 通过 new Worker() 加载。
// Worker 里没有 DOM，页面本身不会被学习者的代码影响；死循环由主线程的看门狗终止。
'use strict';

const MAX_DEPTH = 3;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// 把任意值格式化成字符串，风格接近浏览器控制台。
// top 为 true 时，字符串原样输出；嵌套在对象里的字符串会加引号。
function inspect(value, depth, seen, top) {
  const type = typeof value;
  if (type === 'string') return top ? value : JSON.stringify(value);
  if (type === 'number' || type === 'boolean' || type === 'undefined') return String(value);
  if (type === 'bigint') return value + 'n';
  if (type === 'symbol') return value.toString();
  if (type === 'function') return 'ƒ ' + (value.name || '(anonymous)') + '()';
  if (value === null) return 'null';
  if (seen.has(value)) return '[Circular]';
  if (value instanceof Error) return value.name + ': ' + value.message;
  if (value instanceof Date) return isNaN(value) ? 'Invalid Date' : value.toISOString();
  if (depth >= MAX_DEPTH) return Array.isArray(value) ? '[Array]' : '[Object]';

  seen.add(value);
  try {
    const next = (v) => inspect(v, depth + 1, seen, false);
    if (Array.isArray(value)) {
      return value.length === 0 ? '[]' : '[' + value.map(next).join(', ') + ']';
    }
    if (value instanceof Map) {
      const items = Array.from(value, ([k, v]) => next(k) + ' => ' + next(v));
      return 'Map(' + value.size + ') {' + (items.length ? ' ' + items.join(', ') + ' ' : '') + '}';
    }
    if (value instanceof Set) {
      const items = Array.from(value, next);
      return 'Set(' + value.size + ') {' + (items.length ? ' ' + items.join(', ') + ' ' : '') + '}';
    }
    const ctor = value.constructor && value.constructor.name;
    const prefix = ctor && ctor !== 'Object' ? ctor + ' ' : '';
    const keys = Object.keys(value);
    if (keys.length === 0) return prefix + '{}';
    return prefix + '{ ' + keys.map((k) => k + ': ' + next(value[k])).join(', ') + ' }';
  } catch (err) {
    return '[Object]';
  } finally {
    seen.delete(value);
  }
}

function format(args) {
  return args.map((a) => inspect(a, 0, new Set(), true)).join(' ');
}

function post(level, text) {
  self.postMessage({ type: 'out', level: level, text: text });
}

// 把数组或对象整理成 console.table 需要的行列结构。
function buildTable(data) {
  if (data === null || typeof data !== 'object') return null;
  const entries = Array.isArray(data)
    ? data.map((v, i) => [String(i), v])
    : Object.entries(data);
  const columns = [];
  let hasValue = false;
  const rows = entries.map(([index, v]) => {
    const cells = {};
    let value = null;
    if (v !== null && typeof v === 'object') {
      Object.keys(v).forEach((k) => {
        if (columns.indexOf(k) === -1) columns.push(k);
        cells[k] = inspect(v[k], 1, new Set(), true);
      });
    } else {
      hasValue = true;
      value = inspect(v, 1, new Set(), true);
    }
    return { index: index, cells: cells, value: value };
  });
  return { columns: columns, hasValue: hasValue, rows: rows };
}

const fakeConsole = {
  log: (...a) => post('log', format(a)),
  info: (...a) => post('info', format(a)),
  debug: (...a) => post('log', format(a)),
  warn: (...a) => post('warn', format(a)),
  error: (...a) => post('error', format(a)),
  assert: (cond, ...a) => {
    if (!cond) post('error', 'Assertion failed' + (a.length ? ': ' + format(a) : ''));
  },
  table: (data) => {
    const table = buildTable(data);
    if (table) self.postMessage({ type: 'out', level: 'table', table: table });
    else post('log', format([data]));
  },
  clear: () => self.postMessage({ type: 'clear' }),
};
Object.defineProperty(self, 'console', { value: fakeConsole, configurable: true, writable: true });

function report(err) {
  if (err instanceof Error) post('error', err.name + ': ' + err.message);
  else post('error', 'Uncaught ' + inspect(err, 0, new Set(), true));
}

// 定时器回调里的未捕获错误、未处理的 Promise 拒绝，都按报错输出。
self.addEventListener('error', (event) => {
  event.preventDefault();
  report(event.error || event.message);
});
self.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  report(event.reason);
});

self.onmessage = async (event) => {
  const code = String((event.data && event.data.code) || '');
  let fn;
  try {
    // 加上 "use strict"，让拼错的变量名直接报错，而不是悄悄变成全局变量。
    // AsyncFunction 允许学习者在代码顶层直接使用 await。
    fn = new AsyncFunction('"use strict";\n' + code);
  } catch (err) {
    report(err);
    self.postMessage({ type: 'done' });
    return;
  }
  try {
    await fn();
  } catch (err) {
    report(err);
  }
  self.postMessage({ type: 'done' });
};
