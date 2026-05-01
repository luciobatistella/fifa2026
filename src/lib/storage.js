// Adapter de storage: usa window.storage (artifact) e cai pra localStorage.

export const storage = {
  async get(key) {
    try {
      if (typeof window !== 'undefined' && window.storage?.get) {
        const r = await window.storage.get(key);
        return r?.value ?? null;
      }
    } catch (_) {}
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (_) { return null; }
  },
  async set(key, value) {
    try {
      if (typeof window !== 'undefined' && window.storage?.set) {
        await window.storage.set(key, value);
        return;
      }
    } catch (_) {}
    try { localStorage.setItem(key, value); } catch (_) {}
  },
};
