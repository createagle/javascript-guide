// 主线程侧的运行器：启动 Worker、转发输出，并用看门狗限制运行时间和输出量。
const WORKER_URL = new URL('./sandbox-worker.js', import.meta.url);

export const LIMITS = {
  syncMs: 3000, // 3 秒内没有跑完，视为死循环并强制终止
  lifetimeMs: 10000, // Worker 最长存活时间，兜底未清理的 setInterval
  maxLines: 500, // 单次运行最多输出的行数
};

// 运行一段代码。handlers: { onOutput(msg), onClear(), onDone() }。
// 返回一个 stop 函数，用来提前终止本次运行。
export function runCode(code, handlers) {
  const { onOutput, onClear, onDone } = handlers;
  let worker = null;
  let finished = false;
  let lines = 0;
  let syncTimer = 0;
  let lifeTimer = 0;

  const cleanup = () => {
    clearTimeout(syncTimer);
    clearTimeout(lifeTimer);
    if (worker) worker.terminate();
    worker = null;
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    onDone();
  };
  const stopWith = (level, text) => {
    onOutput({ level, text });
    cleanup();
    finish();
  };

  try {
    worker = new Worker(WORKER_URL);
  } catch (err) {
    stopWith('error', '无法启动运行环境：' + err.message);
    return () => {};
  }

  worker.onmessage = (event) => {
    const msg = event.data;
    if (msg.type === 'out') {
      lines += 1;
      if (lines > LIMITS.maxLines) {
        stopWith('warn', `输出超过 ${LIMITS.maxLines} 行，已停止运行`);
        return;
      }
      onOutput(msg);
    } else if (msg.type === 'clear') {
      lines = 0;
      onClear();
    } else if (msg.type === 'done') {
      clearTimeout(syncTimer);
      finish();
    }
  };

  // 只有 Worker 脚本本身加载失败时才会触发（比如直接用 file:// 打开页面）。
  worker.onerror = (event) => {
    if (event.preventDefault) event.preventDefault();
    stopWith('error', '无法启动运行环境。请通过 http(s) 地址访问本页，不要直接双击打开 HTML 文件。');
  };

  syncTimer = setTimeout(() => {
    stopWith('error', `代码运行超过 ${LIMITS.syncMs / 1000} 秒还没有结束，已强制停止（可能写了死循环）`);
  }, LIMITS.syncMs);
  lifeTimer = setTimeout(cleanup, LIMITS.lifetimeMs);

  worker.postMessage({ code });

  return () => {
    cleanup();
    finish();
  };
}
