import { recordUse } from './usage.js';

export const label = 'Word stats';

export default function wordStats(text) {
  recordUse();
  // Intl.Segmenter finds words in any language, not only between spaces
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
  const words = [...segmenter.segment(text)].filter((s) => s.isWordLike).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${words} words · ${text.length} characters · about ${minutes} min to read`;
}
