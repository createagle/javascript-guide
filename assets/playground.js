// JavaScript Complete Guide · code runner
//
// Turns every <div class="playground"> into an editable, runnable code box:
//
//   <div class="playground" data-title="Hello">
//     <script type="text/plain" class="code">console.log('hi');</script>
//     <script type="text/plain" class="tests">test('works', () => assert.ok(true));</script>   (optional)
//   </div>
//
// Options (data-* on the .playground element):
//   data-title       label shown in the toolbar
//   data-mode        "worker" (default): code runs in a Web Worker, no DOM, infinite loops are stopped after 3 s
//                    "dom": code runs as a module in a sandboxed iframe; markup comes from <template class="html">
//   data-layout      "split" puts the output beside the editor on wide screens (default for dom mode)
//   data-autorun     "false" to wait for the Run button (default: run once on load)
//   data-lifetime    seconds a worker may keep running timers after the code finishes (default 15)
//   data-key         storage key for the learner's edits (default: page path + index)
// Several <script class="code" data-name="..."> elements give the toolbar an example picker.
// Write </script> inside code as <\/script>.
//
// Inside the code: console.* works as in a browser; test(name, fn) and assert.* register checks that run after the code;
// consoleOutput holds every printed line as { level, text } for tests to inspect.
// Each element gets a .playground property: { run(), setCode(code, { run }), getCode() }.
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Runtime: installed inside the worker or the sandboxed iframe, never in this page.
  // It replaces console, defines test()/assert and posts every message through `post`.
  // ---------------------------------------------------------------------------
  function runtime(post, scope, isWorker) {
    var MAX_DEPTH = 3;
    var LINE_WIDTH = 72;

    function quote(s) {
      return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\t/g, '\\t') + "'";
    }
    function keyName(k) {
      if (typeof k === 'symbol') return '[' + k.toString() + ']';
      return /^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k);
    }
    function tagOf(value) {
      var tag = Object.prototype.toString.call(value).slice(8, -1);
      return tag;
    }
    function ctorName(value) {
      try {
        var proto = Object.getPrototypeOf(value);
        if (proto === null) return null;
        var c = proto.constructor;
        return typeof c === 'function' && c.name ? c.name : '';
      } catch (e) {
        return '';
      }
    }
    function isClass(fn) {
      try {
        return /^class[\s{]/.test(Function.prototype.toString.call(fn));
      } catch (e) {
        return false;
      }
    }
    // Joins entries on one line when they fit, otherwise one per line with indentation.
    function wrap(open, items, close, indent) {
      if (!items.length) return open + close;
      var one = open + ' ' + items.join(', ') + ' ' + close;
      if (one.length + indent.length <= LINE_WIDTH && one.indexOf('\n') === -1) return one;
      var inner = indent + '  ';
      return open + '\n' + inner + items.join(',\n' + inner) + '\n' + indent + close;
    }

    // Formats any value the way a browser console would (close to Node's util.inspect).
    function inspect(value, depth, seen, top, indent) {
      indent = indent || '';
      var type = typeof value;
      if (type === 'string') return top ? value : quote(value);
      if (type === 'number') return Object.is(value, -0) ? '-0' : String(value);
      if (type === 'boolean' || type === 'undefined') return String(value);
      if (type === 'bigint') return value + 'n';
      if (type === 'symbol') return value.toString();
      if (value === null) return 'null';
      if (type === 'function') {
        if (isClass(value)) return '[class ' + (value.name || '(anonymous)') + ']';
        return '[Function: ' + (value.name || '(anonymous)') + ']';
      }
      if (seen.indexOf(value) !== -1) return '[Circular]';
      if (value instanceof Error) {
        var text = (value.name || 'Error') + ': ' + value.message;
        if (value.cause !== undefined && depth < MAX_DEPTH) {
          text += ' { [cause]: ' + inspect(value.cause, depth + 1, seen.concat([value]), false, indent) + ' }';
        }
        if (typeof AggregateError === 'function' && value instanceof AggregateError && Array.isArray(value.errors)) {
          text += ' [errors: ' + value.errors.map(function (e) { return inspect(e, depth + 1, seen, false, indent); }).join(', ') + ']';
        }
        return text;
      }
      // DOM nodes print as markup, the way browser consoles show them
      if (typeof value.nodeType === 'number' && typeof value.nodeName === 'string') {
        if (value.nodeType === 1) {
          var attrs = Array.prototype.map.call(value.attributes || [], function (a) { return ' ' + a.name + '="' + a.value + '"'; }).join('');
          return '<' + value.nodeName.toLowerCase() + attrs + '>';
        }
        if (value.nodeType === 3) return '#text ' + quote(value.data);
        if (value.nodeType === 8) return '<!--' + value.data + '-->';
        return value.nodeName;
      }
      var tag = tagOf(value);
      if (tag === 'NodeList' || tag === 'HTMLCollection') {
        return tag + '(' + value.length + ') [' + Array.prototype.map.call(value, function (n) { return inspect(n, depth + 1, seen, false, indent); }).join(', ') + ']';
      }
      if (tag === 'Date') return isNaN(value) ? 'Invalid Date' : value.toISOString();
      if (tag === 'RegExp') return String(value);
      if (tag === 'Promise') return 'Promise { … }';
      if (tag === 'WeakMap' || tag === 'WeakSet' || tag === 'WeakRef') return tag + ' { <items unknown> }';
      if (tag === 'Number' || tag === 'String' || tag === 'Boolean') return '[' + tag + ': ' + inspect(value.valueOf(), depth, seen, false) + ']';
      if (tag === 'ArrayBuffer' || tag === 'SharedArrayBuffer') return tag + ' { byteLength: ' + value.byteLength + ' }';
      if (depth >= MAX_DEPTH) return Array.isArray(value) ? '[Array]' : '[' + (ctorName(value) || 'Object') + ']';

      var next = function (v) { return inspect(v, depth + 1, seen.concat([value]), false, indent + '  '); };
      try {
        if (Array.isArray(value) || ArrayBuffer.isView(value) && !(value instanceof DataView)) {
          var items = [];
          var len = value.length;
          var holes = 0;
          for (var i = 0; i < len && items.length < 100; i++) {
            if (!(i in value)) { holes++; continue; }
            if (holes) { items.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>'); holes = 0; }
            items.push(next(value[i]));
          }
          if (holes) items.push('<' + holes + ' empty item' + (holes > 1 ? 's' : '') + '>');
          if (len > 100) items.push('... ' + (len - 100) + ' more items');
          var prefix = Array.isArray(value) ? (ctorName(value) !== 'Array' && ctorName(value) ? ctorName(value) + '(' + len + ') ' : '') : tag + '(' + len + ') ';
          return prefix + wrap('[', items, ']', indent);
        }
        if (tag === 'Map') {
          var mapItems = [];
          value.forEach(function (v, k) { mapItems.push(next(k) + ' => ' + next(v)); });
          return 'Map(' + value.size + ') ' + wrap('{', mapItems, '}', indent);
        }
        if (tag === 'Set') {
          var setItems = [];
          value.forEach(function (v) { setItems.push(next(v)); });
          return 'Set(' + value.size + ') ' + wrap('{', setItems, '}', indent);
        }
        var name = ctorName(value);
        var head = name === null ? '[Object: null prototype] ' : name && name !== 'Object' ? name + ' ' : '';
        if (!name && name !== null && tag !== 'Object') head = 'Object [' + tag + '] ';
        else if (name && tag !== 'Object' && tag !== name) head = name + ' [' + tag + '] ';
        var keys = Object.keys(value).concat(Object.getOwnPropertySymbols(value).filter(function (s) {
          return Object.getOwnPropertyDescriptor(value, s).enumerable;
        }));
        var props = keys.map(function (k) {
          var d = Object.getOwnPropertyDescriptor(value, k);
          if (d && (d.get || d.set)) return keyName(k) + ': [' + (d.get && d.set ? 'Getter/Setter' : d.get ? 'Getter' : 'Setter') + ']';
          return keyName(k) + ': ' + next(value[k]);
        });
        return head + wrap('{', props, '}', indent);
      } catch (err) {
        return '[' + (ctorName(value) || 'Object') + ']';
      }
    }

    function show(v) { return inspect(v, 0, [], true, ''); }

    // console.log('%s is %d', 'x', 1) style substitutions
    function format(args) {
      args = Array.prototype.slice.call(args);
      var out = [];
      if (typeof args[0] === 'string' && args[0].indexOf('%') !== -1 && args.length > 1) {
        var fmt = args.shift();
        var str = fmt.replace(/%([sdifoOc%])/g, function (m, k) {
          if (k === '%') return '%';
          if (!args.length) return m;
          var a = args.shift();
          if (k === 's') return typeof a === 'string' ? a : show(a);
          if (k === 'd' || k === 'i') return typeof a === 'bigint' ? a + 'n' : String(k === 'i' ? parseInt(a, 10) : Number(a));
          if (k === 'f') return String(parseFloat(a));
          if (k === 'c') return '';
          return inspect(a, 0, [], false, '');
        });
        out.push(str);
      }
      for (var i = 0; i < args.length; i++) out.push(show(args[i]));
      return out.join(' ');
    }

    var depth = 0;
    var counts = Object.create(null);
    var timers = Object.create(null);
    // Everything printed is also kept in consoleOutput, so tests can check what the code logged
    var consoleOutput = [];
    scope.consoleOutput = consoleOutput;
    function line(level, text) {
      consoleOutput.push({ level: level, text: text });
      post({ type: 'out', level: level, text: text, depth: depth });
    }

    function buildTable(data, columnsFilter) {
      if (data === null || typeof data !== 'object') return null;
      var entries = [];
      if (data instanceof Map) data.forEach(function (v, k) { entries.push([show(k), v]); });
      else if (Array.isArray(data)) data.forEach(function (v, i) { entries.push([String(i), v]); });
      else Object.keys(data).forEach(function (k) { entries.push([k, data[k]]); });
      var columns = [];
      var hasValue = false;
      var rows = entries.map(function (pair) {
        var v = pair[1];
        var cells = {};
        var val = null;
        if (v !== null && typeof v === 'object') {
          Object.keys(v).forEach(function (k) {
            if (columnsFilter && columnsFilter.indexOf(k) === -1) return;
            if (columns.indexOf(k) === -1) columns.push(k);
            cells[k] = inspect(v[k], 2, [], false, '');
          });
        } else {
          hasValue = true;
          val = inspect(v, 2, [], false, '');
        }
        return { index: pair[0], cells: cells, value: val };
      });
      return { columns: columns, hasValue: hasValue, rows: rows };
    }

    var fakeConsole = {
      log: function () { line('log', format(arguments)); },
      info: function () { line('info', format(arguments)); },
      debug: function () { line('log', format(arguments)); },
      warn: function () { line('warn', format(arguments)); },
      error: function () { line('error', format(arguments)); },
      dir: function (v) { line('log', inspect(v, 0, [], false, '')); },
      trace: function () { line('log', 'Trace' + (arguments.length ? ': ' + format(arguments) : '')); },
      assert: function (cond) {
        if (!cond) line('error', 'Assertion failed' + (arguments.length > 1 ? ': ' + format(Array.prototype.slice.call(arguments, 1)) : ''));
      },
      table: function (data, cols) {
        var table = buildTable(data, cols);
        if (table) post({ type: 'out', level: 'table', table: table, depth: depth });
        else line('log', format([data]));
      },
      group: function () { line('group', arguments.length ? format(arguments) : 'console.group'); depth++; },
      groupCollapsed: function () { line('group', arguments.length ? format(arguments) : 'console.group'); depth++; },
      groupEnd: function () { if (depth > 0) depth--; },
      count: function (label) {
        label = label === undefined ? 'default' : String(label);
        counts[label] = (counts[label] || 0) + 1;
        line('log', label + ': ' + counts[label]);
      },
      countReset: function (label) { counts[label === undefined ? 'default' : String(label)] = 0; },
      time: function (label) { timers[label === undefined ? 'default' : String(label)] = performance.now(); },
      timeLog: function (label) {
        label = label === undefined ? 'default' : String(label);
        if (label in timers) line('log', label + ': ' + (performance.now() - timers[label]).toFixed(3) + ' ms');
      },
      timeEnd: function (label) {
        label = label === undefined ? 'default' : String(label);
        if (label in timers) {
          line('log', label + ': ' + (performance.now() - timers[label]).toFixed(3) + ' ms');
          delete timers[label];
        }
      },
      clear: function () { depth = 0; post({ type: 'clear' }); },
    };
    try {
      Object.defineProperty(scope, 'console', { value: fakeConsole, configurable: true, writable: true });
    } catch (e) {
      scope.console = fakeConsole;
    }

    // ---- test() and assert --------------------------------------------------
    var tests = [];
    function AssertionError(message) {
      var e = new Error(message);
      e.name = 'AssertionError';
      return e;
    }
    function same(a, b) { return a === b || (a !== a && b !== b); }
    function deepEqual(a, b, seenPairs) {
      if (same(a, b)) return true;
      if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
      if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
      seenPairs = seenPairs || [];
      for (var s = 0; s < seenPairs.length; s++) if (seenPairs[s][0] === a && seenPairs[s][1] === b) return true;
      seenPairs.push([a, b]);
      if (a instanceof Date) return a.getTime() === b.getTime();
      if (a instanceof RegExp) return String(a) === String(b);
      if (a instanceof Map) {
        if (a.size !== b.size) return false;
        var okMap = true;
        a.forEach(function (v, k) { if (!b.has(k) || !deepEqual(v, b.get(k), seenPairs)) okMap = false; });
        return okMap;
      }
      if (a instanceof Set) {
        if (a.size !== b.size) return false;
        var okSet = true;
        a.forEach(function (v) { if (!b.has(v)) okSet = false; });
        return okSet;
      }
      var ka = Object.keys(a);
      var kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (var i = 0; i < ka.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(b, ka[i])) return false;
        if (!deepEqual(a[ka[i]], b[ka[i]], seenPairs)) return false;
      }
      return true;
    }
    function brief(v) { return inspect(v, 1, [], false, ''); }
    function matchesError(err, expected) {
      if (expected === undefined) return true;
      if (typeof expected === 'function') return err instanceof expected;
      if (expected instanceof RegExp) return expected.test(err && err.message !== undefined ? err.message : String(err));
      if (typeof expected === 'string') return err && err.message === expected;
      return true;
    }
    var assert = {
      ok: function (value, message) {
        if (!value) throw AssertionError(message || 'Expected a truthy value, but got ' + brief(value));
      },
      equal: function (actual, expected, message) {
        if (!same(actual, expected)) throw AssertionError(message || 'Expected ' + brief(expected) + ', but got ' + brief(actual));
      },
      notEqual: function (actual, expected, message) {
        if (same(actual, expected)) throw AssertionError(message || 'Expected a value other than ' + brief(expected));
      },
      deepEqual: function (actual, expected, message) {
        if (!deepEqual(actual, expected)) throw AssertionError(message || 'Expected ' + brief(expected) + ', but got ' + brief(actual));
      },
      match: function (string, regexp, message) {
        if (!regexp.test(string)) throw AssertionError(message || 'Expected ' + brief(string) + ' to match ' + String(regexp));
      },
      throws: function (fn, expected, message) {
        try {
          fn();
        } catch (err) {
          if (!matchesError(err, expected)) throw AssertionError(message || 'It threw ' + brief(err) + ', which is not the expected error');
          return err;
        }
        throw AssertionError(message || 'Expected the function to throw, but it returned normally');
      },
      rejects: function (promiseOrFn, expected, message) {
        var p;
        try {
          p = Promise.resolve(typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn);
        } catch (err) {
          p = Promise.reject(err);
        }
        return p.then(function () {
          throw AssertionError(message || 'Expected the promise to reject, but it fulfilled');
        }, function (err) {
          if (!matchesError(err, expected)) throw AssertionError(message || 'It rejected with ' + brief(err) + ', which is not the expected error');
          return err;
        });
      },
    };
    scope.test = function (name, fn) { tests.push({ name: String(name), fn: fn }); };
    scope.assert = assert;

    function runTests() {
      if (!tests.length) return Promise.resolve();
      var list = tests.slice();
      tests.length = 0;
      var chain = Promise.resolve();
      list.forEach(function (t) {
        chain = chain.then(function () {
          return Promise.resolve().then(t.fn).then(function () {
            post({ type: 'test', name: t.name, ok: true });
          }, function (err) {
            var msg = err && err.name === 'AssertionError' ? err.message : err instanceof Error ? err.name + ': ' + err.message : 'Threw ' + brief(err);
            post({ type: 'test', name: t.name, ok: false, message: msg });
          });
        });
      });
      return chain;
    }

    // Where in the learner's code did an error happen? Best effort, from the stack trace.
    var lineOffset = 0;
    function where(err) {
      var stack = err && typeof err.stack === 'string' ? err.stack : '';
      var m = stack.match(/(?:<anonymous>|AsyncFunction|about:srcdoc):(\d+):(\d+)/);
      if (!m) return '';
      var n = Number(m[1]) - lineOffset;
      return n > 0 ? ' (line ' + n + ')' : '';
    }
    function report(err, prefix) {
      if (err instanceof Error) {
        var text = (prefix || 'Uncaught ') + err.name + ': ' + err.message + where(err);
        if (err.cause !== undefined) text += '\n  [cause]: ' + brief(err.cause);
        line('error', text);
      } else {
        line('error', (prefix || 'Uncaught ') + brief(err));
      }
    }

    scope.addEventListener('error', function (event) {
      event.preventDefault();
      if (event.error) report(event.error);
      else if (isWorker) line('error', 'Uncaught ' + event.message);
      else line('error', event.message + (event.lineno ? ' (line ' + (event.lineno - lineOffset) + ')' : ''));
      if (!isWorker) finish();
    });
    scope.addEventListener('unhandledrejection', function (event) {
      event.preventDefault();
      report(event.reason, 'Uncaught (in promise) ');
    });

    // Track timers and fetches so the runner knows when nothing is left to wait for.
    var active = 0;
    var finished = false;
    var idleTimer = null;
    var realSetTimeout = scope.setTimeout.bind(scope);
    var realClearTimeout = scope.clearTimeout.bind(scope);
    var realSetInterval = scope.setInterval.bind(scope);
    var realClearInterval = scope.clearInterval.bind(scope);
    var pendingTimeouts = Object.create(null);
    var pendingIntervals = Object.create(null);
    function checkIdle() {
      if (!finished || active > 0) return;
      if (idleTimer !== null) realClearTimeout(idleTimer);
      idleTimer = realSetTimeout(function () {
        if (finished && active === 0) post({ type: 'idle' });
      }, 300);
    }
    if (isWorker) {
      scope.setTimeout = function (fn) {
        var args = Array.prototype.slice.call(arguments, 2);
        var id = realSetTimeout(function () {
          if (pendingTimeouts[id]) { delete pendingTimeouts[id]; active--; }
          try {
            if (typeof fn === 'function') fn.apply(scope, args);
          } finally {
            checkIdle();
          }
        }, arguments[1]);
        pendingTimeouts[id] = true;
        active++;
        return id;
      };
      scope.clearTimeout = function (id) {
        if (pendingTimeouts[id]) { delete pendingTimeouts[id]; active--; checkIdle(); }
        realClearTimeout(id);
      };
      scope.setInterval = function () {
        var id = realSetInterval.apply(scope, arguments);
        pendingIntervals[id] = true;
        active++;
        return id;
      };
      scope.clearInterval = function (id) {
        if (pendingIntervals[id]) { delete pendingIntervals[id]; active--; checkIdle(); }
        realClearInterval(id);
      };
      if (typeof scope.fetch === 'function') {
        var realFetch = scope.fetch.bind(scope);
        scope.fetch = function () {
          active++;
          return realFetch.apply(scope, arguments).finally(function () { active--; checkIdle(); });
        };
      }
      // Heartbeat: if it stops, the code is stuck in a loop
      realSetInterval(function () { post({ type: 'tick' }); }, 250);
    }

    function finish() {
      if (finished) return;
      finished = true;
      runTests().then(function () {
        post({ type: 'done' });
        checkIdle();
      });
    }

    return {
      setLineOffset: function (n) { lineOffset = n; },
      report: report,
      finish: finish,
    };
  }

  // Worker entry: receives { code } once, runs it as the body of an async function.
  function workerMain() {
    var rt = runtime(function (msg) { self.postMessage(msg); }, self, true);
    var AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    self.onmessage = function (event) {
      var code = String(event.data && event.data.code || '');
      var fn;
      try {
        // "use strict" turns a misspelled variable into an error instead of a silent global.
        // The async wrapper lets the code use await at the top level.
        fn = new AsyncFunction('"use strict";\n' + code);
      } catch (err) {
        rt.report(err);
        self.postMessage({ type: 'done' });
        self.postMessage({ type: 'idle' });
        return;
      }
      // Lines added in front of the code: "async function anonymous(", ") {", "\"use strict\";"
      rt.setLineOffset(3);
      fn().then(rt.finish, function (err) {
        rt.report(err);
        rt.finish();
      });
    };
  }

  // ---------------------------------------------------------------------------
  // Page side
  // ---------------------------------------------------------------------------
  var scriptURL = document.currentScript ? document.currentScript.src : location.href;
  var styleURL = new URL('style.css', scriptURL).href;
  var workerURL = null;
  function getWorkerURL() {
    if (!workerURL) {
      var src = runtime.toString() + '\n(' + workerMain.toString() + ')();';
      workerURL = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    }
    return workerURL;
  }

  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked: edits are not kept */ } },
    remove: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Strip the common indentation and the blank lines around code written inside HTML.
  function dedent(text) {
    var lines = text.replace(/<\\\/script>/g, '</script>').replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
    var indents = lines.filter(function (l) { return l.trim(); }).map(function (l) { return l.match(/^ */)[0].length; });
    var min = indents.length ? Math.min.apply(null, indents) : 0;
    return lines.map(function (l) { return l.slice(min); }).join('\n');
  }

  // ---- Syntax highlighting -----------------------------------------------
  var KEYWORDS = new Set(('await break case catch class const continue debugger default delete do else export extends ' +
    'finally for from function if import in instanceof let new of return static super switch this throw try typeof var ' +
    'void while with yield async get set using').split(' '));
  var LITERALS = new Set('true false null undefined NaN Infinity'.split(' '));
  var REGEX_BEFORE = /(^|[=(,:;!&|?{}[\]+\-*%<>~^]|\breturn|\btypeof|\bcase|\bdo|\belse|\bin|\bof|\byield|\bawait)\s*$/;
  function escapeHTML(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function span(cls, text) { return '<span class="tok-' + cls + '">' + escapeHTML(text) + '</span>'; }
  function highlight(code) {
    var out = '';
    var i = 0;
    var n = code.length;
    var before = '';
    while (i < n) {
      var c = code[i];
      var rest = code.slice(i);
      var m;
      if (c === '/' && code[i + 1] === '/') {
        var end = code.indexOf('\n', i);
        if (end === -1) end = n;
        out += span('comment', code.slice(i, end));
        i = end;
        continue;
      }
      if (c === '/' && code[i + 1] === '*') {
        var close = code.indexOf('*/', i + 2);
        close = close === -1 ? n : close + 2;
        out += span('comment', code.slice(i, close));
        i = close;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') {
        var j = i + 1;
        while (j < n && code[j] !== c) {
          if (code[j] === '\\') j++;
          else if (c !== '`' && code[j] === '\n') break;
          j++;
        }
        j = Math.min(j + 1, n);
        out += span('string', code.slice(i, j));
        before = 'x';
        i = j;
        continue;
      }
      if (c === '/' && REGEX_BEFORE.test(before) && (m = rest.match(/^\/(?![*/])(?:\\.|\[(?:\\.|[^\]\n])*\]|[^/\\\n])+\/[dgimsuyv]*/))) {
        out += span('string', m[0]);
        before = 'x';
        i += m[0].length;
        continue;
      }
      if ((m = rest.match(/^(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?/)) && !/[\w$]/.test(code[i - 1] || '')) {
        out += span('number', m[0]);
        before = 'x';
        i += m[0].length;
        continue;
      }
      if ((m = rest.match(/^[A-Za-z_$#][\w$]*/))) {
        var word = m[0];
        var prevChar = code[i - 1] || '';
        if (prevChar !== '.' && KEYWORDS.has(word)) out += span('keyword', word);
        else if (prevChar !== '.' && LITERALS.has(word)) out += span('literal', word);
        else if (/^\s*\(/.test(code.slice(i + word.length))) out += span('fn', word);
        else out += escapeHTML(word);
        before = KEYWORDS.has(word) ? word : 'x';
        i += word.length;
        continue;
      }
      out += escapeHTML(c);
      if (!/\s/.test(c)) before += c;
      if (before.length > 20) before = before.slice(-20);
      i++;
    }
    // A trailing newline needs a character after it, or the <pre> is one line shorter than the textarea
    return out + (code.slice(-1) === '\n' || !code ? ' ' : '');
  }

  // ---- Editing helpers ------------------------------------------------------
  function insertText(textarea, text) {
    textarea.focus();
    // execCommand keeps the browser's undo history; setRangeText is the fallback
    var ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
    if (!ok) {
      textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function renderTable(data) {
    var table = el('table', 'pg-table');
    var head = el('tr');
    head.append(el('th', '', '(index)'));
    data.columns.forEach(function (c) { head.append(el('th', '', c)); });
    if (data.hasValue) head.append(el('th', '', 'Value'));
    table.append(head);
    data.rows.forEach(function (row) {
      var tr = el('tr');
      tr.append(el('td', '', row.index));
      data.columns.forEach(function (c) { tr.append(el('td', '', row.cells[c] === undefined ? '' : row.cells[c])); });
      if (data.hasValue) tr.append(el('td', '', row.value === null ? '' : row.value));
      table.append(tr);
    });
    return table;
  }

  var MAX_LINES = 1000;
  var STUCK_MS = 3000;

  function setup(root, index) {
    var mode = root.dataset.mode === 'dom' ? 'dom' : 'worker';
    var layout = root.dataset.layout || (mode === 'dom' ? 'split' : 'stack');
    var lifetime = Number(root.dataset.lifetime || 15) * 1000;
    var codeEls = Array.prototype.slice.call(root.querySelectorAll('script.code, script[type="text/plain"]:not(.tests)'));
    var examples = codeEls.map(function (s, i) { return { name: s.dataset.name || 'Example ' + (i + 1), code: dedent(s.textContent) }; });
    if (!examples.length) examples.push({ name: 'Example', code: '' });
    var testsEl = root.querySelector('script.tests');
    var tests = testsEl ? dedent(testsEl.textContent) : '';
    var htmlEl = root.querySelector('template.html');
    var html = htmlEl ? htmlEl.innerHTML : '';
    var baseKey = 'jsguide:' + (root.dataset.key || location.pathname + '#' + index);
    var current = 0;
    var keyFor = function (i) { return baseKey + (examples.length > 1 ? ':' + i : ''); };

    // ---- Build the UI ----
    var box = el('div', 'pg');
    var bar = el('div', 'pg-bar');
    var left = el('div');
    var title = el('span', 'pg-title', root.dataset.title || 'Code');
    var badge = el('span', 'pg-badge', 'edited');
    badge.hidden = true;
    left.append(title, badge);
    var actions = el('div', 'pg-actions');
    var status = el('span', 'pg-status');
    status.setAttribute('aria-live', 'polite');
    var picker = null;
    if (examples.length > 1) {
      picker = el('select', 'btn');
      picker.setAttribute('aria-label', 'Example');
      examples.forEach(function (ex, i) {
        var opt = el('option', '', ex.name);
        opt.value = String(i);
        picker.append(opt);
      });
    }
    var resetBtn = el('button', 'btn', 'Reset');
    resetBtn.type = 'button';
    resetBtn.title = 'Restore the original code';
    var runBtn = el('button', 'btn btn-primary', 'Run');
    runBtn.type = 'button';
    runBtn.title = 'Run (Ctrl / ⌘ + Enter)';
    actions.append(status);
    if (picker) actions.append(picker);
    actions.append(resetBtn, runBtn);
    bar.append(left, actions);

    var body = el('div', 'pg-body' + (layout === 'split' ? ' split' : ''));
    var editor = el('div', 'pg-editor');
    var pre = el('pre', 'pg-highlight');
    pre.setAttribute('aria-hidden', 'true');
    var textarea = el('textarea', 'pg-input');
    textarea.spellcheck = false;
    textarea.rows = 1;
    textarea.setAttribute('autocapitalize', 'off');
    textarea.setAttribute('autocomplete', 'off');
    textarea.setAttribute('autocorrect', 'off');
    textarea.setAttribute('aria-label', 'Code editor: ' + (root.dataset.title || 'code') + '. Press Escape, then Tab, to leave the editor.');
    editor.append(pre, textarea);

    var side = el('div', 'pg-side');
    var frameHost = null;
    if (mode === 'dom') {
      frameHost = el('div');
      side.append(frameHost);
    }
    var output = el('div', 'pg-output');
    output.setAttribute('role', 'log');
    output.setAttribute('aria-label', 'Console output');
    var testsBox = el('div', 'pg-tests');
    testsBox.hidden = true;
    testsBox.setAttribute('aria-live', 'polite');
    side.append(output, testsBox);
    body.append(editor, side);
    box.append(bar, body);
    root.replaceChildren(box);
    if (root.dataset.height) box.style.setProperty('--pg-result-height', root.dataset.height + 'px');

    function refresh() {
      pre.innerHTML = highlight(textarea.value);
      var edited = textarea.value !== examples[current].code;
      badge.hidden = !edited;
      resetBtn.disabled = !edited;
    }
    function load(i) {
      current = i;
      var saved = store.get(keyFor(i));
      textarea.value = saved !== null ? saved : examples[i].code;
      refresh();
    }

    // ---- Output ----
    var lines = 0;
    var pending = document.createDocumentFragment();
    var flushQueued = false;
    function flush() {
      flushQueued = false;
      var empty = output.querySelector('.pg-empty');
      if (empty && pending.childNodes.length) empty.remove();
      output.append(pending);
      pending = document.createDocumentFragment();
      output.scrollTop = output.scrollHeight;
    }
    function queue(node) {
      pending.append(node);
      if (!flushQueued) {
        flushQueued = true;
        requestAnimationFrame(flush);
      }
    }
    function addLine(level, text, depth) {
      var row = el('div', 'pg-line ' + level, text);
      if (depth) row.style.setProperty('--depth', depth);
      queue(row);
    }
    function clearOutput() {
      output.replaceChildren(el('div', 'pg-empty', 'No output yet'));
      pending = document.createDocumentFragment();
      lines = 0;
    }
    var passed = 0;
    var total = 0;
    var summary = el('div', 'pg-tests-summary');
    function clearTests() {
      passed = 0;
      total = 0;
      testsBox.replaceChildren(summary);
      testsBox.hidden = true;
    }
    function addTest(msg) {
      total++;
      if (msg.ok) passed++;
      var row = el('div', 'pg-test ' + (msg.ok ? 'pass' : 'fail'), (msg.ok ? '✓ ' : '✗ ') + msg.name);
      if (!msg.ok && msg.message) row.append(el('span', 'why', msg.message));
      testsBox.append(row);
      summary.textContent = passed + ' / ' + total + ' tests passed';
      summary.className = 'pg-tests-summary ' + (passed === total ? 'good' : 'bad');
      testsBox.hidden = false;
    }

    // ---- Running ----
    var session = null;
    function stop() {
      if (!session) return;
      session.stop();
      session = null;
    }
    function handle(msg, s) {
      if (s !== session) return;
      if (msg.type === 'out') {
        lines++;
        if (lines > MAX_LINES) {
          if (lines === MAX_LINES + 1) addLine('system', 'Output passed ' + MAX_LINES + ' lines, so the run was stopped.');
          if (s.worker) { s.stop(); setStatus('Stopped'); }
          return;
        }
        if (msg.level === 'table') {
          var wrapRow = el('div', 'pg-line');
          if (msg.depth) wrapRow.style.setProperty('--depth', msg.depth);
          wrapRow.append(renderTable(msg.table));
          queue(wrapRow);
        } else {
          addLine(msg.level, msg.text, msg.depth);
        }
      } else if (msg.type === 'clear') {
        flush();
        clearOutput();
      } else if (msg.type === 'test') {
        addTest(msg);
      } else if (msg.type === 'done') {
        s.done = true;
        setStatus('Done in ' + Math.round(performance.now() - s.started) + ' ms');
        root.dispatchEvent(new CustomEvent('pg:done', { detail: { passed: passed, total: total } }));
      } else if (msg.type === 'idle') {
        if (s.worker) s.stop();
      }
    }
    function setStatus(text) { status.textContent = text; }

    function runWorker(code) {
      var worker;
      try {
        worker = new Worker(getWorkerURL());
      } catch (err) {
        addLine('error', 'The runner could not start a Web Worker: ' + err.message);
        return null;
      }
      var s = { worker: worker, started: performance.now(), done: false, beat: performance.now() };
      var watch = setInterval(function () {
        if (performance.now() - s.beat > STUCK_MS) {
          addLine('error', 'Stopped: the code ran for ' + STUCK_MS / 1000 + ' s without a break. Is there an infinite loop?');
          setStatus('Stopped');
          s.stop();
        } else if (performance.now() - s.started > lifetime) {
          addLine('system', 'Stopped after ' + lifetime / 1000 + ' s: ' +
            (s.done ? 'timers were still running.' : 'the code was still waiting on an await that never settled.'));
          setStatus('Stopped');
          s.stop();
        }
      }, 250);
      s.stop = function () {
        clearInterval(watch);
        worker.terminate();
        if (session === s) session = null;
      };
      worker.onmessage = function (event) {
        s.beat = performance.now();
        handle(event.data, s);
      };
      worker.onerror = function (event) {
        event.preventDefault();
        addLine('error', 'The runner failed to start. Open this page over http(s), not as a local file.');
        s.stop();
      };
      worker.postMessage({ code: code + (tests ? '\n;\n' + tests : '') });
      return s;
    }

    function runDom(code) {
      var frame = document.createElement('iframe');
      frame.className = 'pg-result';
      frame.title = 'Result';
      frame.setAttribute('sandbox', 'allow-scripts allow-modals allow-forms allow-popups');
      var theme = document.documentElement.dataset.theme;
      var full = code + (tests ? '\n;\n' + tests : '');
      var head = '<!doctype html><html' + (theme ? ' data-theme="' + theme + '"' : '') + '><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<link rel="stylesheet" href="' + styleURL + '"><style>body{padding:12px}</style>' +
        '<script>' + runtime.toString().replace(/<\/script/gi, '<\\/script') +
        '\nwindow.__pg = runtime(function (m) { parent.postMessage(Object.assign({ __pg: true }, m), "*"); }, window, false);' +
        'window.__pg.setLineOffset(@@OFFSET@@);<\/script>' +
        '</head><body>' + html + '\n<script type="module">\n';
      // The module's line numbers count from the top of the document; the learner's code starts after `head`
      head = head.replace('@@OFFSET@@', String(head.split('\n').length - 1));
      var srcdoc = head + full.replace(/<\/script/gi, '<\\/script') + '\n;window.__pg.finish();\n<\/script></body></html>';
      var s = { dom: true, frame: frame, started: performance.now(), done: false };
      s.stop = function () {
        window.removeEventListener('message', s.listener);
        if (session === s) session = null;
      };
      s.listener = function (event) {
        if (event.source !== frame.contentWindow || !event.data || !event.data.__pg) return;
        if (session !== s) return;
        handle(event.data, s);
      };
      window.addEventListener('message', s.listener);
      frameHost.replaceChildren(frame);
      frame.srcdoc = srcdoc;
      return s;
    }

    function run() {
      stop();
      flush();
      clearOutput();
      clearTests();
      setStatus('Running…');
      var code = textarea.value;
      session = mode === 'dom' ? runDom(code) : runWorker(code);
    }

    // ---- Events ----
    var saveTimer = 0;
    textarea.addEventListener('input', function () {
      refresh();
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () {
        if (textarea.value === examples[current].code) store.remove(keyFor(current));
        else store.set(keyFor(current), textarea.value);
      }, 300);
    });
    var tabLeaves = false;
    textarea.addEventListener('focus', function () { tabLeaves = false; });
    textarea.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
        return;
      }
      if (e.key === 'Escape') { tabLeaves = true; return; }
      if (e.key === 'Tab' && !tabLeaves && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        var v = textarea.value;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var lineStart = v.lastIndexOf('\n', start - 1) + 1;
        if (start === end && !e.shiftKey) {
          insertText(textarea, '  ');
          return;
        }
        // Indent or outdent every selected line
        var block = v.slice(lineStart, end);
        var changed = e.shiftKey ? block.replace(/^ {1,2}/gm, '') : block.replace(/^/gm, '  ');
        textarea.setSelectionRange(lineStart, end);
        insertText(textarea, changed);
        textarea.setSelectionRange(lineStart, lineStart + changed.length);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        var val = textarea.value;
        var pos = textarea.selectionStart;
        var ls = val.lastIndexOf('\n', pos - 1) + 1;
        var indent = val.slice(ls).match(/^ */)[0];
        if (indent.length > pos - ls) indent = indent.slice(0, pos - ls);
        var prev = val.slice(ls, pos).trimEnd();
        if (/[{[(]$/.test(prev)) indent += '  ';
        e.preventDefault();
        insertText(textarea, '\n' + indent);
      }
      tabLeaves = false;
    });
    runBtn.addEventListener('click', run);
    resetBtn.addEventListener('click', function () {
      textarea.value = examples[current].code;
      store.remove(keyFor(current));
      refresh();
      run();
    });
    if (picker) {
      picker.addEventListener('change', function () {
        load(Number(picker.value));
        run();
      });
    }

    root.playground = {
      run: run,
      getCode: function () { return textarea.value; },
      setCode: function (code, opts) {
        textarea.value = code;
        refresh();
        if (!opts || opts.run !== false) run();
      },
    };

    load(0);
    clearOutput();
    clearTests();
    if (root.dataset.autorun !== 'false') run();
    else setStatus('Press Run');
  }

  function init() {
    var roots = document.querySelectorAll('.playground');
    for (var i = 0; i < roots.length; i++) setup(roots[i], i);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
