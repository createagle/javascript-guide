// Trial division: deliberately simple, so the work is slow enough to notice and easy to split
export function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  if (n % 3 === 0) return n === 3;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// The primes in [from, to) as a Uint32Array; onProgress(fraction) is called about 50 times
export function primesBetween(from, to, onProgress) {
  const found = [];
  const step = Math.max(1, Math.floor((to - from) / 50));
  for (let n = from; n < to; n++) {
    if (isPrime(n)) found.push(n);
    if (onProgress && (n - from) % step === 0) onProgress((n - from) / (to - from));
  }
  return Uint32Array.from(found);
}
