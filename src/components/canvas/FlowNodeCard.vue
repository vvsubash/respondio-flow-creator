<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { FlowNode } from '../../../api/flow.types'
import { NODE_META, nodeSummary, nodeTitle } from '@/utils/nodeMeta'
import { truncate } from '@/utils/text'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ data: { node: FlowNode } }>()

const CHIP = {
  pink: 'bg-pink-50 text-pink-600',
  violet: 'bg-violet-50 text-violet-600',
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  sky: 'bg-sky-50 text-sky-600',
}

const node = computed(() => props.data.node)
const meta = computed(() => NODE_META[node.value.type])
const title = computed(() => nodeTitle(node.value))
const summary = computed(() => truncate(nodeSummary(node.value), 90))
</script>

<template>
  <div
    class="h-full w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm"
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
