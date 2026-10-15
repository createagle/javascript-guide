// A module worker: it can import, just like the page
import { primesBetween } from './primes.js';

self.onmessage = ({ data: { from, to } }) => {
  const primes = primesBetween(from, to, (fraction) => postMessage({ type: 'progress', fraction }));
  // Transfer the buffer instead of copying it: from now on only the page can use it
  postMessage({ type: 'done', primes }, [primes.buffer]);
  postMessage({ type: 'transferred', byteLengthHere: primes.buffer.byteLength });
};
