<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
import { computed, watchEffect } from 'vue'
import BaseButton from '@/components/Base/BaseButton.vue'
import TextArea from '@/components/Base/TextArea.vue'
import type { AddCommentData } from '../../../api/flow.types'
import { LIMITS, validateComment } from '@/utils/validation'

const props = defineProps<{ modelValue: AddCommentData }>()
const emit = defineEmits<{
  'update:modelValue': [AddCommentData]
  'update:valid': [boolean]
}>()

const comment = computed({
  get: () => props.modelValue.comment,
  set: (value: string) => emit('update:modelValue', { ...props.modelValue, comment: value }),
})

const error = computed(() => validateComment(comment.value))

watchEffect(() => emit('update:valid', !error.value))
</script>

<template>
  <section class="flex flex-col gap-3">
    <TextArea
      v-model="comment"
      label="Comment"
      placeholder="Internal note for your team"
      :rows="4"
      :maxlength="LIMITS.comment"
      :error="error"
      hint="Visible to your team only. Clear the field to remove the comment."
    />
    <div class="flex justify-end">
      <BaseButton variant="ghost" size="sm" :disabled="comment.length === 0" @click="comment = ''">
        <Trash2 :size="14" />
        Remove comment
      </BaseButton>
    </div>
  </section>
</template>
