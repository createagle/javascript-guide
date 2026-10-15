#!/usr/bin/env node
// Command line: node bin/wordfreq.js [--top N] [--min-length N] <file>...
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { topWords } from '../src/count.js';
import { STOP_WORDS } from '../src/stop-words.js';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    top: { type: 'string', short: 'n', default: '10' },
    'min-length': { type: 'string', default: '3' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (values.help || positionals.length === 0) {
  console.log('Usage: wordfreq [--top N] [--min-length N] <file>...');
  process.exit(values.help ? 0 : 1);
}

let text = '';
for (const file of positionals) {
  try {
    text += `${await readFile(file, 'utf8')}\n`;
  } catch (error) {
    console.error(`wordfreq: cannot read ${file} (${/** @type {NodeJS.ErrnoException} */ (error).code})`);
    process.exitCode = 1;
  }
}

const rows = topWords(text, Number(values.top), {
  minLength: Number(values['min-length']),
  stopWords: STOP_WORDS,
});
for (const [word, count] of rows) console.log(`${String(count).padStart(6)}  ${word}`);
