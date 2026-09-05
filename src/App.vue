<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Lottery from './Lottery/index.vue'
import LotteryConfig from './Lottery/Config.vue'

const route = ref('lottery')

let offRoute: (() => void) | null = null

onMounted(() => {
  const onRoute = (event: Event) => {
    const detail = (event as CustomEvent<string>).detail
    if (detail) route.value = detail
  }
  window.addEventListener('puffseed:route', onRoute)
  offRoute = () => window.removeEventListener('puffseed:route', onRoute)

  // puffseed：uTools 进入时按 feature code 路由
  if (window.utools?.onPluginEnter) {
    window.utools.onPluginEnter((action) => {
      route.value = action.code || 'lottery'
    })
    window.utools.onPluginOut(() => {
      route.value = 'lottery'
    })
  }
})

onBeforeUnmount(() => {
  offRoute?.()
})
</script>

<template>
  <Lottery v-if="route === 'lottery'" />
  <LotteryConfig v-else-if="route === 'lottery-config'" />
</template>
