// No type annotations: TypeScript can only guess
export function total(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

const cart = { items: [{ name: 'Pen', price: '1.50', qty: 2 }] };
console.log(total(cart.itmes));
