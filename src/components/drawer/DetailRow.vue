<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="flex items-baseline justify-between gap-3">
    <dt class="text-xs font-medium text-slate-500">{{ label }}</dt>
    <dd class="min-w-0 truncate text-sm text-slate-800"><slot /></dd>
  </div>
</template>
