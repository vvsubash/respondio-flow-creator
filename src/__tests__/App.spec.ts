import { afterEach, describe, it, expect, vi } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import App from '../App.vue'
import router from '../router'
import { sampleFlow } from '@/test/fixtures'

/** `clientX` is read-only on a jsdom MouseEvent, so the coordinates come from the constructor. */
function pointAt(element: Element, type: string, clientX: number, clientY: number) {
  element.dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }))
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each(['/', '/missing-page'])('renders the home page from %s', async (path) => {
    const flow = sampleFlow()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(flow)))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    await router.push(path)
    await router.isReady()
    const wrapper = mount(App, {
      global: {
        plugins: [router, [VueQueryPlugin, { queryClient }]],
        stubs: { VueQueryDevtools: true },
      },
    })
    expect(wrapper.get('[role="status"]').text()).toBe('Loading flow…')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.get('h1').text()).toBe('Flow')
    expect(wrapper.findAll('.vue-flow__node')).toHaveLength(flow.length)
    expect(wrapper.findAll('.vue-flow__edge')).toHaveLength(flow.length - 1)

    expect(wrapper.get('.vue-flow__node-dateTime').text()).toContain('Business Hours – UTC')
    expect(wrapper.get('.vue-flow__node-trigger').text()).toContain('Conversation Opened')
    expect(wrapper.get('.vue-flow__node-addComment').text()).toContain(
      'User message during off hours',
    )
    expect(wrapper.get('.vue-flow__node-sendMessage').text()).toContain('Sorry, we are currently')
    expect(wrapper.findAll('.vue-flow__node-dateTimeConnector').map((pill) => pill.text())).toEqual(
      ['Success', 'Failure'],
    )
    wrapper.unmount()
    queryClient.clear()
  })

  it('opens the drawer for the node that was clicked', async () => {
    const flow = sampleFlow()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(flow)))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: {
        plugins: [router, [VueQueryPlugin, { queryClient }]],
        stubs: { VueQueryDevtools: true },
      },
    })
    await flushPromises()

    const card = wrapper.get('.vue-flow__node-dateTime [role="button"]')
    expect(card.attributes('aria-label')).toContain('Business Hours')
    pointAt(card.element, 'pointerdown', 0, 0)
    pointAt(card.element, 'click', 0, 0)
    await flushPromises()

    expect(document.body.textContent).toContain('Branches the flow on date and time conditions.')
    expect(document.body.textContent).toContain('Monday')

    wrapper.unmount()
    document.body.innerHTML = ''
    queryClient.clear()
  })

  it('leaves the drawer shut when the click was the end of a drag', async () => {
    const flow = sampleFlow()
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(Response.json(flow)))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: {
        plugins: [router, [VueQueryPlugin, { queryClient }]],
        stubs: { VueQueryDevtools: true },
      },
    })
    await flushPromises()

    const card = wrapper.get('.vue-flow__node-dateTime [role="button"]')
    pointAt(card.element, 'pointerdown', 0, 0)
    pointAt(card.element, 'click', 40, 12)
    await flushPromises()

    expect(document.body.textContent).not.toContain(
      'Branches the flow on date and time conditions.',
    )

    wrapper.unmount()
    document.body.innerHTML = ''
    queryClient.clear()
  })

  it('shows failed requests and allows retrying', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(Response.json([]))
    vi.stubGlobal('fetch', fetchMock)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    await router.push('/')
    await router.isReady()
    const wrapper = mount(App, {
      global: {
        plugins: [router, [VueQueryPlugin, { queryClient }]],
        stubs: { VueQueryDevtools: true },
      },
    })
    await flushPromises()
    expect(wrapper.get('[role="alert"]').text()).toContain('Unable to load flow (500)')
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.find('.vue-flow').exists()).toBe(true)
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
    queryClient.clear()
  })
})
