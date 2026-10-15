// <ledger-summary>: income, spending and balance, plus a bar per spending category. Set .format, then .summary.

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin: 0 0 12px; }
    dl div { padding: 8px 10px; border-radius: 8px; background: var(--surface); min-width: 0; }
    dt { font-size: 12px; color: var(--muted); }
    dd { margin: 0; font-weight: 700; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
    .income { color: var(--good); }
    .negative { color: var(--bad); }
    ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 13px; }
    li { display: grid; grid-template-columns: 6.5em 1fr auto; align-items: center; gap: 8px; }
    .bar { height: 10px; border-radius: 5px; background: var(--accent); min-width: 2px; }
    .value { font-variant-numeric: tabular-nums; color: var(--muted); }
    @media (prefers-reduced-motion: no-preference) { .bar { transition: width 0.3s; } }
  </style>
  <dl>
    <div><dt>Income</dt><dd class="income" data-key="income"></dd></div>
    <div><dt>Spent</dt><dd data-key="expense"></dd></div>
    <div><dt>Balance</dt><dd data-key="balance"></dd></div>
  </dl>
  <ul aria-label="Spending by category"></ul>`;

export class LedgerSummary extends HTMLElement {
  format = (cents) => String(cents / 100);

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
  }

  set summary({ income, expense, balance, byCategory }) {
    const root = this.shadowRoot;
    for (const [key, value] of Object.entries({ income, expense, balance })) {
      root.querySelector(`[data-key="${key}"]`).textContent = this.format(value);
    }
    root.querySelector('[data-key="balance"]').classList.toggle('negative', balance < 0);

    const largest = byCategory[0]?.[1] ?? 1;
    root.querySelector('ul').replaceChildren(...byCategory.map(([category, cents]) => {
      const li = document.createElement('li');
      const bar = Object.assign(document.createElement('span'), { className: 'bar' });
      bar.style.width = `${(cents / largest) * 100}%`;
      li.append(
        Object.assign(document.createElement('span'), { textContent: category }),
        bar,
        Object.assign(document.createElement('span'), { className: 'value', textContent: this.format(cents) }),
      );
      return li;
    }));
  }
}

customElements.define('ledger-summary', LedgerSummary);
