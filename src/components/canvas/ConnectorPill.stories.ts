import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import ConnectorPill from './ConnectorPill.vue'
import type { FlowNode } from '../../../api/flow.types'
import { sizeOf } from '@/utils/layout'

function connector(name: string, connectorType: 'success' | 'failure'): FlowNode {
  return {
    id: connectorType,
    parentId: 'hours',
    type: 'dateTimeConnector',
    name,
    data: { connectorType },
  } as FlowNode
}

const SUCCESS = connector('Success', 'success')
const FAILURE = connector('Failure', 'failure')

function canvasNode(node: FlowNode, x: number) {
  const { width, height } = sizeOf(node)
  return {
    id: String(node.id),
    type: node.type,
    position: { x, y: 0 },
    data: { node },
    style: { width: `${width}px`, height: `${height}px` },
    connectable: false,
  }
}

interface StoryArgs {
  nodes: FlowNode[]
}

/** The pill only renders inside a Vue Flow canvas, because of its handles. */
const meta: Meta<StoryArgs> = {
  title: 'Canvas/ConnectorPill',
  component: ConnectorPill,
  parameters: { layout: 'centered' },
  render: (args) => ({
    components: { VueFlow, Background, ConnectorPill },
    setup: () => ({
      nodes: args.nodes.map((node, index) => canvasNode(node, index * 172)),
      width: args.nodes.length * 172 + 40,
    }),
    template: `
      <div :style="{ width: width + 'px', height: '100px' }">
        <VueFlow
          :nodes="nodes"
          :nodes-draggable="false"
          :nodes-focusable="false"
          :zoom-on-scroll="false"
          :pan-on-drag="false"
          :default-viewport="{ x: 20, y: 30, zoom: 1 }"
        >
          <Background pattern-color="#cbd5e1" :gap="22" :size="1.4" />
          <template #node-dateTimeConnector="props"><ConnectorPill v-bind="props" /></template>
        </VueFlow>
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<StoryArgs>

export const Success: Story = { args: { nodes: [SUCCESS] } }

export const Failure: Story = { args: { nodes: [FAILURE] } }

export const BothBranches: Story = { args: { nodes: [SUCCESS, FAILURE] } }

/** Without a name the pill falls back to the humanised connector type. */
export const Unnamed: Story = {
  args: {
    nodes: [
      { ...SUCCESS, name: undefined } as FlowNode,
      { ...FAILURE, name: undefined } as FlowNode,
    ],
  },
}
