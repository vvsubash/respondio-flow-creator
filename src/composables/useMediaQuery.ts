import { onBeforeUnmount, ref, type Ref } from 'vue'

/** Reactive `matchMedia`, so a component can pick a layout the CSS cannot express. */
export function useMediaQuery(query: string): Ref<boolean> {
  const matches = ref(false)
  if (typeof window === 'undefined' || !window.matchMedia) return matches

  const media = window.matchMedia(query)
  matches.value = media.matches

  const onChange = (event: MediaQueryListEvent) => {
    matches.value = event.matches
  }

  media.addEventListener('change', onChange)
  onBeforeUnmount(() => media.removeEventListener('change', onChange))

  return matches
}
