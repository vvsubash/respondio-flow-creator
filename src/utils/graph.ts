import type { FlowNode, NodeId } from '../../api/flow.types'

export function nodeKey(id: NodeId): string {
  return String(id)
}

export function findNode(nodes: FlowNode[], id: NodeId): FlowNode | undefined {
  return nodes.find((node) => nodeKey(node.id) === nodeKey(id))
}

export function childrenOf(nodes: FlowNode[], id: NodeId): FlowNode[] {
  return nodes.filter((node) => nodeKey(node.parentId) === nodeKey(id))
}

export function rootNodes(nodes: FlowNode[]): FlowNode[] {
  const ids = new Set(nodes.map((node) => nodeKey(node.id)))
  return nodes.filter((node) => !ids.has(nodeKey(node.parentId)))
}

export function childrenMap(nodes: FlowNode[]): Map<string, FlowNode[]> {
  const map = new Map<string, FlowNode[]>()
  for (const node of nodes) {
    const key = nodeKey(node.parentId)
    const siblings = map.get(key)
    if (siblings) siblings.push(node)
    else map.set(key, [node])
  }
  return map
}
