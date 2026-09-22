import { computed } from 'vue'
import type { Edge, Node } from '@vue-flow/core'
import type {
  CreateNodeInput,
  FlowNode,
  NodeId,
  UpdateNodeInput,
  XYPosition,
} from '../../api/flow.types'
import { useFlowMutations, useFlowQuery } from '@/queries/flow'
import { useCanvasStore, type FlowSnapshot } from '@/stores/flowCanvas'
import { findNode, nodeKey } from '@/utils/graph'
import { layoutTree, positionOf, sizeOf } from '@/utils/layout'
import { NODE_META } from '@/utils/nodeMeta'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** Layout positions, with any node the user has dragged keeping where they put it. */
function mergePositions(
  layout: Record<string, XYPosition>,
  overrides: Record<string, XYPosition>,
): Record<string, XYPosition> {
  const merged = { ...layout }
  for (const [id, position] of Object.entries(overrides)) {
    if (merged[id]) merged[id] = position
  }
  return merged
}

export function useFlowEditor() {
  const query = useFlowQuery()
  const mutations = useFlowMutations()
  const canvas = useCanvasStore()

  const nodes = computed<FlowNode[]>(() => query.data.value ?? [])
  const positions = computed(() => mergePositions(layoutTree(nodes.value), canvas.positions))

  const flowNodes = computed<Node[]>(() =>
    nodes.value.map((node) => {
      const { width, height } = sizeOf(node)
      return {
        id: nodeKey(node.id),
        type: node.type,
        position: positionOf(positions.value, node.id),
        data: { node },
        style: { width: `${width}px`, height: `${height}px` },
        connectable: false,
        selected: canvas.selectedId === nodeKey(node.id),
      }
    }),
  )

  const flowEdges = computed<Edge[]>(() =>
    nodes.value
      .filter((node) => findNode(nodes.value, node.parentId))
      .map((node) => ({
        id: `e-${nodeKey(node.parentId)}-${nodeKey(node.id)}`,
        source: nodeKey(node.parentId),
        target: nodeKey(node.id),
        type: 'smoothstep',
        style: { stroke: NODE_META[node.type].color, strokeWidth: 2 },
      })),
  )

  const isMutating = computed(() =>
    Object.values(mutations).some((mutation) => mutation.isPending.value),
  )

  function snapshot(): FlowSnapshot {
    return { nodes: clone(nodes.value), positions: { ...canvas.positions } }
  }

  async function withHistory<T>(run: () => Promise<T>): Promise<T> {
    const before = snapshot()
    const result = await run()
    canvas.record(before)
    return result
  }

  return {
    query,
    nodes,
    flowNodes,
    flowEdges,
    isMutating,
    canUndo: computed(() => canvas.canUndo),
    canRedo: computed(() => canvas.canRedo),
    snapshot,

    createNode: (input: CreateNodeInput) => withHistory(() => mutations.create.mutateAsync(input)),
    updateNode: (input: UpdateNodeInput) => withHistory(() => mutations.update.mutateAsync(input)),
    deleteNode: (id: NodeId) => withHistory(() => mutations.remove.mutateAsync(id)),

    moveNode(id: NodeId, position: XYPosition, before: FlowSnapshot) {
      canvas.record(before)
      canvas.setPosition(id, position)
    },

    async resetFlow() {
      const before = snapshot()
      canvas.clearPositions()
      await mutations.reset.mutateAsync()
      canvas.record(before)
    },

    async undo() {
      const previous = canvas.undo(snapshot())
      if (!previous) return
      canvas.setPositions(previous.positions)
      await mutations.replace.mutateAsync(previous.nodes)
    },

    async redo() {
      const next = canvas.redo(snapshot())
      if (!next) return
      canvas.setPositions(next.positions)
      await mutations.replace.mutateAsync(next.nodes)
    },
  }
}
