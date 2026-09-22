import { describe, expect, it } from 'vitest'
import type { FlowNode } from '../../../api/flow.types'
import { sampleFlow } from '@/test/fixtures'
import {
  CONNECTOR_SIZE,
  HORIZONTAL_GAP,
  LEVEL_HEIGHT,
  NODE_SIZE,
  layoutTree,
  positionOf,
  sizeOf,
} from '@/utils/layout'

const SLOT = NODE_SIZE.width + HORIZONTAL_GAP

describe('layoutTree', () => {
  const nodes = sampleFlow()
  const positions = layoutTree(nodes)
  const centreOf = (id: string) => {
    const node = nodes.find((item) => String(item.id) === id) as FlowNode
    return positionOf(positions, id).x + sizeOf(node).width / 2
  }

  it('packs leaves left to right and rows them by depth', () => {
    expect(positionOf(positions, 'b0653a')).toEqual({ x: 0, y: LEVEL_HEIGHT * 3 })
    expect(positionOf(positions, 'e879e4')).toEqual({ x: SLOT, y: LEVEL_HEIGHT * 4 })
    expect(positionOf(positions, '1').y).toBe(0)
  })

  it('centres a parent over its first and last child', () => {
    expect(centreOf('d09c08')).toBe((centreOf('161f52') + centreOf('28c4b9')) / 2)
    expect(centreOf('1')).toBe(centreOf('d09c08'))
    expect(positionOf(positions, '161f52').x).toBe(NODE_SIZE.width / 2 - CONNECTOR_SIZE.width / 2)
  })

  it('never overlaps two nodes on the same row', () => {
    const rows = new Map<number, { left: number; right: number }[]>()
    for (const node of nodes) {
      const { x, y } = positionOf(positions, node.id)
      rows.set(y, [...(rows.get(y) ?? []), { left: x, right: x + sizeOf(node).width }])
    }

    for (const row of rows.values()) {
      let previousRight = Number.NEGATIVE_INFINITY
      for (const span of [...row].sort((a, b) => a.left - b.left)) {
        expect(span.left).toBeGreaterThanOrEqual(previousRight)
        previousRight = span.right
      }
    }
  })

  it('still places every node when they all sit in a cycle', () => {
    const cyclic = [
      { id: 'x', parentId: 'y', type: 'addComment' },
      { id: 'y', parentId: 'x', type: 'addComment' },
    ] as FlowNode[]

    expect(Object.keys(layoutTree(cyclic)).sort()).toEqual(['x', 'y'])
  })
})
