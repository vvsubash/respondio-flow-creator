<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    label: string
    error?: string
    hint?: string
    placeholder?: string
    type?: 'text' | 'time'
    maxlength?: number
    disabled?: boolean
  }>(),
  { type: 'text' },
)

const model = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-xs font-semibold tracking-wide text-slate-600 uppercase">
      {{ label }}
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? `${id}-error` : undefined"
      class="w-full rounded-lg border px-3 py-2 text-sm text-slate-800 transition-colors outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
      :class="error ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'"
    />
    <Transition name="fade-slide">
      <p v-if="error" :id="`${id}-error`" role="alert" class="text-xs text-red-600">
        {{ error }}
      </p>
    </Transition>
    <p v-if="!error && hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>
