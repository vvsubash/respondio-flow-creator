import type { FlowNode, NodeId, XYPosition } from '../../api/flow.types'
import { childrenMap, nodeKey, rootNodes } from './graph'

export const NODE_SIZE = { width: 260, height: 96 }
export const CONNECTOR_SIZE = { width: 132, height: 40 }
export const HORIZONTAL_GAP = 40
export const LEVEL_HEIGHT = 152

export function sizeOf(node: FlowNode): { width: number; height: number } {
  return node.type === 'dateTimeConnector' ? CONNECTOR_SIZE : NODE_SIZE
}

/**
 * Tidy top-down tree layout: leaves are packed left to right, every parent is
 * centred over its children, and each depth becomes a row.
 */
export function layoutTree(nodes: FlowNode[]): Record<string, XYPosition> {
  const children = childrenMap(nodes)
  const positions: Record<string, XYPosition> = {}
  const centres = new Map<string, number>()
  let cursor = 0

  const walk = (node: FlowNode, depth: number): number => {
    const key = nodeKey(node.id)
    if (centres.has(key)) return centres.get(key) ?? 0
    centres.set(key, 0)

    const { width } = sizeOf(node)
    const kids = (children.get(key) ?? []).map((kid) => walk(kid, depth + 1))
    const [first] = kids
    const last = kids[kids.length - 1]

    let centre: number
    if (first === undefined || last === undefined) {
      centre = cursor + width / 2
      cursor += width + HORIZONTAL_GAP
    } else {
      centre = (first + last) / 2
    }

    centres.set(key, centre)
    positions[key] = { x: centre - width / 2, y: depth * LEVEL_HEIGHT }
    return centre
  }

  for (const root of rootNodes(nodes)) walk(root, 0)

  // Nodes reachable only through a cycle are never seen from a root.
  for (const node of nodes) walk(node, 0)

  return positions
}

export function positionOf(positions: Record<string, XYPosition>, id: NodeId): XYPosition {
  return positions[nodeKey(id)] ?? { x: 0, y: 0 }
}
