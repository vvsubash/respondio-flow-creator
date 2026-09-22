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

export function canDeleteNode(node: FlowNode | undefined): boolean {
  return Boolean(node) && node?.type !== 'trigger' && node?.type !== 'dateTimeConnector'
}

export function canBeParent(node: FlowNode, nodes: FlowNode[]): boolean {
  return childrenOf(nodes, node.id).length === 0
}

export function validParents(nodes: FlowNode[]): FlowNode[] {
  return nodes.filter((node) => canBeParent(node, nodes))
}

export function removeNode(nodes: FlowNode[], id: NodeId): FlowNode[] {
  const target = findNode(nodes, id)
  if (!target || !canDeleteNode(target)) return nodes

  const removed = new Set<string>([nodeKey(target.id)])
  if (target.type === 'dateTime') {
    for (const child of childrenOf(nodes, target.id)) {
      if (child.type === 'dateTimeConnector') removed.add(nodeKey(child.id))
    }
  }

  return nodes
    .filter((node) => !removed.has(nodeKey(node.id)))
    .map((node) =>
      removed.has(nodeKey(node.parentId)) ? { ...node, parentId: target.parentId } : node,
    )
}
