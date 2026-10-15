/**
 * @typedef {object} CountOptions
 * @property {number} [minLength] Leave out words shorter than this (default 1)
 * @property {Iterable<string>} [stopWords] Words to leave out, such as "the" and "and"
 * @property {string} [locale] The language used to split the text into words (default "en")
 */

/**
 * Counts how often each word appears, ignoring case and punctuation.
 * @param {string} text
 * @param {CountOptions} [options]
 * @returns {Map<string, number>} word → count
 */
export function countWords(text, { minLength = 1, stopWords = [], locale = 'en' } = {}) {
  const skip = new Set([...stopWords].map((word) => word.toLocaleLowerCase(locale)));
  const segmenter = new Intl.Segmenter(locale, { granularity: 'word' });
  /** @type {Map<string, number>} */
  const counts = new Map();
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (!isWordLike) continue;
    const word = segment.toLocaleLowerCase(locale);
    if ([...word].length < minLength || skip.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

/**
 * The `n` most frequent words, most frequent first; equal counts in alphabetical order.
 * @param {string} text
 * @param {number} n
 * @param {CountOptions} [options]
 * @returns {Array<[word: string, count: number]>}
 */
export function topWords(text, n, options) {
  return [...countWords(text, options)]
    .sort(([wordA, countA], [wordB, countB]) => countB - countA || wordA.localeCompare(wordB))
    .slice(0, n);
}
