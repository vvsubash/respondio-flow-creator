<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { X } from 'lucide-vue-next'
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
import TriggerDetails from './TriggerDetails.vue'
import SendMessageDetails from './SendMessageDetails.vue'
import AddCommentDetails from './AddCommentDetails.vue'
import BusinessHoursDetails from './BusinessHoursDetails.vue'
import type { FlowNode } from '../../../api/flow.types'
import { useMediaQuery } from '@vueuse/core'
import { NODE_META, nodeTitle } from '@/utils/nodeMeta'
import { nodeKey } from '@/utils/graph'

const props = defineProps<{ node: FlowNode }>()
const emit = defineEmits<{ close: [] }>()

const isWide = useMediaQuery('(min-width: 40rem)')
const direction = computed(() => (isWide.value ? 'right' : 'bottom'))

const meta = computed(() => NODE_META[props.node.type])
const body = useTemplateRef<HTMLElement>('body')

/** Vaul animates on an open transition, so the drawer mounts closed and opens on the next frame. */
const open = ref(false)
const CLOSE_ANIMATION_MS = 260

onMounted(async () => {
  await nextTick()
  open.value = true
})

watch(
  () => props.node.id,
  () => {
    if (body.value) body.value.scrollTop = 0
  },
)

function close() {
  if (!open.value) return
  open.value = false
  window.setTimeout(() => emit('close'), CLOSE_ANIMATION_MS)
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
        class="fixed inset-x-0 bottom-0 z-30 flex h-[85dvh] flex-col rounded-t-2xl border-t border-slate-200 bg-white shadow-xl focus:outline-none sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[26rem] sm:rounded-none sm:border-t-0 sm:border-l"
        @interact-outside.prevent
      >
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
              <p v-if="node.description" class="text-sm leading-relaxed text-slate-600">
                {{ node.description }}
              </p>

              <TriggerDetails v-if="node.type === 'trigger'" :node />
              <SendMessageDetails v-else-if="node.type === 'sendMessage'" :node />
              <AddCommentDetails v-else-if="node.type === 'addComment'" :node />
              <BusinessHoursDetails v-else-if="node.type === 'dateTime'" :node />
              <p v-else class="rounded-lg bg-slate-50 px-3 py-4 text-xs text-slate-500">
                This node has no settings of its own.
              </p>
            </div>
          </Transition>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>
