import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { sampleFlow } from '@/test/fixtures'

/** `clientX` is read-only on a jsdom MouseEvent, so the coordinates come from the constructor. */
function pointAt(element: Element, type: string, clientX: number, clientY: number) {
  element.dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }))
}

/** The flow API keeps a module-level storage ref, so each test needs a fresh module graph. */
async function mountApp(path = '/') {
  vi.resetModules()
  const { default: App } = await import('../App.vue')
  const { default: router } = await import('../router')
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  await router.push(path)
  await router.isReady()

  const wrapper = mount(App, {
    global: {
      plugins: [createPinia(), router, [VueQueryPlugin, { queryClient }]],
      stubs: { VueQueryDevtools: true },
    },
  })
  await flushPromises()
  return { wrapper, router, queryClient }
}

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockImplementation(async () => Response.json(sampleFlow())),
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it.each(['/', '/missing-page'])('renders the flow from %s', async (path) => {
    const { wrapper, router } = await mountApp(path)

    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.findAll('.vue-flow__node')).toHaveLength(7)
    expect(wrapper.get('.vue-flow__node-dateTime').text()).toContain('Business Hours – UTC')
    expect(wrapper.findAll('.vue-flow__node-dateTimeConnector').map((pill) => pill.text())).toEqual(
      ['Success', 'Failure'],
    )
  })

  it('opens the drawer for the node that was clicked', async () => {
    const { wrapper } = await mountApp()

    const card = wrapper.get('.vue-flow__node-dateTime [role="button"]')
    pointAt(card.element, 'pointerdown', 0, 0)
    pointAt(card.element, 'click', 0, 0)
    await flushPromises()

    expect(document.body.textContent).toContain('Branches the flow on date and time conditions.')
  })

  it('leaves the drawer shut when the click was the end of a drag', async () => {
    const { wrapper } = await mountApp()

    const card = wrapper.get('.vue-flow__node-dateTime [role="button"]')
    pointAt(card.element, 'pointerdown', 0, 0)
    pointAt(card.element, 'click', 40, 12)
    await flushPromises()

    expect(document.body.textContent).not.toContain(
      'Branches the flow on date and time conditions.',
    )
  })

  it('saves an edit to the card and to storage', async () => {
    const { wrapper } = await mountApp()

    const card = wrapper.get('.vue-flow__node-addComment [role="button"]')
    pointAt(card.element, 'pointerdown', 0, 0)
    pointAt(card.element, 'click', 0, 0)
    await flushPromises()

    const title = document.body.querySelector('input[type="text"]') as HTMLInputElement
    title.value = 'Renamed comment'
    title.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()

    const save = [...document.body.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Save changes',
    )
    save?.click()
    await flushPromises()

    expect(wrapper.get('.vue-flow__node-addComment').text()).toContain('Renamed comment')
    expect(window.localStorage.getItem('respondio-flow-creator:flow')).toContain('Renamed comment')
  })

  it('shows failed requests and allows retrying', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockImplementation(async () => Response.json(sampleFlow()))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = await mountApp()

    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load flow (500)')
    await wrapper.get('[role="alert"] button').trigger('click')
    await flushPromises()

    expect(wrapper.find('.vue-flow').exists()).toBe(true)
  })
})
