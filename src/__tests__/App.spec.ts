import { afterEach, describe, it, expect, vi } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import App from '../App.vue'
import router from '../router'
import { sampleFlow } from '@/test/fixtures'

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
