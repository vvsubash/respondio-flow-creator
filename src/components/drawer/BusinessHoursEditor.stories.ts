import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import BusinessHoursEditor from './BusinessHoursEditor.vue'
import { WEEK_DAYS } from '../../../api/flow.types'

const everyDay = (startTime: string, endTime: string) =>
  WEEK_DAYS.map((day) => ({ day, startTime, endTime }))

const meta = {
  title: 'Drawer/BusinessHoursEditor',
  component: BusinessHoursEditor,
  tags: ['autodocs'],
  args: {
    modelValue: {
      times: everyDay('09:00', '17:00'),
      connectors: [],
      timezone: 'UTC',
      action: 'businessHours',
    },
  },
  render: (args) => ({
    components: { BusinessHoursEditor },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div class="max-w-sm"><BusinessHoursEditor v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof BusinessHoursEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OtherTimezone: Story = {
  args: {
    modelValue: {
      times: everyDay('08:30', '16:30'),
      connectors: [],
      timezone: 'Asia/Kolkata',
      action: 'businessHours',
    },
  },
}

/** A day whose start is after its end is flagged on the row. */
export const InvalidRange: Story = {
  args: {
    modelValue: {
      times: [
        { day: 'mon', startTime: '17:00', endTime: '09:00' },
        { day: 'tue', startTime: '09:00', endTime: '17:00' },
      ],
      connectors: [],
      timezone: 'UTC',
      action: 'businessHours',
    },
  },
}
