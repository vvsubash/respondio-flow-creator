import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Trash2 } from 'lucide-vue-next'
import BaseButton from './BaseButton.vue'

const variants = [
  'primary',
  'secondary',
  'danger',
  'danger-solid',
  'ghost',
  'ghost-danger',
] as const

const meta = {
  title: 'Base/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: variants },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
  args: { variant: 'primary', size: 'md' },
  render: (args) => ({
    components: { BaseButton },
    setup: () => ({ args }),
    template: '<BaseButton v-bind="args">Button</BaseButton>',
  }),
} satisfies Meta<typeof BaseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export const Small: Story = { args: { size: 'sm' } }

export const Disabled: Story = { args: { disabled: true } }

export const IconOnly: Story = {
  args: { icon: true, variant: 'ghost' },
  render: (args) => ({
    components: { BaseButton, Trash2 },
    setup: () => ({ args }),
    template: '<BaseButton v-bind="args" aria-label="Remove"><Trash2 :size="16" /></BaseButton>',
  }),
}

export const AllVariants: Story = {
  render: () => ({
    components: { BaseButton },
    setup: () => ({ variants }),
    template: `
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton v-for="variant in variants" :key="variant" :variant="variant">
          {{ variant }}
        </BaseButton>
      </div>
    `,
  }),
}
