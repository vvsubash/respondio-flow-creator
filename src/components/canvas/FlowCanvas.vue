<script setup lang="ts">
import { Maximize, Minus, Plus } from 'lucide-vue-next'
import { VueFlow, useVueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import BaseButton from '@/components/Base/BaseButton.vue'
import FlowNodeCard from './FlowNodeCard.vue'
import ConnectorPill from './ConnectorPill.vue'
import { useFlowEditor } from '@/composables/useFlowEditor'
import { useCanvasStore, type FlowSnapshot } from '@/stores/flowCanvas'
import { navigateFrom, type NavigationDirection } from '@/utils/graph'

const emit = defineEmits<{ open: [id: string] }>()

const { flowNodes, flowEdges, nodes, snapshot, moveNode } = useFlowEditor()
const canvas = useCanvasStore()
const { onNodeDragStart, onNodeDragStop, fitView, zoomIn, zoomOut } = useVueFlow()

let dragStart: FlowSnapshot | null = null

onNodeDragStart(() => {
  dragStart = snapshot()
})

onNodeDragStop(({ node }) => {
  if (!dragStart) return
  moveNode(node.id, { ...node.position }, dragStart)
  dragStart = null
})

function navigate(id: string, direction: NavigationDirection) {
  const next = navigateFrom(nodes.value, id, direction)
  if (!next) return
  document.querySelector<HTMLElement>(`[data-node-id="${next}"]`)?.focus({ preventScroll: true })
  canvas.select(next)
}
</script>

<template>
  <VueFlow
    :nodes="flowNodes"
    :edges="flowEdges"
    :min-zoom="0.25"
    :max-zoom="1.75"
    :elements-selectable="false"
    :nodes-connectable="false"
    :nodes-focusable="false"
    :delete-key-code="null"
    fit-view-on-init
    class="h-full w-full"
  >
    <Background pattern-color="#cbd5e1" :gap="22" :size="1.4" />
    <Panel
      position="bottom-right"
      class="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
    >
      <BaseButton
        variant="ghost"
        size="sm"
        icon
        aria-label="Zoom in"
        @click="zoomIn({ duration: 200 })"
      >
        <Plus :size="16" />
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        icon
        aria-label="Zoom out"
        @click="zoomOut({ duration: 200 })"
      >
        <Minus :size="16" />
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        icon
        aria-label="Fit the flow to the screen"
        @click="fitView({ duration: 400, padding: 0.2 })"
      >
        <Maximize :size="16" />
      </BaseButton>
    </Panel>

    <template #node-trigger="props">
      <FlowNodeCard v-bind="props" @open="emit('open', $event)" @navigate="navigate" />
    </template>
    <template #node-sendMessage="props">
      <FlowNodeCard v-bind="props" @open="emit('open', $event)" @navigate="navigate" />
    </template>
    <template #node-addComment="props">
      <FlowNodeCard v-bind="props" @open="emit('open', $event)" @navigate="navigate" />
    </template>
    <template #node-dateTime="props">
      <FlowNodeCard v-bind="props" @open="emit('open', $event)" @navigate="navigate" />
    </template>
    <template #node-dateTimeConnector="props">
      <ConnectorPill v-bind="props" />
    </template>
  </VueFlow>
</template>
