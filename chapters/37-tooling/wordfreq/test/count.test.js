import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { countWords, topWords } from '../src/count.js';

describe('countWords', () => {
  test('ignores case and punctuation', () => {
    assert.deepEqual(
      countWords('The cat, the hat. THE END!'),
      new Map([
        ['the', 3],
        ['cat', 1],
        ['hat', 1],
        ['end', 1],
      ]),
    );
  });

  test('leaves out short words and stop words', () => {
    const counts = countWords('I saw a cat and a dog', { minLength: 2, stopWords: ['and'] });
    assert.deepEqual([...counts.keys()], ['saw', 'cat', 'dog']);
  });

  test('splits Chinese text into words', () => {
    const counts = countWords('我喜欢学习 JavaScript，学习让我快乐。', { locale: 'zh' });
    assert.equal(counts.get('学习'), 2);
    assert.equal(counts.get('javascript'), 1);
  });
});

describe('topWords', () => {
  test('most frequent first, equal counts in alphabetical order', () => {
    assert.deepEqual(topWords('b a c b a b', 2), [
      ['b', 3],
      ['a', 2],
    ]);
  });

  test('returns fewer rows when there are fewer words', () => {
    assert.equal(topWords('one two', 10).length, 2);
  });
});
