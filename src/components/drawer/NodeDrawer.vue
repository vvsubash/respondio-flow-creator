<script setup lang="ts">
import { Check, Trash2, X } from 'lucide-vue-next'
import { AnimatePresence, Motion } from 'motion-v'
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Separator,
} from 'reka-ui'
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
} from 'vaul-vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import TextField from '@/components/Base/TextField.vue'
import TextArea from '@/components/Base/TextArea.vue'
import SendMessageEditor from './SendMessageEditor.vue'
import AddCommentEditor from './AddCommentEditor.vue'
import BusinessHoursEditor from './BusinessHoursEditor.vue'
import type {
  AddCommentData,
  DateTimeData,
  FlowNode,
  SendMessageData,
  UpdateNodeInput,
} from '../../../api/flow.types'
import { canDeleteNode, nodeKey } from '@/utils/graph'
import { NODE_META, nodeTitle } from '@/utils/nodeMeta'
import { LIMITS, validateDescription, validateTitle } from '@/utils/validation'

const props = defineProps<{ node: FlowNode }>()
const emit = defineEmits<{
  close: []
  save: [UpdateNodeInput]
  delete: [FlowNode]
}>()

const isWide = useMediaQuery('(min-width: 40rem)')
const direction = computed(() => (isWide.value ? 'right' : 'bottom'))
const meta = computed(() => NODE_META[props.node.type])

interface Draft {
  name: string
  description: string
  data: FlowNode['data']
}

/** Vaul animates on an open transition, so the drawer mounts closed and opens on the next frame. */
const open = ref(false)
const CLOSE_ANIMATION_MS = 260

const draft = ref<Draft | null>(null)
const body = useTemplateRef<HTMLElement>('body')
const editorValid = ref(true)
const confirmingDelete = ref(false)
const saved = ref(false)

const titleError = computed(() => (draft.value ? validateTitle(draft.value.name) : undefined))
const descriptionError = computed(() =>
  draft.value ? validateDescription(draft.value.description) : undefined,
)

const dirty = computed(() => {
  if (!draft.value) return false
  return (
    nodeTitle(props.node) !== draft.value.name ||
    (props.node.description ?? '') !== draft.value.description ||
    JSON.stringify(props.node.data) !== JSON.stringify(draft.value.data)
  )
})

const canSave = computed(
  () => dirty.value && editorValid.value && !titleError.value && !descriptionError.value,
)

function resetDraft() {
  draft.value = {
    name: nodeTitle(props.node),
    description: props.node.description ?? '',
    data: JSON.parse(JSON.stringify(props.node.data)),
  }
  confirmingDelete.value = false
}

const messageData = computed({
  get: () => draft.value?.data as SendMessageData,
  set: (value: SendMessageData) => {
    if (draft.value) draft.value.data = value
  },
})

const commentData = computed({
  get: () => draft.value?.data as AddCommentData,
  set: (value: AddCommentData) => {
    if (draft.value) draft.value.data = value
  },
})

const businessHoursData = computed({
  get: () => draft.value?.data as DateTimeData,
  set: (value: DateTimeData) => {
    if (draft.value) draft.value.data = value
  },
})

watch(() => props.node, resetDraft, { immediate: true, deep: true })

watch(
  () => props.node.id,
  () => {
    if (body.value) body.value.scrollTop = 0
  },
)

onMounted(async () => {
  await nextTick()
  open.value = true
})

function close() {
  if (!open.value) return
  open.value = false
  window.setTimeout(() => emit('close'), CLOSE_ANIMATION_MS)
}

function save() {
  if (!draft.value || !canSave.value) return
  emit('save', {
    id: props.node.id,
    name: draft.value.name,
    description: draft.value.description,
    data: draft.value.data,
  })
  saved.value = true
  window.setTimeout(() => (saved.value = false), 1600)
}

function remove() {
  emit('delete', props.node)
  close()
}

defineExpose({ requestClose: close })
</script>

