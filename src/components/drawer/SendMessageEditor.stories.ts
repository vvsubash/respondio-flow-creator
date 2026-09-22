import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import SendMessageEditor from './SendMessageEditor.vue'

const PHOTO =
  'https://fastly.picsum.photos/id/396/536/354.jpg?hmac=GmUosOuXb6nGkFhmTE-83i0ciQcaleMyvIyqzeFbW58'

const meta = {
  title: 'Drawer/SendMessageEditor',
  component: SendMessageEditor,
  tags: ['autodocs'],
  args: {
    modelValue: {
      payload: [{ type: 'text', text: 'Hello there\n\nwelcome to the chat!' }],
    },
  },
  render: (args) => ({
    components: { SendMessageEditor },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div class="max-w-sm"><SendMessageEditor v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof SendMessageEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = { args: { modelValue: { payload: [] } } }

export const WithAttachments: Story = {
  args: {
    modelValue: {
      payload: [
        { type: 'text', text: 'Here is the map you asked for.' },
        { type: 'attachment', attachment: PHOTO, name: 'station.jpg' },
        { type: 'attachment', attachment: PHOTO, name: 'platform.jpg' },
      ],
    },
  },
}

/** An empty text is flagged, because a message cannot send blank. */
export const InvalidText: Story = {
  args: { modelValue: { payload: [{ type: 'text', text: '' }] } },
}
