import { describe, expect, it } from 'vitest'
import { sampleFlow } from '@/test/fixtures'
import {
  canBeParent,
  canDeleteNode,
  childrenOf,
  findNode,
  removeNode,
  rootNodes,
  validParents,
} from '@/utils/graph'

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

  it('refuses to delete a trigger or a connector', () => {
    expect(canDeleteNode(findNode(nodes, 1))).toBe(false)
    expect(canDeleteNode(findNode(nodes, '161f52'))).toBe(false)
    expect(canDeleteNode(findNode(nodes, 'b6a0c1'))).toBe(true)
    expect(canDeleteNode(undefined)).toBe(false)
  })

  it('only lets a childless node take a new step', () => {
    expect(canBeParent(findNode(nodes, 'd09c08')!, nodes)).toBe(false)
    expect(canBeParent(findNode(nodes, 'e879e4')!, nodes)).toBe(true)
    expect(validParents(nodes).map((node) => node.id)).toEqual(['b0653a', 'e879e4'])
  })

  it('reattaches the children of a deleted node to its parent', () => {
    const left = removeNode(nodes, 'b6a0c1')

    expect(findNode(left, 'b6a0c1')).toBeUndefined()
    expect(findNode(left, 'e879e4')?.parentId).toBe('28c4b9')
  })

  it('takes both connectors with a deleted branch', () => {
    const left = removeNode(nodes, 'd09c08')

    expect(left.map((node) => String(node.id)).sort()).toEqual(
      ['1', 'b0653a', 'b6a0c1', 'e879e4'].sort(),
    )
    expect(findNode(left, 'b0653a')?.parentId).toBe(1)
    expect(findNode(left, 'b6a0c1')?.parentId).toBe(1)
  })

  it('leaves the flow alone when the node cannot be deleted', () => {
    expect(removeNode(nodes, 1)).toBe(nodes)
    expect(removeNode(nodes, 'missing')).toBe(nodes)
  })
})
