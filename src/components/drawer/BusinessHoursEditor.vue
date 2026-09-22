<script setup lang="ts">
import { Calendar, Clock } from 'lucide-vue-next'
import { computed, watchEffect } from 'vue'
import SelectField from '@/components/Base/SelectField.vue'
import type { BusinessHours, DateTimeData } from '../../../api/flow.types'
import { DAY_LABELS, TIMEZONES } from '@/utils/timezones'
import { validateTimeRange } from '@/utils/validation'

const props = defineProps<{ modelValue: DateTimeData }>()
const emit = defineEmits<{
  'update:modelValue': [DateTimeData]
  'update:valid': [boolean]
}>()

const errors = computed(() =>
  props.modelValue.times.map((time) => validateTimeRange(time.startTime, time.endTime)),
)

watchEffect(() =>
  emit(
    'update:valid',
    errors.value.every((error) => !error),
  ),
)

const timezone = computed({
  get: () => props.modelValue.timezone,
  set: (value: string) => emit('update:modelValue', { ...props.modelValue, timezone: value }),
})

function updateTime(
  index: number,
  field: keyof Pick<BusinessHours, 'startTime' | 'endTime'>,
  value: string,
) {
  emit('update:modelValue', {
    ...props.modelValue,
    times: props.modelValue.times.map((time, position) =>
      position === index ? { ...time, [field]: value } : time,
    ),
  })
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <div
      class="grid grid-cols-[92px_1fr] gap-2 text-xs font-semibold tracking-wide text-slate-600 uppercase"
    >
      <span class="flex items-center gap-1.5"><Calendar :size="14" /> Day</span>
      <span class="flex items-center gap-1.5"><Clock :size="14" /> Time</span>
    </div>

    <ul class="flex flex-col gap-2.5">
      <li v-for="(time, index) in modelValue.times" :key="time.day" class="flex flex-col gap-1">
        <div class="grid grid-cols-[92px_1fr] items-center gap-2">
          <span class="text-sm text-slate-700">{{ DAY_LABELS[time.day] ?? time.day }}</span>
          <div class="flex items-center gap-2">
            <input
              :value="time.startTime"
              type="time"
              :aria-label="`${DAY_LABELS[time.day]} start time`"
              :aria-invalid="Boolean(errors[index])"
              class="w-28 rounded-lg border px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              :class="errors[index] ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'"
              @input="updateTime(index, 'startTime', ($event.target as HTMLInputElement).value)"
            />
            <span class="text-xs text-slate-400">to</span>
            <input
              :value="time.endTime"
              type="time"
              :aria-label="`${DAY_LABELS[time.day]} end time`"
              :aria-invalid="Boolean(errors[index])"
              class="w-28 rounded-lg border px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              :class="errors[index] ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'"
              @input="updateTime(index, 'endTime', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
        <p v-if="errors[index]" role="alert" class="pl-[100px] text-xs text-red-600">
          {{ errors[index] }}
        </p>
      </li>
    </ul>

    <SelectField v-model="timezone" label="Time zone" :options="[...TIMEZONES]" />
  </section>
</template>
