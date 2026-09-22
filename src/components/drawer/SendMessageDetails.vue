<script setup lang="ts">
import type { SendMessageNode } from '../../../api/flow.types'
import { fileNameFromUrl } from '@/utils/text'

defineProps<{ node: SendMessageNode }>()
</script>

<template>
  <section class="flex flex-col gap-2">
    <h3 class="text-xs font-medium text-slate-500">
      Message ({{ node.data.payload.length }}
      {{ node.data.payload.length === 1 ? 'part' : 'parts' }})
    </h3>
    <ul class="flex flex-col gap-2">
      <li v-for="(part, index) in node.data.payload" :key="index">
        <p
          v-if="part.type === 'text'"
          class="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-relaxed whitespace-pre-line text-slate-700"
        >
          {{ part.text }}
        </p>
        <figure v-else class="overflow-hidden rounded-lg border border-slate-200">
          <img
            :src="part.attachment"
            :alt="part.name ?? 'Attachment'"
            class="h-36 w-full object-cover"
          />
          <figcaption class="truncate bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            {{ part.name ?? fileNameFromUrl(part.attachment) }}
          </figcaption>
        </figure>
      </li>
    </ul>
  </section>
</template>
