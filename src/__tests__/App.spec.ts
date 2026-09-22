import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it.each(['/', '/missing-page'])('renders the home page from %s', async (path) => {
    await router.push(path)
    await router.isReady()
    const wrapper = mount(App, {
      global: { plugins: [router] },
    })
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.text()).toContain('You did it!')
    wrapper.unmount()
  })
})
