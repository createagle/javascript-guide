// Shared by the page and by every tool: a module runs once, so there is one count
export let count = 0;          // importers see every change: exports are live bindings
export function recordUse() {
  count++;
}
