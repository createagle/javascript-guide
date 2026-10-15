// A mini signals library: signal() holds a value, computed() derives one, effect() reacts.
// Dependencies are tracked automatically: whatever a computed or effect reads while it runs.

let running = null;   // the computed or effect that is running right now

function track(subscribers) {
  if (running) {
    subscribers.add(running);
    running.sources.add(subscribers);
  }
}

// Forget the old dependencies before running again: they can change from run to run
function cleanup(node) {
  for (const subscribers of node.sources) subscribers.delete(node);
  node.sources.clear();
}

function run(node, fn) {
  cleanup(node);
  const previous = running;
  running = node;
  try {
    return fn();
  } finally {
    running = previous;
  }
}

export function signal(initial) {
  let value = initial;
  const subscribers = new Set();
  return {
    get value() {
      track(subscribers);
      return value;
    },
    set value(next) {
      if (Object.is(next, value)) return;
      value = next;
      for (const subscriber of [...subscribers]) subscriber.stale();
    },
    peek: () => value,   // read without subscribing
  };
}

// Lazy and cached: runs only when read, and only if something it read has changed
export function computed(fn) {
  let value;
  let dirty = true;
  const subscribers = new Set();
  const node = {
    sources: new Set(),
    stale() {
      if (dirty) return;
      dirty = true;
      for (const subscriber of [...subscribers]) subscriber.stale();
    },
  };
  return {
    get value() {
      track(subscribers);
      if (dirty) {
        value = run(node, fn);
        dirty = false;
      }
      return value;
    },
  };
}

// Effects run once now, then again after their dependencies change.
// Re-runs wait for a microtask, so several changes in a row cause a single re-run.
const queue = new Set();

export function effect(fn) {
  const node = {
    sources: new Set(),
    stale() {
      if (queue.size === 0) queueMicrotask(flush);
      queue.add(node);
    },
    run: () => run(node, fn),
  };
  node.run();
  return () => {   // dispose
    cleanup(node);
    queue.delete(node);
  };
}

function flush() {
  for (const node of queue) {
    queue.delete(node);
    node.run();
  }
}
