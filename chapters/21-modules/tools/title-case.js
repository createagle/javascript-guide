import { recordUse } from './usage.js';

export const label = 'Title Case';
const SMALL = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to']);

export default function titleCase(text) {
  recordUse();
  // \p{L} matches a letter in any script, so "café" is one word
  return text.replace(/[\p{L}\p{N}']+/gu, (word, index) =>
    index > 0 && SMALL.has(word.toLowerCase()) ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1));
}
