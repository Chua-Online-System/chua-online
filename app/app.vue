<script setup lang="ts">
import { onMounted } from 'vue'
import { useTempleTheme } from '~/composables/useTempleTheme'
import { useZenTheme } from '~/composables/useZenTheme'

const { initTheme } = useTempleTheme()
const { initZenTheme } = useZenTheme()

onMounted(() => {
  initTheme()
  initZenTheme()
})
</script>

<template>
  <div>
    <NuxtPage />
    <ClientOnly>
      <PwaInstallPrompt />
    </ClientOnly>
  </div>
</template>
