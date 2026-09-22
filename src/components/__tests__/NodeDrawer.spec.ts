import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import NodeDrawer from '@/components/drawer/NodeDrawer.vue'
import type { FlowNode } from '../../../api/flow.types'
import { sampleFlow } from '@/test/fixtures'

const nodes = sampleFlow()
const find = (id: string) => nodes.find((node) => String(node.id) === id) as FlowNode

async function openDrawer(node: FlowNode) {
  const wrapper = mount(NodeDrawer, { props: { node }, attachTo: document.body })
  await flushPromises()
  return wrapper
}

describe('NodeDrawer', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    vi.unstubAllGlobals()
  })

  it('opens with the node title and the type hint', async () => {
    await openDrawer(find('b6a0c1'))

    expect(document.body.textContent).toContain('Away Message')
    expect(document.body.textContent).toContain('Sends texts and attachments to the contact.')
  })

  it('lists every opening hour for a business hours node', async () => {
    await openDrawer(find('d09c08'))

    expect(document.body.textContent).toContain('UTC')
    expect(document.body.textContent).toContain('Monday')
    expect(document.body.textContent).toContain('Sunday')
    expect(document.body.textContent).toContain('09:00 – 17:00')
  })

  it('slides up from the bottom when the viewport is narrow', async () => {
    await openDrawer(find('b6a0c1'))

    expect(
      document.querySelector('[data-vaul-drawer]')?.getAttribute('data-vaul-drawer-direction'),
    ).toBe('bottom')
  })

  it('slides in from the right once the viewport is wide', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(min-width: 40rem)',
      addEventListener: () => {},
      removeEventListener: () => {},
    }))

    await openDrawer(find('b6a0c1'))

    expect(
      document.querySelector('[data-vaul-drawer]')?.getAttribute('data-vaul-drawer-direction'),
    ).toBe('right')
  })

  it('emits close only after the drawer has animated shut', async () => {
    vi.useFakeTimers()
    try {
      const wrapper = mount(NodeDrawer, {
        props: { node: find('b6a0c1') },
        attachTo: document.body,
      })
      await vi.advanceTimersByTimeAsync(0)

      wrapper.vm.requestClose()
      expect(wrapper.emitted('close')).toBeUndefined()

      await vi.advanceTimersByTimeAsync(300)
      expect(wrapper.emitted('close')).toHaveLength(1)
    } finally {
      vi.useRealTimers()
    }
  })
})
