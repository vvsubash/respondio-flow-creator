import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NodeDrawer from './NodeDrawer.vue'
import type { FlowNode } from '../../../api/flow.types'
import { sampleFlow } from '@/test/fixtures'

const nodes = sampleFlow()
const find = (id: string) => nodes.find((node) => String(node.id) === id) as FlowNode

interface StoryArgs {
  node: FlowNode
}

/** The drawer is a panel down the right edge from 40rem up, a bottom sheet below it. */
const meta: Meta<StoryArgs> = {
  title: 'Drawer/NodeDrawer',
  component: NodeDrawer,
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { NodeDrawer },
    setup: () => ({ args }),
    template: '<div style="height: 560px"><NodeDrawer :node="args.node" /></div>',
  }),
}

export default meta
type Story = StoryObj<StoryArgs>

export const SendMessage: Story = { args: { node: find('b0653a') } }

export const AddComment: Story = { args: { node: find('e879e4') } }

export const BusinessHours: Story = { args: { node: find('d09c08') } }

/** A trigger cannot be deleted and has nothing of its own to edit. */
export const Trigger: Story = { args: { node: find('1') } }
