<script setup lang="ts">
import { Plus, Redo2, RefreshCw, Undo2 } from 'lucide-vue-next'
import { computed, ref, useTemplateRef } from 'vue'
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { ToolbarButton, ToolbarRoot, ToolbarSeparator } from 'reka-ui'
import BaseButton from '@/components/Base/BaseButton.vue'
import CreateNodeModal from '@/components/CreateNodeModal.vue'
import FlowCanvas from '@/components/canvas/FlowCanvas.vue'
import NodeDrawer from '@/components/drawer/NodeDrawer.vue'
import { useFlowEditor } from '@/composables/useFlowEditor'
import { useCanvasStore } from '@/stores/flowCanvas'
import type { CreatableNodeType, FlowNode } from '../../api/flow.types'
import { findNode, isEditableNode } from '@/utils/graph'

const {
  nodes,
  query,
  canUndo,
  canRedo,
  isMutating,
  createNode,
  updateNode,
  deleteNode,
  undo,
  redo,
  resetFlow,
} = useFlowEditor()
const canvas = useCanvasStore()

const showCreate = ref(false)
const header = useTemplateRef<HTMLElement>('header')
const drawer = useTemplateRef<InstanceType<typeof NodeDrawer>>('drawer')

const selectedNode = computed(() => {
  const node = canvas.selectedId ? findNode(nodes.value, canvas.selectedId) : undefined
  return isEditableNode(node) ? node : undefined
})

/** The drawer sits under the header, so it needs to know how tall the header is. */
useResizeObserver(header, ([entry]) => {
  document.documentElement.style.setProperty(
    '--app-header-height',
    `${entry?.target.clientHeight ?? 0}px`,
  )
})

/** Undo and redo from the keyboard, unless the user is editing text. */
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') return

  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, [contenteditable="true"]')) return

  event.preventDefault()
  void (event.shiftKey ? redo() : undo())
})

/** Clicking the node whose details are open closes them again. */
function openNode(id: string) {
  if (canvas.selectedId === id) {
    drawer.value?.requestClose()
    return
  }
  canvas.select(id)
}

async function create(input: {
  name: string
  description: string
  type: CreatableNodeType
  parentId: string
}) {
  await createNode(input)
  showCreate.value = false
}

async function remove(node: FlowNode) {
  await deleteNode(node.id)
}
</script>

<template>
  <div class="flex h-full flex-col bg-slate-50">
    <header
      ref="header"
      class="relative z-40 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-5 py-3"
    >
      <h1 class="text-base font-semibold text-slate-900">Flow</h1>

      <ToolbarRoot class="ml-auto flex items-center gap-1.5">
        <ToolbarButton as-child>
          <BaseButton
            variant="ghost"
            size="sm"
            icon
            aria-label="Undo"
            :disabled="!canUndo"
            @click="undo()"
          >
            <Undo2 :size="16" />
          </BaseButton>
        </ToolbarButton>
        <ToolbarButton as-child>
          <BaseButton
            variant="ghost"
            size="sm"
            icon
            aria-label="Redo"
            :disabled="!canRedo"
            @click="redo()"
          >
            <Redo2 :size="16" />
          </BaseButton>
        </ToolbarButton>
        <ToolbarSeparator class="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton as-child>
          <BaseButton variant="secondary" size="sm" @click="resetFlow()">
            <RefreshCw :size="14" />
            Reset
          </BaseButton>
        </ToolbarButton>
        <ToolbarButton as-child>
          <BaseButton size="sm" @click="showCreate = true">
            <Plus :size="14" />
            New node
          </BaseButton>
        </ToolbarButton>
      </ToolbarRoot>
    </header>

    <main class="min-h-0 flex-1">
      <p v-if="query.isPending.value" role="status" class="p-6 text-sm text-slate-500">
        Loading flow…
      </p>
      <div v-else-if="query.isError.value" role="alert" class="p-6">
        <p class="text-sm text-red-700">{{ query.error.value?.message }}</p>
        <BaseButton size="sm" class="mt-3" @click="query.refetch()">Try again</BaseButton>
      </div>
      <FlowCanvas v-else @open="openNode" />
    </main>

    <NodeDrawer
      v-if="selectedNode"
      ref="drawer"
      :node="selectedNode"
      @close="canvas.select(null)"
      @save="updateNode"
      @delete="remove"
    />

    <CreateNodeModal
      v-if="showCreate"
      :nodes="nodes"
      :default-parent-id="canvas.selectedId"
      :pending="isMutating"
      @close="showCreate = false"
      @submit="create"
    />
  </div>
</template>
