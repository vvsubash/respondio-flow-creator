import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import SelectField from './SelectField.vue'
import { TIMEZONES } from '@/utils/timezones'

const meta = {
  title: 'Base/SelectField',
  component: SelectField,
  tags: ['autodocs'],
  args: {
    label: 'Time zone',
    options: [...TIMEZONES],
    modelValue: 'UTC',
  },
  render: (args) => ({
    components: { SelectField },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div class="max-w-sm"><SelectField v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof SelectField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Used for every day in the schedule.' } }

export const WithError: Story = { args: { error: 'Select a time zone' } }

export const WithDisabledOption: Story = {
  args: {
    label: 'Attach after',
    modelValue: 'welcome',
    options: [
      { value: 'welcome', label: 'Welcome Message' },
      { value: 'hours', label: 'Business Hours', disabled: true },
      { value: 'comment', label: 'Add Comment #1' },
    ],
  },
}