<template>
  <DrawerRoot
    :open="open"
    :modal="false"
    handle-only
    :direction="direction"
    @update:open="(value: boolean) => !value && close()"
  >
    <DrawerPortal>
      <DrawerContent
        class="fixed inset-x-0 bottom-0 z-30 flex h-[85dvh] flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-xl focus:outline-none sm:inset-x-auto sm:top-(--app-header-height) sm:right-0 sm:h-auto sm:w-[26rem] sm:rounded-none sm:border-t-0 sm:border-l"
        @interact-outside.prevent
      >
        <template v-if="draft">
          <DrawerHandle
            class="mx-auto mt-3 !h-1.5 !w-12 shrink-0 cursor-grab rounded-full bg-slate-200 transition-colors hover:bg-slate-300 active:cursor-grabbing sm:absolute sm:top-1/2 sm:left-1.5 sm:mt-0 sm:!h-12 sm:!w-1.5 sm:-translate-y-1/2"
          />

          <header class="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
            <Transition name="drawer-content" mode="out-in">
              <div :key="nodeKey(node.id)" class="flex min-w-0 flex-1 items-start gap-3">
                <span
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600"
                >
                  <component :is="meta.icon" :size="18" />
                </span>
                <div class="min-w-0 flex-1">
                  <DrawerTitle class="truncate text-base font-semibold text-slate-900">
                    {{ nodeTitle(node) }}
                  </DrawerTitle>
                  <DrawerDescription class="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {{ meta.hint }}
                  </DrawerDescription>
                </div>
              </div>
            </Transition>
            <DrawerClose as-child>
              <BaseButton variant="ghost" size="sm" icon aria-label="Close details">
                <X :size="16" />
              </BaseButton>
            </DrawerClose>
          </header>

          <div ref="body" class="flex-1 overflow-y-auto px-5 py-5">
            <Transition name="drawer-content" mode="out-in">
              <div :key="nodeKey(node.id)" class="flex flex-col gap-5">
                <TextField
                  v-model="draft.name"
                  label="Title"
                  :maxlength="LIMITS.title"
                  :error="titleError"
                  placeholder="Node title"
                />
                <TextArea
                  v-model="draft.description"
                  label="Description"
                  :rows="2"
                  :maxlength="LIMITS.description"
                  :error="descriptionError"
                  placeholder="Shown on the canvas card"
                />

                <Separator class="h-px bg-slate-100" />

                <SendMessageEditor
                  v-if="node.type === 'sendMessage'"
                  v-model="messageData"
                  @update:valid="editorValid = $event"
                />
                <AddCommentEditor
                  v-else-if="node.type === 'addComment'"
                  v-model="commentData"
                  @update:valid="editorValid = $event"
                />
                <BusinessHoursEditor
                  v-else-if="node.type === 'dateTime'"
                  v-model="businessHoursData"
                  @update:valid="editorValid = $event"
                />
                <p v-else class="rounded-lg bg-slate-50 px-3 py-4 text-xs text-slate-500">
                  This node has no settings of its own.
                </p>
              </div>
            </Transition>
          </div>

          <footer
            class="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-4"
          >
            <AlertDialogRoot v-model:open="confirmingDelete">
              <AlertDialogTrigger as-child>
                <BaseButton variant="danger" size="sm" :disabled="!canDeleteNode(node)">
                  <Trash2 :size="14" />
                  Delete
                </BaseButton>
              </AlertDialogTrigger>
              <AlertDialogPortal>
                <AlertDialogOverlay
                  class="app-overlay fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[1px]"
                />
                <AlertDialogContent
                  class="app-sheet z-50 bg-white p-5 shadow-xl ring-1 ring-slate-200 focus:outline-none [--app-sheet-width:min(24rem,calc(100vw-2rem))]"
                >
                  <AlertDialogTitle class="text-base font-semibold text-slate-900">
                    Delete “{{ nodeTitle(node) }}”?
                  </AlertDialogTitle>
                  <AlertDialogDescription class="mt-1 text-xs leading-relaxed text-slate-500">
                    The node is removed from the flow and any step below it is attached to the node
                    above. This can be undone.
                  </AlertDialogDescription>
                  <div class="mt-5 flex justify-end gap-2">
                    <AlertDialogCancel as-child>
                      <BaseButton variant="secondary" size="sm">Cancel</BaseButton>
                    </AlertDialogCancel>
                    <AlertDialogAction as-child>
                      <BaseButton variant="danger-solid" size="sm" @click="remove">
                        Delete node
                      </BaseButton>
                    </AlertDialogAction>
                  </div>
                </AlertDialogContent>
              </AlertDialogPortal>
            </AlertDialogRoot>

            <div class="flex items-center gap-2">
              <AnimatePresence>
                <Motion
                  v-if="saved"
                  key="saved"
                  as="span"
                  :initial="{ opacity: 0, scale: 0.85 }"
                  :animate="{ opacity: 1, scale: 1 }"
                  :exit="{ opacity: 0, scale: 0.85 }"
                  :transition="{ duration: 0.18 }"
                  class="flex items-center gap-1 text-xs text-emerald-600"
                >
                  <Check :size="14" />
                  Saved
                </Motion>
              </AnimatePresence>
              <BaseButton variant="secondary" size="sm" :disabled="!dirty" @click="resetDraft">
                Reset
              </BaseButton>
              <BaseButton size="sm" :disabled="!canSave" @click="save">Save changes</BaseButton>
            </div>
          </footer>
        </template>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>
