import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ModalDialog from './ModalDialog.vue'
import BaseButton from './BaseButton.vue'

const meta = {
  title: 'Base/ModalDialog',
  component: ModalDialog,
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Create new node',
    subtitle: 'Adds a step to the end of the selected branch.',
  },
  render: (args) => ({
    components: { ModalDialog, BaseButton },
    setup: () => ({ args }),
    template: `
      <div style="height: 420px">
        <ModalDialog v-bind="args">
          <p class="text-sm text-slate-600">
            A centred dialog from 40rem up, a bottom sheet below it. Narrow the viewport to see it
            swap.
          </p>
          <template #footer>
            <BaseButton variant="secondary" size="sm">Cancel</BaseButton>
            <BaseButton size="sm">Create node</BaseButton>
          </template>
        </ModalDialog>
      </div>
    `,
  }),
} satisfies Meta<typeof ModalDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutSubtitle: Story = { args: { title: 'Delete node', subtitle: undefined } }

/** Long content scrolls inside the dialog rather than growing it. */
export const Scrolling: Story = {
  render: (args) => ({
    components: { ModalDialog, BaseButton },
    setup: () => ({ args }),
    template: `
      <div style="height: 420px">
        <ModalDialog v-bind="args">
          <p v-for="n in 20" :key="n" class="mb-3 text-sm text-slate-600">Paragraph {{ n }}</p>
          <template #footer>
            <BaseButton size="sm">Done</BaseButton>
          </template>
        </ModalDialog>
      </div>
    `,
  }),
}
