import { describe, expect, it } from 'vitest'
import { sampleFlow } from '@/test/fixtures'
import { childrenOf, findNode, rootNodes } from '@/utils/graph'

describe('graph', () => {
  const nodes = sampleFlow()

  it('finds nodes by numeric or string id', () => {
    expect(findNode(nodes, 1)?.type).toBe('trigger')
    expect(findNode(nodes, '1')?.type).toBe('trigger')
    expect(findNode(nodes, 'missing')).toBeUndefined()
  })

  it('treats a node whose parent is outside the flow as a root', () => {
    expect(rootNodes(nodes).map((node) => node.id)).toEqual([1])
  })

  it('lists the children of a node', () => {
    expect(childrenOf(nodes, 'd09c08').map((node) => node.id)).toEqual(['161f52', '28c4b9'])
  })
})
