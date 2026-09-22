<script setup lang="ts">
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

const isDevelopment = import.meta.env.DEV
</script>

<template>
  <RouterView />
  <VueQueryDevtools v-if="isDevelopment" />
</template>

<style scoped></style>
