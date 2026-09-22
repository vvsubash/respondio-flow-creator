import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TextField from './TextField.vue'

const meta = {
  title: 'Base/TextField',
  component: TextField,
  tags: ['autodocs'],
  args: {
    label: 'Title',
    placeholder: 'e.g. Follow-up message',
    modelValue: 'Away Message',
  },
  render: (args) => ({
    components: { TextField },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div class="max-w-sm"><TextField v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithHint: Story = { args: { hint: 'Shown on the canvas card.' } }

export const WithError: Story = { args: { modelValue: '', error: 'Title is required' } }

export const Disabled: Story = { args: { disabled: true } }

export const Time: Story = {
  args: { label: 'Start time', type: 'time', modelValue: '09:00' },
}
