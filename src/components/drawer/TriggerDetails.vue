<script setup lang="ts">
import type { TriggerNode } from '../../../api/flow.types'
import DetailRow from './DetailRow.vue'

defineProps<{ node: TriggerNode }>()
</script>

<template>
  <dl class="flex flex-col gap-3 rounded-lg bg-slate-50 px-3 py-3">
    <DetailRow label="Event">{{ node.data.type }}</DetailRow>
    <DetailRow label="Once per contact">{{ node.data.oncePerContact ? 'Yes' : 'No' }}</DetailRow>
  </dl>
</template>
