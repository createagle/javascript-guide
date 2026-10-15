import { recordUse } from './usage.js';

export const label = 'Slugify';

export default function slugify(text) {
  recordUse();
  return text
    .normalize('NFKD')                 // split "é" into "e" + a combining accent
    .replace(/[\u0300-\u036f]/g, '')    // drop the accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
