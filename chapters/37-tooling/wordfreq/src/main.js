// The same countWords code as the command line tool, running in the browser
import { topWords } from './count.js';
import { STOP_WORDS } from './stop-words.js';

const text = /** @type {HTMLTextAreaElement} */ (document.querySelector('#text'));
const top = /** @type {HTMLInputElement} */ (document.querySelector('#top'));
const result = /** @type {HTMLOListElement} */ (document.querySelector('#result'));

function update() {
  const rows = topWords(text.value, top.valueAsNumber || 5, { minLength: 3, stopWords: STOP_WORDS });
  result.replaceChildren(
    ...rows.map(([word, count]) =>
      Object.assign(document.createElement('li'), { textContent: `${word} (${count})` }),
    ),
  );
}

document.querySelector('#form')?.addEventListener('input', update);
update();
