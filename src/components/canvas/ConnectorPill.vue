<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { FlowNode } from '../../../api/flow.types'
import { nodeTitle } from '@/utils/nodeMeta'

defineOptions({ inheritAttrs: false })

const props = defineProps<{ data: { node: FlowNode } }>()

const isSuccess = computed(
  () =>
    props.data.node.type === 'dateTimeConnector' &&
    props.data.node.data.connectorType === 'success',
)
const label = computed(() => nodeTitle(props.data.node))
</script>

<template>
  <div
    class="flex h-full w-full items-center justify-center rounded-full border text-xs font-semibold"
    :class="
      isSuccess
        ? 'border-sky-200 bg-sky-50 text-sky-700'
        : 'border-rose-200 bg-rose-50 text-rose-700'
    "
  >
    {{ label }}
    <Handle type="target" :position="Position.Top" class="!size-1.5 !border-0 !bg-slate-300" />
    <Handle type="source" :position="Position.Bottom" class="!size-1.5 !border-0 !bg-slate-300" />
  </div>
</template>
