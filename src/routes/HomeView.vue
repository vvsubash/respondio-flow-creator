<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { FlowNode } from '../../api/flow.types'
import { VueFlow } from '@vue-flow/core'
import { computed } from 'vue'
import { findNode, nodeKey } from '@/utils/graph'
import { layoutTree, positionOf, sizeOf } from '@/utils/layout'
import { NODE_META } from '@/utils/nodeMeta'
import { Background } from '@vue-flow/background'
import FlowNodeCard from '@/components/canvas/FlowNodeCard.vue'
import ConnectorPill from '@/components/canvas/ConnectorPill.vue'

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

const nodes = computed(() => {
  const positions = layoutTree(flow.value)
  return flow.value.map((node) => {
    const { width, height } = sizeOf(node)
    return {
      id: nodeKey(node.id),
      type: node.type,
      position: positionOf(positions, node.id),
      data: { node },
      style: { width: `${width}px`, height: `${height}px` },
      connectable: false,
    }
  })
})

const edges = computed(() =>
  flow.value
    .filter((node) => findNode(flow.value, node.parentId))
    .map((node) => ({
      id: `e-${nodeKey(node.parentId)}-${nodeKey(node.id)}`,
      source: nodeKey(node.parentId),
      target: nodeKey(node.id),
      type: 'smoothstep',
      style: { stroke: NODE_META[node.type].color, strokeWidth: 2 },
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
      <VueFlow
        :nodes
        :edges
        :min-zoom="0.25"
        :max-zoom="1.75"
        :nodes-connectable="false"
        fit-view-on-init
        class="h-full w-full"
      >
        <Background pattern-color="#cbd5e1" :gap="22" :size="1.4" />
        <template #node-trigger="props">
          <FlowNodeCard v-bind="props" />
        </template>
        <template #node-sendMessage="props">
          <FlowNodeCard v-bind="props" />
        </template>
        <template #node-addComment="props">
          <FlowNodeCard v-bind="props" />
        </template>
        <template #node-dateTime="props">
          <FlowNodeCard v-bind="props" />
        </template>
        <template #node-dateTimeConnector="props">
          <ConnectorPill v-bind="props" />
        </template>
      </VueFlow>
    </div>
  </main>
</template>
