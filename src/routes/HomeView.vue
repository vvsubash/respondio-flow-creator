<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { FlowNode } from '../../api/flow.types'
import { VueFlow } from '@vue-flow/core'
import { computed } from 'vue'
import { findNode, nodeKey } from '@/utils/graph'
import { Background } from '@vue-flow/background'

const { data, isPending, isError, error, refetch } = useQuery({
  queryKey: ['flow'],
  queryFn: async ({ signal }): Promise<FlowNode[]> => {
    const response = await fetch('/api/flow', { signal })
    if (!response.ok) {
      throw new Error(`Unable to load flow (${response.status})`)
    }
    return response.json()
  },
})
const flow = computed(() => data.value ?? [])
const depthOf = (node: FlowNode): number => {
  let depth = 0
  let parent = findNode(flow.value, node.parentId)
  while (parent) {
    depth += 1
    parent = findNode(flow.value, parent.parentId)
  }
  return depth
}
const nodes = computed(() => {
  const filled = new Map<number, number>()
  return flow.value.map((node) => {
    const depth = depthOf(node)
    const column = filled.get(depth) ?? 0
    filled.set(depth, column + 1)
    return {
      id: nodeKey(node.id),
      position: { x: column * 300, y: depth * 140 },
      label: node.name ?? node.type,
    }
  })
})

const edges = computed(() =>
  flow.value
    .filter((node) => findNode(flow.value, node.parentId))
    .map((node) => ({
      id: `${nodeKey(node.parentId)}-${nodeKey(node.id)}`,
      source: nodeKey(node.parentId),
      target: nodeKey(node.id),
    })),
)
</script>

<template>
  <main class="flex min-h-0 flex-1 flex-col p-6">
    <h1 class="mb-4 text-2xl font-semibold">Flow</h1>
    <p v-if="isPending" role="status">Loading flow…</p>
    <div v-else-if="isError" role="alert">
      <p class="text-red-700">{{ error?.message }}</p>
      <button class="mt-2 rounded bg-slate-900 px-4 py-2 text-white" @click="refetch()">
        Try again
      </button>
    </div>
    <div v-else class="min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200">
      <VueFlow :nodes :edges fit-view-on-init>
        <Background />
      </VueFlow>
    </div>
  </main>
</template>
