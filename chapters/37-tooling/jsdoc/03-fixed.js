// Fixed: the price is a number and the property name is spelled right
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
const cart = { items: [{ name: 'Pen', price: 1.5, qty: 2 }] };
console.log(total(cart.items));
