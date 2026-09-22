<script setup lang="ts">
import { Check, ChevronDown } from 'lucide-vue-next'
import { useId } from 'vue'
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'

defineProps<{
  label: string
  options: { label: string; value: string; disabled?: boolean }[]
  error?: string
  hint?: string
  placeholder?: string
}>()

const model = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="id" class="text-xs font-semibold tracking-wide text-slate-600 uppercase">
      {{ label }}
    </label>

    <SelectRoot v-model="model">
      <SelectTrigger
        :id="id"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        class="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm text-slate-800 transition-colors outline-none data-[state=open]:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        :class="error ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'"
      >
        <SelectValue :placeholder="placeholder ?? 'Select an option'" class="truncate" />
        <SelectIcon class="text-slate-400">
          <ChevronDown :size="14" />
        </SelectIcon>
      </SelectTrigger>

      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="6"
          class="app-popper z-60 max-h-64 w-(--reka-select-trigger-width) overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <SelectViewport class="p-1">
            <SelectItem
              v-for="option in options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
              class="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none select-none data-[disabled]:opacity-40 data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-700"
            >
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator class="text-indigo-600">
                <Check :size="14" />
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>

    <Transition name="fade-slide">
      <p v-if="error" :id="`${id}-error`" role="alert" class="text-xs text-red-600">
        {{ error }}
      </p>
    </Transition>
    <p v-if="!error && hint" class="text-xs text-slate-400">{{ hint }}</p>
  </div>
</template>
