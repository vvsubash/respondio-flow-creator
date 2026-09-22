<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useMediaQuery } from '@vueuse/core'
import BaseButton from '@/components/Base/BaseButton.vue'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
  DrawerTitle,
} from 'vaul-vue'

defineProps<{ title: string; subtitle?: string }>()
const emit = defineEmits<{ close: [] }>()

const isDesktop = useMediaQuery('(min-width: 40rem)')
const primitives = computed(() =>
  isDesktop.value
    ? {
        root: DialogRoot,
        portal: DialogPortal,
        overlay: DialogOverlay,
        content: DialogContent,
        title: DialogTitle,
        description: DialogDescription,
        close: DialogClose,
      }
    : {
        root: DrawerRoot,
        portal: DrawerPortal,
        overlay: DrawerOverlay,
        content: DrawerContent,
        title: DrawerTitle,
        description: DrawerDescription,
        close: DrawerClose,
      },
)

const open = ref(false)
let closeTimer: number | undefined

onMounted(async () => {
  await nextTick()
  open.value = true
})

function close() {
  if (!open.value) return
  open.value = false
  closeTimer = window.setTimeout(() => emit('close'), isDesktop.value ? 160 : 500)
}

onBeforeUnmount(() => window.clearTimeout(closeTimer))

defineExpose({ close })
</script>

<template>
  <component
    :is="primitives.root"
    v-bind="isDesktop ? {} : { direction: 'bottom', handleOnly: true }"
    :open="open"
    @update:open="(value: boolean) => !value && close()"
  >
    <component :is="primitives.portal">
      <component
        :is="primitives.overlay"
        class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]"
        :class="{ 'app-overlay': isDesktop }"
      />
      <component
        :is="primitives.content"
        class="z-50 bg-white shadow-xl ring-1 ring-slate-200 focus:outline-none"
        :class="
          isDesktop
            ? 'app-sheet'
            : 'fixed inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-2xl'
        "
      >
        <DrawerHandle v-if="!isDesktop" class="mx-auto mt-3 shrink-0" />
        <header
          class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4"
        >
          <div>
            <component :is="primitives.title" class="text-base font-semibold text-slate-900">{{
              title
            }}</component>
            <component
              :is="primitives.description"
              :class="subtitle ? 'mt-0.5 text-xs text-slate-500' : 'sr-only'"
            >
              {{ subtitle ?? title }}
            </component>
          </div>
          <component :is="primitives.close" as-child>
            <BaseButton variant="ghost" size="sm" icon aria-label="Close dialog">
              <X :size="16" />
            </BaseButton>
          </component>
        </header>

        <div class="min-h-0 overflow-y-auto px-5 py-4">
          <slot />
        </div>

        <footer
          v-if="$slots.footer"
          class="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4"
        >
          <slot name="footer" />
        </footer>
      </component>
    </component>
  </component>
</template>
