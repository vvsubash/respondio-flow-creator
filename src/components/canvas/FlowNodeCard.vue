<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { FlowNode } from '../../../api/flow.types'
import { NODE_META, nodeSummary, nodeTitle } from '@/utils/nodeMeta'
import { truncate } from '@/utils/text'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ id: string; data: { node: FlowNode }; selected?: boolean }>()
const emit = defineEmits<{ open: [id: string] }>()

const CHIP = {
  pink: 'bg-pink-50 text-pink-600',
  violet: 'bg-violet-50 text-violet-600',
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
}

const OUTLINE = {
  pink: 'border-pink-400 shadow-pink-100',
  violet: 'border-violet-400 shadow-violet-100',
  teal: 'border-teal-400 shadow-teal-100',
  amber: 'border-amber-400 shadow-amber-100',
  sky: 'border-sky-400 shadow-sky-100',
}

const DRAG_THRESHOLD = 4
let pointerStart: { x: number; y: number } | null = null

function onPointerDown(event: PointerEvent) {
  pointerStart = { x: event.clientX, y: event.clientY }
}

/** A drag that ends on the card still fires a click — only a real click opens the drawer. */
function onClick(event: MouseEvent) {
  const start = pointerStart
  pointerStart = null
  if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > DRAG_THRESHOLD) return
  emit('open', props.id)
}

const node = computed(() => props.data.node)
const meta = computed(() => NODE_META[node.value.type])
const title = computed(() => nodeTitle(node.value))
const summary = computed(() => truncate(nodeSummary(node.value), 90))
</script>

<template>
  <div
    :data-node-id="id"
    role="button"
    tabindex="0"
    :aria-label="`${meta.label}: ${title}. Press enter to open details.`"
    class="h-full w-full cursor-pointer rounded-xl border bg-white px-3.5 py-3 text-left shadow-sm transition-[box-shadow,border-color] duration-150 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    :class="selected ? `${OUTLINE[meta.accent]} shadow-md` : 'border-slate-200'"
    @pointerdown="onPointerDown"
    @click="onClick"
    @keydown.enter.prevent="emit('open', id)"
    @keydown.space.prevent="emit('open', id)"
  >
    <div class="flex items-center gap-2">
      <span
        class="flex size-6 shrink-0 items-center justify-center rounded-md"
        :class="CHIP[meta.accent]"
      >
        <component :is="meta.icon" :size="14" />
      </span>
      <span class="truncate text-sm font-semibold text-slate-800">{{ title }}</span>
    </div>
    <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{{ summary }}</p>

    <Handle type="target" :position="Position.Top" class="!size-1.5 !border-0 !bg-slate-300" />
    <Handle type="source" :position="Position.Bottom" class="!size-1.5 !border-0 !bg-slate-300" />
  </div>
</template>
