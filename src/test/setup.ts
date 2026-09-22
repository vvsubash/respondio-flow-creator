// Vue Flow measures its pane on mount; jsdom ships no ResizeObserver.
// Assigned rather than stubbed so `vi.unstubAllGlobals()` cannot remove it.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
