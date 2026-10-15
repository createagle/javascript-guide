// <entry-form>: asks for one entry and announces it with an 'entry-submit' event. It does not save anything itself.
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, parseAmount, today } from '../money.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    form { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr)); gap: 10px 12px; }
    fieldset { grid-column: 1 / -1; display: flex; gap: 16px; border: 0; margin: 0; padding: 0; }
    legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    label { display: grid; gap: 4px; font-size: 13px; color: var(--muted); }
    fieldset label { display: flex; align-items: center; gap: 6px; font-size: 14px; color: var(--fg); }
    input, select { font: inherit; font-size: 15px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--fg); min-width: 0; }
    input:user-invalid { border-color: var(--bad); }
    .note { grid-column: 1 / -1; }
    button { grid-column: 1 / -1; font: inherit; font-weight: 600; padding: 8px; border: 0; border-radius: 8px; background: var(--accent); color: var(--accent-fg); cursor: pointer; }
    button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  </style>
  <form novalidate>
    <fieldset>
      <legend>Type</legend>
      <label><input type="radio" name="type" value="expense" checked> Expense</label>
      <label><input type="radio" name="type" value="income"> Income</label>
    </fieldset>
    <label>Amount ($)<input name="amount" inputmode="decimal" autocomplete="off" required placeholder="0.00"></label>
    <label>Category<select name="category"></select></label>
    <label>Date<input type="date" name="date" required></label>
    <label class="note">Note<input name="note" maxlength="200" autocomplete="off"></label>
    <button>Add entry</button>
  </form>`;

export class EntryForm extends HTMLElement {
  #form;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.#form = this.shadowRoot.querySelector('form');
    this.#form.addEventListener('submit', (event) => this.#submit(event));
    this.#form.addEventListener('change', (event) => {
      if (event.target.name === 'type') this.#fillCategories(event.target.value);
    });
    this.#reset();
  }

  #fillCategories(type) {
    const names = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    this.#form.elements.category.replaceChildren(...names.map((name) => new Option(name, name)));
  }

  #reset() {
    this.#form.reset();
    this.#fillCategories('expense');
    this.#form.elements.date.value = today();
  }

  #submit(event) {
    event.preventDefault();
    const { amount, date } = this.#form.elements;
    const cents = parseAmount(amount.value);
    amount.setCustomValidity(cents === null ? 'Enter an amount like 12.50' : '');
    date.setCustomValidity(date.value ? '' : 'Pick a date');
    if (!this.#form.reportValidity()) return;

    const data = new FormData(this.#form);
    this.dispatchEvent(new CustomEvent('entry-submit', {
      bubbles: true,
      composed: true,   // let the event leave the shadow root
      detail: {
        type: data.get('type'),
        amount: cents,
        category: data.get('category'),
        note: data.get('note').trim(),
        date: data.get('date'),
      },
    }));
    const type = data.get('type');
    this.#reset();
    this.#form.querySelector(`[value="${type}"]`).checked = true;   // keep the type for the next entry
    this.#fillCategories(type);
    amount.focus();
  }
}

customElements.define('entry-form', EntryForm);
