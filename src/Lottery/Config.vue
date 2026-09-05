<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue'
import PrizeConfig from './components/PrizeConfig.vue'
import { useLotteryConfig } from './composables/useLotteryConfig'
import type { PrizeItem } from './constants/defaultPrizes'

const { config, handleSavePrizes, handleResetDefault } = useLotteryConfig()
const savedTip = ref('')
let tipTimer: ReturnType<typeof setTimeout> | null = null

function showTip(message: string) {
  savedTip.value = message
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => {
    savedTip.value = ''
    tipTimer = null
  }, 2400)
}

function handleSave(prizes: PrizeItem[]) {
  handleSavePrizes(prizes)
  showTip('配置已保存，下次抽奖将使用新奖品与概率')
}

function handleReset() {
  handleResetDefault()
  showTip('已恢复默认奖品配置')
}

function handleBackLottery() {
  window.dispatchEvent(new CustomEvent('puffseed:route', { detail: 'lottery' }))
}

onBeforeUnmount(() => {
  if (tipTimer) clearTimeout(tipTimer)
})
</script>

<template>
  <div class="config-page">
    <PrizeConfig
      mode="page"
      :prizes="config.prizes"
      @save="handleSave"
      @reset="handleReset"
      @back="handleBackLottery"
    />
    <p v-if="savedTip" class="config-page__tip anim anim-fade-in">{{ savedTip }}</p>
  </div>
</template>

<style lang="scss" scoped>
.config-page {
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

.config-page__tip {
  position: fixed;
  left: 50%;
  bottom: var(--size-24);
  transform: translateX(-50%);
  margin: 0;
  padding: var(--size-8) var(--size-16);
  border-radius: var(--size-8);
  background: var(--success);
  color: var(--white);
  font-size: var(--fs-14);
  line-height: var(--lh-22);
  box-shadow: var(--shadow);
  z-index: 20;
}

@media (prefers-color-scheme: dark) {
  .config-page {
    background: var(--black);
  }
}
</style>
