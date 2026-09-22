import { afterEach, describe, it, expect, vi } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each(['/', '/missing-page'])('renders the home page from %s', async (path) => {
    const flow = [{ id: 1, type: 'trigger' }]
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
    expect(wrapper.get('code').text()).toBe(JSON.stringify(flow, null, 2))
    wrapper.unmount()
    queryClient.clear()
  })

  it('shows failed requests and allows retrying', async () => {
    const fetchMock = vi.fn<typeof fetch>()
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
    expect(wrapper.get('code').text()).toBe('[]')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.unmount()
    queryClient.clear()
  })
})
