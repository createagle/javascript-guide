// <entry-list>: shows entries. Set .format (cents → text) and then .entries; deleting raises 'entry-delete'.

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
    li { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 4px 10px; padding: 8px 10px; border-radius: 8px; background: var(--surface); }
    .what { min-width: 0; }
    .category { font-weight: 600; }
    .meta { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
    .amount { font-variant-numeric: tabular-nums; font-weight: 600; white-space: nowrap; }
    .income { color: var(--good); }
    button { font: inherit; font-size: 18px; line-height: 1; width: 32px; height: 32px; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--muted); cursor: pointer; }
    button:hover { color: var(--bad); border-color: var(--bad); }
    button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .empty { margin: 0; padding: 16px; text-align: center; color: var(--muted); font-size: 14px; }
  </style>
  <ul aria-label="Entries"></ul>
  <p class="empty">No entries this month yet.</p>`;

export class EntryList extends HTMLElement {
  format = (cents) => String(cents / 100);
  #list;
  #empty;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.#list = this.shadowRoot.querySelector('ul');
    this.#empty = this.shadowRoot.querySelector('.empty');
    // One listener for every delete button, present and future (event delegation)
    this.#list.addEventListener('click', (event) => {
      const id = event.target.closest('button')?.dataset.id;
      if (id) this.dispatchEvent(new CustomEvent('entry-delete', { bubbles: true, composed: true, detail: { id } }));
    });
  }

  set entries(entries) {
    this.#list.replaceChildren(...entries.map((entry) => this.#row(entry)));
    this.#empty.hidden = entries.length > 0;
  }

  #row({ id, type, amount, category, note, date }) {
    const li = document.createElement('li');
    const what = document.createElement('div');
    what.className = 'what';
    const name = Object.assign(document.createElement('div'), { className: 'category', textContent: category });
    const meta = Object.assign(document.createElement('div'), { className: 'meta', textContent: note ? `${date} · ${note}` : date });
    what.append(name, meta);
    const sign = type === 'income' ? '+' : '−';
    const money = Object.assign(document.createElement('span'), {
      className: `amount ${type}`,
      textContent: `${sign}${this.format(amount)}`,
    });
    const remove = Object.assign(document.createElement('button'), { type: 'button', textContent: '×' });
    remove.dataset.id = id;
    remove.setAttribute('aria-label', `Delete ${category} ${this.format(amount)} on ${date}`);
    li.append(what, money, remove);
    return li;
  }
}

customElements.define('entry-list', EntryList);
