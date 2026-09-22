import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sampleFlow } from '@/test/fixtures'
import type { FlowNode } from '../../../api/flow.types'

async function freshApi() {
  vi.resetModules()
  return import('@/services/flowApi')
}

function stubFetch(flow: FlowNode[]) {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation(async () => Response.json(flow))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('flowApi', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('seeds from the endpoint and stores what it fetched', async () => {
    const { fetchFlow, FLOW_STORAGE_KEY } = await freshApi()
    const fetchMock = stubFetch(sampleFlow())

    const nodes = await fetchFlow()

    expect(fetchMock).toHaveBeenCalledOnce()
    expect(nodes).toHaveLength(7)
    expect(JSON.parse(window.localStorage.getItem(FLOW_STORAGE_KEY) ?? '[]')).toHaveLength(7)
  })

  it('reads the stored flow instead of going back to the endpoint', async () => {
    window.localStorage.setItem(
      'respondio-flow-creator:flow',
      JSON.stringify(sampleFlow().slice(0, 2)),
    )
    const { fetchFlow } = await freshApi()
    const fetchMock = stubFetch(sampleFlow())

    expect(await fetchFlow()).toHaveLength(2)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('persists an edit', async () => {
    const { fetchFlow, updateNode, FLOW_STORAGE_KEY } = await freshApi()
    stubFetch(sampleFlow())
    await fetchFlow()

    await updateNode({ id: 'b6a0c1', name: '  Renamed  ' })

    const stored = JSON.parse(window.localStorage.getItem(FLOW_STORAGE_KEY) ?? '[]') as FlowNode[]
    expect(stored.find((node) => node.id === 'b6a0c1')?.name).toBe('Renamed')
  })

  it('persists a new message node under its parent', async () => {
    const { fetchFlow, createNode } = await freshApi()
    stubFetch(sampleFlow())
    await fetchFlow()

    const nodes = await createNode({
      name: 'Follow up',
      description: '',
      type: 'sendMessage',
      parentId: 'e879e4',
    })

    const created = nodes.at(-1)
    expect(created?.type).toBe('sendMessage')
    expect(created?.parentId).toBe('e879e4')
    expect(created?.data).toEqual({ payload: [{ type: 'text', text: 'Follow up' }] })
  })

  it('creates a branch with both of its connectors', async () => {
    const { fetchFlow, createNode } = await freshApi()
    stubFetch(sampleFlow())
    await fetchFlow()

    const nodes = await createNode({
      name: 'Opening hours',
      description: '',
      type: 'dateTime',
      parentId: 'e879e4',
    })

    const added = nodes.slice(7)
    expect(added.map((node) => node.type)).toEqual([
      'dateTime',
      'dateTimeConnector',
      'dateTimeConnector',
    ])
    expect(added[0]?.data).toMatchObject({ timezone: 'UTC', action: 'businessHours' })
  })

  it('persists a deletion', async () => {
    const { fetchFlow, deleteNode, FLOW_STORAGE_KEY } = await freshApi()
    stubFetch(sampleFlow())
    await fetchFlow()

    await deleteNode('b6a0c1')

    const stored = JSON.parse(window.localStorage.getItem(FLOW_STORAGE_KEY) ?? '[]') as FlowNode[]
    expect(stored.find((node) => node.id === 'b6a0c1')).toBeUndefined()
    expect(stored.find((node) => node.id === 'e879e4')?.parentId).toBe('28c4b9')
  })

  it('drops the stored flow and fetches again on reset', async () => {
    const { fetchFlow, updateNode, resetFlow } = await freshApi()
    stubFetch(sampleFlow())
    await fetchFlow()
    await updateNode({ id: 'b6a0c1', name: 'Renamed' })

    const nodes = await resetFlow()

    expect(nodes.find((node) => node.id === 'b6a0c1')?.name).toBe('Away Message')
  })

  it('surfaces a failing endpoint', async () => {
    const { fetchFlow } = await freshApi()
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500 })),
    )

    await expect(fetchFlow()).rejects.toThrow('Unable to load flow (500)')
  })
})
