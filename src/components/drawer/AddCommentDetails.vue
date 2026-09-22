<script setup lang="ts">
import type { AddCommentNode } from '../../../api/flow.types'

defineProps<{ node: AddCommentNode }>()
</script>

<template>
  <section class="flex flex-col gap-2">
    <h3 class="text-xs font-medium text-slate-500">Comment</h3>
    <p
      class="border-l-2 border-teal-300 bg-slate-50 py-2 pl-3 text-sm leading-relaxed whitespace-pre-line text-slate-700"
    >
      {{ node.data.comment }}
    </p>
  </section>
</template>
