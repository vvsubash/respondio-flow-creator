<script setup lang="ts">
import { computed } from 'vue'
import type { DateTimeNode, WeekDay } from '../../../api/flow.types'
import DetailRow from './DetailRow.vue'

const props = defineProps<{ node: DateTimeNode }>()

const DAYS: Record<WeekDay, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

const times = computed(() =>
  props.node.data.times.map((time) => ({
    day: DAYS[time.day],
    range: `${time.startTime} – ${time.endTime}`,
  })),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <dl class="flex flex-col gap-3 rounded-lg bg-slate-50 px-3 py-3">
      <DetailRow label="Timezone">{{ node.data.timezone }}</DetailRow>
      <DetailRow label="Action">{{ node.data.action }}</DetailRow>
    </dl>

    <section class="flex flex-col gap-2">
      <h3 class="text-xs font-medium text-slate-500">Opening hours</h3>
      <dl class="divide-y divide-slate-100 rounded-lg border border-slate-200">
        <div
          v-for="time in times"
          :key="time.day"
          class="flex items-baseline justify-between gap-3 px-3 py-2"
        >
          <dt class="text-sm text-slate-600">{{ time.day }}</dt>
          <dd class="text-sm font-medium tabular-nums text-slate-800">{{ time.range }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
