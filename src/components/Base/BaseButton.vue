<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'ghost' | 'ghost-danger'
    size?: 'sm' | 'md'
    type?: 'button' | 'submit'
    disabled?: boolean
    /** Square padding for a button whose only content is an icon. */
    icon?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', disabled: false, icon: false },
)

const VARIANTS: Record<NonNullable<typeof props.variant>, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-slate-400',
  danger:
    'border border-red-200 bg-white text-red-600 hover:bg-red-50 focus-visible:outline-red-500',
  'danger-solid': 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
  ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-slate-400',
  'ghost-danger': 'text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-red-500',
}

const SIZES: Record<NonNullable<typeof props.size>, string> = {
  sm: 'gap-1.5 px-2.5 py-1.5 text-xs',
  md: 'gap-2 px-3.5 py-2 text-sm',
}

const ICON_SIZES: Record<NonNullable<typeof props.size>, string> = {
  sm: 'p-1.5',
  md: 'p-2',
}

const classes = computed(
  () =>
    `inline-flex items-center justify-center rounded-lg font-medium transition-[background-color,border-color,color,transform] duration-150 not-disabled:active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[props.variant]} ${props.icon ? ICON_SIZES[props.size] : SIZES[props.size]}`,
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
