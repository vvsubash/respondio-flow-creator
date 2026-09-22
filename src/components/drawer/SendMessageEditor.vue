<script setup lang="ts">
import { Plus, Trash2, Upload } from 'lucide-vue-next'
import { computed, ref, watchEffect } from 'vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import type { AttachmentPayload, SendMessageData, TextPayload } from '../../../api/flow.types'
import { fileNameFromUrl } from '@/utils/text'
import { LIMITS, validateAttachment, validateMessageText } from '@/utils/validation'

const props = defineProps<{ modelValue: SendMessageData }>()
const emit = defineEmits<{
  'update:modelValue': [SendMessageData]
  'update:valid': [boolean]
}>()

const uploadError = ref<string | undefined>()
const fileInput = ref<HTMLInputElement | null>(null)

const texts = computed(() =>
  props.modelValue.payload.filter((item): item is TextPayload => item.type === 'text'),
)
const attachments = computed(() =>
  props.modelValue.payload.filter((item): item is AttachmentPayload => item.type === 'attachment'),
)
const textErrors = computed(() => texts.value.map((item) => validateMessageText(item.text)))

watchEffect(() =>
  emit(
    'update:valid',
    textErrors.value.every((error) => !error),
  ),
)

function commit(nextTexts: TextPayload[], nextAttachments: AttachmentPayload[]) {
  emit('update:modelValue', { ...props.modelValue, payload: [...nextTexts, ...nextAttachments] })
}

function updateText(index: number, value: string) {
  commit(
    texts.value.map((item, position) => (position === index ? { ...item, text: value } : item)),
    attachments.value,
  )
}

function removeText(index: number) {
  commit(
    texts.value.filter((_, position) => position !== index),
    attachments.value,
  )
}

function addText() {
  commit([...texts.value, { type: 'text', text: '' }], attachments.value)
}

function removeAttachment(index: number) {
  commit(
    texts.value,
    attachments.value.filter((_, position) => position !== index),
  )
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.readAsDataURL(file)
  })
}

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  uploadError.value = validateAttachment(file)
  if (uploadError.value) return

  const attachment = await readFile(file)
  commit(texts.value, [...attachments.value, { type: 'attachment', attachment, name: file.name }])
}
</script>

<template>
  <section class="flex flex-col gap-3">
    <header class="flex items-center justify-between">
      <h3 class="text-xs font-semibold tracking-wide text-slate-600 uppercase">Message texts</h3>
      <BaseButton variant="ghost" size="sm" @click="addText">
        <Plus :size="14" />
        Add text
      </BaseButton>
    </header>

    <p v-if="texts.length === 0" class="rounded-lg bg-slate-50 px-3 py-4 text-xs text-slate-500">
      No texts yet. Add one to send a message.
    </p>

    <TransitionGroup name="list" tag="div" class="flex flex-col gap-3">
      <div v-for="(item, index) in texts" :key="`text-${index}`" class="flex flex-col gap-1.5">
        <div class="flex items-start gap-2">
          <textarea
            :value="item.text"
            rows="3"
            :maxlength="LIMITS.messageText"
            :aria-label="`Message text ${index + 1}`"
            :aria-invalid="Boolean(textErrors[index])"
            class="w-full resize-y rounded-lg border px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            :class="textErrors[index] ? 'border-red-400 bg-red-50/40' : 'border-slate-300 bg-white'"
            @input="updateText(index, ($event.target as HTMLTextAreaElement).value)"
          />
          <BaseButton
            variant="ghost-danger"
            size="sm"
            icon
            class="mt-1"
            :aria-label="`Remove message text ${index + 1}`"
            @click="removeText(index)"
          >
            <Trash2 :size="16" />
          </BaseButton>
        </div>
        <Transition name="fade-slide">
          <p v-if="textErrors[index]" role="alert" class="text-xs text-red-600">
            {{ textErrors[index] }}
          </p>
        </Transition>
      </div>
    </TransitionGroup>

    <header class="mt-2 flex items-center justify-between">
      <h3 class="text-xs font-semibold tracking-wide text-slate-600 uppercase">Attachments</h3>
      <BaseButton variant="ghost" size="sm" @click="fileInput?.click()">
        <Upload :size="14" />
        Upload
      </BaseButton>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        aria-label="Upload attachment"
        @change="onFileChange"
      />
    </header>

    <Transition name="fade-slide">
      <p v-if="uploadError" role="alert" class="text-xs text-red-600">{{ uploadError }}</p>
    </Transition>

    <TransitionGroup v-if="attachments.length" name="list" tag="ul" class="grid grid-cols-2 gap-3">
      <li
        v-for="(item, index) in attachments"
        :key="`attachment-${index}`"
        class="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
      >
        <img
          :src="item.attachment"
          :alt="item.name ?? fileNameFromUrl(item.attachment)"
          class="h-24 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <p class="truncate px-2 py-1.5 text-[11px] text-slate-600">
          {{ item.name ?? fileNameFromUrl(item.attachment) }}
        </p>
        <BaseButton
          variant="secondary"
          size="sm"
          icon
          class="absolute top-1.5 right-1.5 shadow-sm"
          :aria-label="`Remove attachment ${index + 1}`"
          @click="removeAttachment(index)"
        >
          <Trash2 :size="14" />
        </BaseButton>
      </li>
    </TransitionGroup>
    <p v-else class="rounded-lg bg-slate-50 px-3 py-4 text-xs text-slate-500">
      No attachments yet. Images up to 2 MB.
    </p>
  </section>
</template>
