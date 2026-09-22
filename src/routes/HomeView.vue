<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import type { FlowNode } from '../../api/flow.types'

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
</script>

<template>
  <main class="mx-auto max-w-5xl p-6">
    <h1 class="mb-4 text-2xl font-semibold">Flow</h1>
    <p v-if="isPending" role="status">Loading flow…</p>
    <div v-else-if="isError" role="alert">
      <p class="text-red-700">{{ error?.message }}</p>
      <button class="mt-2 rounded bg-slate-900 px-4 py-2 text-white" @click="refetch()">
        Try again
      </button>
    </div>
    <pre v-else class="overflow-x-auto rounded bg-slate-950 p-4 text-sm text-slate-100"><code>{{ JSON.stringify(data, null, 2) }}</code></pre>
  </main>
</template>
