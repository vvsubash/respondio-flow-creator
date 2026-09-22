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

  const centreOf = (node: FlowNode) => positionOf(positions, node.id).x + sizeOf(node).width / 2

  it('gives every node a position', () => {
    expect(Object.keys(positions).sort()).toEqual(nodes.map((node) => String(node.id)).sort())
  })

  it('packs the leaves left to right, a gap apart', () => {
    expect(positionOf(positions, 'b0653a')).toEqual({ x: 0, y: LEVEL_HEIGHT * 3 })
    expect(positionOf(positions, 'e879e4')).toEqual({ x: SLOT, y: LEVEL_HEIGHT * 4 })
  })

  it('centres a parent over its first and last child', () => {
    const find = (id: string) => nodes.find((node) => String(node.id) === id) as FlowNode

    const success = centreOf(find('161f52'))
    const failure = centreOf(find('28c4b9'))
    expect(centreOf(find('d09c08'))).toBe((success + failure) / 2)
    expect(centreOf(find('1'))).toBe(centreOf(find('d09c08')))
  })

  it('gives a connector its own narrower box', () => {
    expect(sizeOf(nodes.find((node) => node.type === 'dateTimeConnector') as FlowNode)).toEqual(
      CONNECTOR_SIZE,
    )
    expect(positionOf(positions, '161f52').x).toBe(NODE_SIZE.width / 2 - CONNECTOR_SIZE.width / 2)
  })

  it('puts every node on the row for its depth', () => {
    expect(positionOf(positions, '1').y).toBe(0)
    expect(positionOf(positions, 'd09c08').y).toBe(LEVEL_HEIGHT)
    expect(positionOf(positions, '161f52').y).toBe(LEVEL_HEIGHT * 2)
    expect(positionOf(positions, '28c4b9').y).toBe(LEVEL_HEIGHT * 2)
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

  it('sits a parent at the midpoint of three children', () => {
    const branch = [
      { id: 'p', parentId: -1, type: 'dateTime' },
      { id: 'a', parentId: 'p', type: 'addComment' },
      { id: 'b', parentId: 'p', type: 'addComment' },
      { id: 'c', parentId: 'p', type: 'addComment' },
    ] as FlowNode[]

    expect(layoutTree(branch)).toEqual({
      a: { x: 0, y: LEVEL_HEIGHT },
      b: { x: SLOT, y: LEVEL_HEIGHT },
      c: { x: SLOT * 2, y: LEVEL_HEIGHT },
      p: { x: SLOT, y: 0 },
    })
  })

  it('lays out a flow whose nodes all sit in a cycle', () => {
    const cyclic = [
      { id: 'x', parentId: 'y', type: 'addComment' },
      { id: 'y', parentId: 'x', type: 'addComment' },
    ] as FlowNode[]

    expect(Object.keys(layoutTree(cyclic)).sort()).toEqual(['x', 'y'])
  })

  it('falls back to the origin for an unknown id', () => {
    expect(positionOf(positions, 'nope')).toEqual({ x: 0, y: 0 })
  })
})
