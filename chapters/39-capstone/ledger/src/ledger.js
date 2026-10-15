// The app's state: the list of entries. Every change is saved first, then announced with a 'change' event.

const makeId = () => crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export class Ledger extends EventTarget {
  #entries = [];
  #storage;

  constructor(storage) {
    super();
    this.#storage = storage;
  }

  /** A read-only view: change entries through the methods below. */
  get entries() {
    return this.#entries;
  }

  static makeId = makeId;

  async load() {
    this.#update(await this.#storage.getAll());
  }

  async add(fields) {
    const entry = Object.freeze({ ...fields, id: makeId(), created: Date.now() });
    await this.#storage.put(entry);   // save first: if it fails, the state stays as it was
    this.#update([...this.#entries, entry]);
    return entry;
  }

  async remove(id) {
    await this.#storage.delete(id);
    this.#update(this.#entries.filter((entry) => entry.id !== id));
  }

  /** Adds entries, replacing those with the same id (used by import and sample data). */
  async merge(entries) {
    await this.#storage.putAll(entries);
    const byId = new Map(this.#entries.map((entry) => [entry.id, entry]));
    for (const entry of entries) byId.set(entry.id, Object.freeze({ ...entry }));
    this.#update([...byId.values()]);
  }

  async clear() {
    await this.#storage.clear();
    this.#update([]);
  }

  #update(entries) {
    this.#entries = Object.freeze(entries);
    this.dispatchEvent(new Event('change'));
  }
}
