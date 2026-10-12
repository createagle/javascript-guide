// 把页面里的 .playground 元素变成可编辑、可运行的示例。
// 用法：<div class="playground" data-key="唯一ID" data-title="标题"><script type="text/plain">代码</script></div>
import { runCode } from './runner.js';

const STORAGE_PREFIX = 'jsguide:';

// localStorage 在隐私模式等场景可能不可用，所以每次读写都包一层 try/catch。
const store = {
  get(key) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key);
    } catch (err) {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
    } catch (err) {
      /* 忽略：存不下就不存 */
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      /* 忽略 */
    }
  },
};

function h(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// 去掉首尾空行和公共缩进，方便在 HTML 里随意缩进示例代码。
function dedent(text) {
  const lines = text.replace(/^\n+/, '').replace(/\s+$/, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines.map((l) => l.slice(min)).join('\n');
}

function renderTable(data) {
  const table = h('table', 'pg-table');
  const head = h('tr');
  head.append(h('th', '', '(index)'));
  data.columns.forEach((c) => head.append(h('th', '', c)));
  if (data.hasValue) head.append(h('th', '', 'Value'));
  table.append(head);
  data.rows.forEach((row) => {
    const tr = h('tr');
    tr.append(h('td', '', row.index));
    data.columns.forEach((c) => tr.append(h('td', '', row.cells[c] === undefined ? '' : row.cells[c])));
    if (data.hasValue) tr.append(h('td', '', row.value === null ? '' : row.value));
    table.append(tr);
  });
  return table;
}

function setup(root) {
  const key = root.dataset.key;
  const source = root.querySelector('script[type="text/plain"]');
  const original = dedent(source ? source.textContent : '');
  const saved = key ? store.get(key) : null;

  const title = h('span', 'pg-title', root.dataset.title || '示例');
  const badge = h('span', 'pg-badge', '已修改');
  const runBtn = h('button', 'btn btn-primary', '运行');
  const resetBtn = h('button', 'btn', '重置');
  runBtn.type = 'button';
  resetBtn.type = 'button';
  runBtn.title = '快捷键：Ctrl / ⌘ + Enter';

  const bar = h('div', 'pg-bar');
  const left = h('div', 'pg-bar-left');
  left.append(title, badge);
  const right = h('div', 'pg-bar-right');
  right.append(resetBtn, runBtn);
  bar.append(left, right);

  const editor = h('textarea', 'pg-code');
  editor.spellcheck = false;
  editor.setAttribute('autocapitalize', 'off');
  editor.setAttribute('autocomplete', 'off');
  editor.setAttribute('aria-label', (root.dataset.title || '示例') + ' 的代码');
  editor.value = saved !== null ? saved : original;

  const output = h('div', 'pg-out');
  output.setAttribute('aria-live', 'polite');

  root.className = 'pg';
  root.replaceChildren(bar, editor, output);

  const showHint = () => {
    output.replaceChildren(h('div', 'pg-hint', '点击「运行」查看输出'));
  };
  const fit = () => {
    editor.style.height = 'auto';
    editor.style.height = editor.scrollHeight + 2 + 'px';
  };
  const syncBadge = () => {
    root.classList.toggle('modified', editor.value !== original);
  };

  let stop = null;
  let produced = 0;

  const run = () => {
    if (stop) stop();
    output.replaceChildren();
    produced = 0;
    const handlers = {
      onOutput(msg) {
        produced += 1;
        if (msg.level === 'table') {
          const wrap = h('div', 'pg-line pg-table-wrap');
          wrap.append(renderTable(msg.table));
          output.append(wrap);
        } else {
          output.append(h('div', 'pg-line pg-' + msg.level, msg.text));
        }
      },
      onClear() {
        output.replaceChildren();
        produced = 0;
      },
      onDone() {
        if (produced === 0) output.replaceChildren(h('div', 'pg-hint', '（没有输出）'));
      },
    };
    stop = runCode(editor.value, handlers);
  };

  runBtn.addEventListener('click', run);
  resetBtn.addEventListener('click', () => {
    if (stop) stop();
    editor.value = original;
    if (key) store.remove(key);
    syncBadge();
    fit();
    showHint();
  });

  editor.addEventListener('input', () => {
    if (key) {
      if (editor.value === original) store.remove(key);
      else store.set(key, editor.value);
    }
    syncBadge();
    fit();
  });

  // Tab 键插入两个空格；按 Esc 后再按 Tab 可以把焦点移出编辑框，避免键盘用户被困住。
  let trapTab = true;
  editor.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      run();
      return;
    }
    if (event.key === 'Escape') {
      trapTab = false;
      return;
    }
    if (event.key === 'Tab' && trapTab && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const { selectionStart: start, selectionEnd: end, value } = editor;
      editor.value = value.slice(0, start) + '  ' + value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
      editor.dispatchEvent(new Event('input'));
      return;
    }
    if (event.key !== 'Tab') trapTab = true;
  });

  syncBadge();
  fit();
  showHint();
}

document.querySelectorAll('.playground').forEach(setup);
