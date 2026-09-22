import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CreateNodeModal from './CreateNodeModal.vue'
import { sampleFlow } from '@/test/fixtures'

const meta = {
  title: 'Flow/CreateNodeModal',
  component: CreateNodeModal,
  parameters: { layout: 'fullscreen' },
  args: { nodes: sampleFlow() },
  render: (args) => ({
    components: { CreateNodeModal },
    setup: () => ({ args }),
    template: '<div style="height: 520px"><CreateNodeModal v-bind="args" /></div>',
  }),
} satisfies Meta<typeof CreateNodeModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Opened from a selected node, that node is offered as the parent. */
export const FromSelectedNode: Story = { args: { defaultParentId: 'b0653a' } }

export const Creating: Story = { args: { pending: true } }

/** With no childless node left there is nothing to attach to. */
export const NoParentsLeft: Story = {
  args: { nodes: sampleFlow().filter((node) => String(node.id) === '1') },
}
