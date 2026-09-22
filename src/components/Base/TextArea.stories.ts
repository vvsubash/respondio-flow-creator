import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import TextArea from './TextArea.vue'

const meta = {
  title: 'Base/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  args: {
    label: 'Description',
    placeholder: 'Shown on the canvas card',
    modelValue: 'User message during off hours',
  },
  render: (args) => ({
    components: { TextArea },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div class="max-w-sm"><TextArea v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof TextArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Tall: Story = { args: { rows: 6 } }

export const WithError: Story = {
  args: { error: 'Description must be 160 characters or fewer' },
}
