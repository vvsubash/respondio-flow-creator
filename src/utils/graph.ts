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

export type NavigationDirection = 'up' | 'down' | 'left' | 'right'

/** Children of a node, with display-only connectors replaced by their own children. */
export function focusableChildren(nodes: FlowNode[], id: NodeId): FlowNode[] {
  return childrenOf(nodes, id).flatMap((child) =>
    child.type === 'dateTimeConnector' ? childrenOf(nodes, child.id) : [child],
  )
}

/** Nearest ancestor a user can focus, skipping display-only connectors. */
export function focusableParent(nodes: FlowNode[], id: NodeId): FlowNode | undefined {
  let parent = findNode(nodes, findNode(nodes, id)?.parentId ?? '')
  while (parent?.type === 'dateTimeConnector') {
    parent = findNode(nodes, parent.parentId)
  }
  return parent
}

export function navigateFrom(
  nodes: FlowNode[],
  id: NodeId,
  direction: NavigationDirection,
): string | undefined {
  if (direction === 'down') {
    const [firstChild] = focusableChildren(nodes, id)
    return firstChild && nodeKey(firstChild.id)
  }

  const parent = focusableParent(nodes, id)
  if (direction === 'up') return parent && nodeKey(parent.id)
  if (!parent) return undefined

  const siblings = focusableChildren(nodes, parent.id)
  const index = siblings.findIndex((sibling) => nodeKey(sibling.id) === nodeKey(id))
  const next = siblings[index + (direction === 'right' ? 1 : -1)]
  return next && nodeKey(next.id)
}

export function isEditableNode(node: FlowNode | undefined): node is FlowNode {
  return Boolean(node) && node?.type !== 'dateTimeConnector'
}
