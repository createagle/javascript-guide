# Pocket Ledger

**English** | [简体中文](README.zh-CN.md)

The capstone project of the guide: a small expense tracker that keeps working offline. No framework, no build step, no dependencies.

[Open the app](https://createagle.github.io/javascript-guide/chapters/39-capstone/ledger/)

| File | What it does |
| --- | --- |
| [index.html](index.html) | The page: three custom elements and a few controls |
| [src/main.js](src/main.js) | Wires everything together: storage → state → components, and events back |
| [src/ledger.js](src/ledger.js) | `Ledger` class (extends `EventTarget`): the list of entries; saves, then fires `change` |
| [src/db.js](src/db.js) | A promise wrapper around IndexedDB, plus an in-memory fallback |
| [src/money.js](src/money.js) | Pure functions: parsing amounts into cents, totals, formatting, validating imported data |
| [src/rates.js](src/rates.js) | Fetches exchange rates with a timeout and falls back to the last saved copy |
| [src/components/](src/components/) | `<entry-form>`, `<entry-list>` and `<ledger-summary>` Web Components |
| [sw.js](sw.js) | Service worker: caches the app shell (cache first) and the rates (stale while revalidate) |
| [manifest.webmanifest](manifest.webmanifest) | Lets browsers install the app |
| [data/rates.json](data/rates.json) | Sample exchange rates (not live data) |
| [test/money.test.js](test/money.test.js) | Unit tests for `money.js` |

## Run it locally

Service workers and modules need http(s), so serve the repository root and open `chapters/39-capstone/ledger/`:

```bash
python3 -m http.server 8000
```

Run the tests with Node.js 20 or later:

```bash
cd chapters/39-capstone/ledger
npm test
```

After changing any cached file, bump `VERSION` in `sw.js`, or visitors keep getting the old copy.
