<script setup lang="ts">
import { computed, reactive, ref, useTemplateRef } from 'vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import ModalDialog from '@/components/Base/ModalDialog.vue'
import SelectField from '@/components/Base/SelectField.vue'
import TextArea from '@/components/Base/TextArea.vue'
import TextField from '@/components/Base/TextField.vue'
import type { CreatableNodeType, FlowNode } from '../../api/flow.types'
import { nodeKey, validParents } from '@/utils/graph'
import { NODE_META, nodeTitle } from '@/utils/nodeMeta'
import { LIMITS, hasErrors, validateCreateNode } from '@/utils/validation'

const props = defineProps<{
  nodes: FlowNode[]
  defaultParentId?: string | null
  pending?: boolean
}>()
const emit = defineEmits<{
  close: []
  submit: [{ name: string; description: string; type: CreatableNodeType; parentId: string }]
}>()

const parents = computed(() => validParents(props.nodes))
const defaultParent = computed(() => {
  const preferred = parents.value.find((node) => nodeKey(node.id) === props.defaultParentId)
  return nodeKey((preferred ?? parents.value.at(-1))?.id ?? '')
})

const form = reactive({
  name: '',
  description: '',
  type: 'sendMessage' as CreatableNodeType,
  parentId: defaultParent.value,
})

const submitted = ref(false)
const dialog = useTemplateRef('dialog')

const typeOptions = (['sendMessage', 'addComment', 'dateTime'] as const).map((type) => ({
  value: type,
  label: NODE_META[type].label,
}))

const parentOptions = computed(() =>
  parents.value.map((node) => ({ value: nodeKey(node.id), label: nodeTitle(node) })),
)

const errors = computed(() => validateCreateNode(form, props.nodes))

function submit() {
  submitted.value = true
  if (hasErrors(errors.value)) return
  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim(),
    type: form.type,
    parentId: form.parentId,
  })
}
</script>

<template>
  <ModalDialog
    ref="dialog"
    title="Create new node"
    subtitle="Adds a step to the end of the selected branch."
    @close="emit('close')"
  >
    <form id="create-node-form" class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <TextField
        v-model="form.name"
        label="Title"
        placeholder="e.g. Follow-up message"
        :maxlength="LIMITS.title"
        :error="submitted ? errors.name : undefined"
      />
      <TextArea
        v-model="form.description"
        label="Description"
        placeholder="Shown on the canvas card"
        :rows="2"
        :maxlength="LIMITS.description"
        :error="submitted ? errors.description : undefined"
      />
      <SelectField
        v-model="form.type"
        label="Type of node"
        :options="typeOptions"
        :error="submitted ? errors.type : undefined"
      />
      <SelectField
        v-model="form.parentId"
        label="Attach after"
        :options="parentOptions"
        placeholder="Select a node"
        :error="submitted ? errors.parentId : undefined"
        hint="Only nodes without a next step can be extended."
      />
    </form>

    <template #footer>
      <BaseButton variant="secondary" size="sm" @click="dialog?.close()">Cancel</BaseButton>
      <BaseButton type="submit" form="create-node-form" size="sm" :disabled="pending">
        {{ pending ? 'Creating…' : 'Create node' }}
      </BaseButton>
    </template>
  </ModalDialog>
</template>
