import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { FlowNode, NodeId, XYPosition } from '../../api/flow.types'
import { nodeKey } from '@/utils/graph'

export interface FlowSnapshot {
  nodes: FlowNode[]
  positions: Record<string, XYPosition>
}

export const POSITIONS_STORAGE_KEY = 'respondio-flow-creator:positions'
const HISTORY_LIMIT = 50

export const useCanvasStore = defineStore('canvas', () => {
  const positions = useStorage<Record<string, XYPosition>>(POSITIONS_STORAGE_KEY, {})
  const selectedId = ref<string | null>(null)
  /** Bumped to ask an open drawer to close itself, so it keeps its own exit animation. */
  const closeRequests = ref(0)
  const past = ref<FlowSnapshot[]>([])
  const future = ref<FlowSnapshot[]>([])

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  function setPosition(id: NodeId, position: XYPosition) {
    positions.value = { ...positions.value, [nodeKey(id)]: position }
  }

  function setPositions(next: Record<string, XYPosition>) {
    positions.value = { ...next }
  }

  function clearPositions() {
    setPositions({})
  }

  function select(id: NodeId | null) {
    selectedId.value = id === null ? null : nodeKey(id)
  }

  function requestClose() {
    closeRequests.value += 1
  }

  function record(snapshot: FlowSnapshot) {
    past.value = [...past.value, snapshot].slice(-HISTORY_LIMIT)
    future.value = []
  }

  function undo(current: FlowSnapshot): FlowSnapshot | null {
    const previous = past.value.at(-1)
    if (!previous) return null
    past.value = past.value.slice(0, -1)
    future.value = [...future.value, current]
    return previous
  }

  function redo(current: FlowSnapshot): FlowSnapshot | null {
    const next = future.value.at(-1)
    if (!next) return null
    future.value = future.value.slice(0, -1)
    past.value = [...past.value, current]
    return next
  }

  return {
    positions,
    selectedId,
    closeRequests,
    canUndo,
    canRedo,
    setPosition,
    setPositions,
    clearPositions,
    select,
    requestClose,
    record,
    undo,
    redo,
  }
})
