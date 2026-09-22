import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import FlowNodeCard from './FlowNodeCard.vue'
import type { FlowNode } from '../../../api/flow.types'
import { sizeOf } from '@/utils/layout'

const TRIGGER = {
  id: 'trigger',
  parentId: -1,
  type: 'trigger',
  data: { type: 'conversationOpened', oncePerContact: false },
} as FlowNode

const SEND_MESSAGE = {
  id: 'welcome',
  parentId: -1,
  type: 'sendMessage',
  name: 'Welcome Message',
  data: { payload: [{ type: 'text', text: 'Hello there\n\nwelcome to the chat!' }] },
} as FlowNode

const ADD_COMMENT = {
  id: 'comment',
  parentId: -1,
  type: 'addComment',
  name: 'Add Comment #1',
  data: { comment: 'User message during off hours' },
} as FlowNode

const DATE_TIME = {
  id: 'hours',
  parentId: -1,
  type: 'dateTime',
  name: 'Business Hours',
  data: {
    times: [{ day: 'mon', startTime: '09:00', endTime: '17:00' }],
    connectors: [],
    timezone: 'Europe/London',
    action: 'businessHours',
  },
} as FlowNode

function canvasNode(node: FlowNode, y: number) {
  const { width, height } = sizeOf(node)
  return {
    id: String(node.id),
    type: node.type,
    position: { x: 0, y },
    data: { node },
    style: { width: `${width}px`, height: `${height}px` },
    connectable: false,
  }
}

interface StoryArgs {
  nodes: FlowNode[]
}

/** The card only renders inside a Vue Flow canvas, because of its handles. */
const meta: Meta<StoryArgs> = {
  title: 'Canvas/FlowNodeCard',
  component: FlowNodeCard,
  parameters: { layout: 'centered' },
  render: (args) => ({
    components: { VueFlow, Background, FlowNodeCard },
    setup: () => ({
      nodes: args.nodes.map((node, index) => canvasNode(node, index * 120)),
      height: args.nodes.length * 120 + 40,
    }),
    template: `
      <div :style="{ width: '340px', height: height + 'px' }">
        <VueFlow
          :nodes="nodes"
          :nodes-draggable="false"
          :nodes-focusable="false"
          :zoom-on-scroll="false"
          :pan-on-drag="false"
          :default-viewport="{ x: 40, y: 20, zoom: 1 }"
        >
          <Background pattern-color="#cbd5e1" :gap="22" :size="1.4" />
          <template #node-trigger="props"><FlowNodeCard v-bind="props" /></template>
          <template #node-sendMessage="props"><FlowNodeCard v-bind="props" /></template>
          <template #node-addComment="props"><FlowNodeCard v-bind="props" /></template>
          <template #node-dateTime="props"><FlowNodeCard v-bind="props" /></template>
        </VueFlow>
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<StoryArgs>

export const Trigger: Story = { args: { nodes: [TRIGGER] } }

export const SendMessage: Story = { args: { nodes: [SEND_MESSAGE] } }

export const AddComment: Story = { args: { nodes: [ADD_COMMENT] } }

export const BusinessHours: Story = { args: { nodes: [DATE_TIME] } }

export const AllTypes: Story = {
  args: { nodes: [TRIGGER, DATE_TIME, SEND_MESSAGE, ADD_COMMENT] },
}

/** Without a name the card falls back to the type's label. */
export const Unnamed: Story = {
  args: { nodes: [{ ...SEND_MESSAGE, name: undefined } as FlowNode] },
}

/** A long summary is trimmed to 90 characters and clamped to two lines. */
export const LongSummary: Story = {
  args: {
    nodes: [
      {
        ...ADD_COMMENT,
        data: {
          comment:
            'The contact wrote in well outside business hours, so nobody on the support rota has picked this up yet and it needs a second look in the morning.',
        },
      } as FlowNode,
    ],
  },
}
