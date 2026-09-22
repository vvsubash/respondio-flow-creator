// Vue Flow measures its pane on mount; jsdom ships no ResizeObserver.
// Assigned rather than stubbed so `vi.unstubAllGlobals()` cannot remove it.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// This jsdom build exposes no Storage either, and the flow persists to it.
if (!window.localStorage) {
  const store = new Map<string, string>()
  const localStorage: Storage = {
    get length() {
      return store.size
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, String(value)),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  }
  Object.defineProperty(window, 'localStorage', { value: localStorage, configurable: true })
  Object.defineProperty(globalThis, 'localStorage', { value: localStorage, configurable: true })
}
