// The same code with JSDoc types: now the mistakes are found before it runs
/**
 * @typedef {object} Item
 * @property {string} name
 * @property {number} price  in dollars
 * @property {number} qty
 */

/**
 * @param {Item[]} items
 * @returns {number}
 */
export function total(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** @type {{ items: Item[] }} */
const cart = { items: [{ name: 'Pen', price: '1.50', qty: 2 }] };
console.log(total(cart.itmes));
