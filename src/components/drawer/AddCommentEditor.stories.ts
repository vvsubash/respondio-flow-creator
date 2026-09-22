import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import AddCommentEditor from './AddCommentEditor.vue'

const meta = {
  title: 'Drawer/AddCommentEditor',
  component: AddCommentEditor,
  tags: ['autodocs'],
  args: { modelValue: { comment: 'User message during off hours' } },
  render: (args) => ({
    components: { AddCommentEditor },
    setup: () => ({ args, value: ref(args.modelValue) }),
    template: '<div class="max-w-sm"><AddCommentEditor v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof AddCommentEditor>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Clearing the field is how a comment is removed, so empty is valid. */
export const Empty: Story = { args: { modelValue: { comment: '' } } }

export const TooLong: Story = { args: { modelValue: { comment: 'a'.repeat(501) } } }
