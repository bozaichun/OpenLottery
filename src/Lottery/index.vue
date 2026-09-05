<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import LuckyWheel from './components/LuckyWheel.vue'
import PrizeConfig from './components/PrizeConfig.vue'
import ResultModal from './components/ResultModal.vue'
import { useLotteryConfig } from './composables/useLotteryConfig'
import { useLotterySound } from './composables/useLotterySound'
import { calcTargetRotation, pickWeightedIndex } from './composables/useLotterySpin'
import type { PrizeItem } from './constants/defaultPrizes'

const {
  config,
  activePrizes,
  handleReload,
  handleSavePrizes,
  handleResetDefault
} = useLotteryConfig()
const { playSpin, stopSpin, playWin, playThanks } = useLotterySound()

const rotation = ref(0)
const spinning = ref(false)
const durationMs = 4800
const resultVisible = ref(false)
const resultPrize = ref<PrizeItem | null>(null)
const configVisible = ref(false)
const configTip = ref('')

let settleTimer: ReturnType<typeof setTimeout> | null = null
let tipTimer: ReturnType<typeof setTimeout> | null = null

const canSpin = computed(() => activePrizes.value.length >= 2)

const sparkles = [
  { top: '8%', left: '12%', tone: 'a', size: 14 },
  { top: '18%', left: '82%', tone: 'b', size: 12 },
  { top: '42%', left: '6%', tone: 'c', size: 10 },
  { top: '55%', left: '90%', tone: 'a', size: 13 },
  { top: '72%', left: '14%', tone: 'b', size: 11 },
  { top: '78%', left: '78%', tone: 'c', size: 12 }
]

function clearSettleTimer() {
  if (settleTimer) {
    clearTimeout(settleTimer)
    settleTimer = null
  }
}

function showConfigTip(message: string) {
  configTip.value = message
  if (tipTimer) clearTimeout(tipTimer)
  tipTimer = setTimeout(() => {
    configTip.value = ''
    tipTimer = null
  }, 2400)
}

/** puffseed：开始抽奖 */
async function handleSpin() {
  if (spinning.value || !canSpin.value) return
  handleReload()
  const list = activePrizes.value
  if (list.length < 2) return

  const index = pickWeightedIndex(list)
  const prize = list[index]
  const nextRotation = calcTargetRotation(index, list.length, rotation.value, 6)

  spinning.value = true
  rotation.value = nextRotation
  clearSettleTimer()
  await playSpin(durationMs)

  settleTimer = setTimeout(async () => {
    spinning.value = false
    stopSpin()
    resultPrize.value = prize
    resultVisible.value = true
    if (prize.type === 'thanks') {
      await playThanks()
    } else {
      await playWin()
    }
  }, durationMs + 40)
}

function handleCloseResult() {
  resultVisible.value = false
}

function handleOpenConfig() {
  if (spinning.value) return
  handleReload()
  configVisible.value = true
}

function handleCloseConfig() {
  configVisible.value = false
}

function handleConfigSave(prizes: PrizeItem[]) {
  handleSavePrizes(prizes)
  handleReload()
  showConfigTip('配置已保存，下次抽奖将使用新奖品与概率')
  configVisible.value = false
}

function handleConfigReset() {
  handleResetDefault()
  handleReload()
  showConfigTip('已恢复默认奖品配置')
}

onBeforeUnmount(() => {
  clearSettleTimer()
  stopSpin()
  if (tipTimer) clearTimeout(tipTimer)
})
</script>

<template>
  <div class="lottery-page">
    <!-- 氛围星光 -->
    <i
      v-for="(item, idx) in sparkles"
      :key="`spark-${idx}`"
      class="lottery-page__spark"
      :class="`lottery-page__spark--${item.tone}`"
      :style="{ top: item.top, left: item.left, fontSize: `${item.size}px` }"
      aria-hidden="true"
    >✦</i>

    <div class="lottery-page__stage">
      <LuckyWheel
        :prizes="activePrizes"
        :rotation="rotation"
        :spinning="spinning"
        :duration-ms="durationMs"
        @spin="handleSpin"
      />

      <!-- 下指箭头 -->
      <i class="lottery-page__cue" aria-hidden="true" />

      <!-- 开始抽奖 -->
      <button
        type="button"
        class="lottery-page__start"
        :disabled="spinning || !canSpin"
        @click="handleSpin"
      >
        {{ spinning ? '抽奖中…' : '开始抽奖' }}
      </button>

      <p v-if="!canSpin" class="lottery-page__hint">请先在「奖品配置」中启用至少 2 个奖品</p>

      <nav class="lottery-page__nav">
        <button type="button" class="lottery-page__link" @click="handleOpenConfig">奖品配置</button>
      </nav>
    </div>

    <ResultModal :visible="resultVisible" :prize="resultPrize" @close="handleCloseResult" />

    <!-- 奖品配置弹窗：展示配置表格与操作区 -->
    <Teleport to="body">
      <div
        v-if="configVisible"
        class="config-mask"
        @click.self="handleCloseConfig"
      >
        <div
          class="config-dialog anim anim-lottery-pop"
          role="dialog"
          aria-modal="true"
          aria-label="奖品配置"
        >
          <PrizeConfig
            mode="dialog"
            :prizes="config.prizes"
            @save="handleConfigSave"
            @reset="handleConfigReset"
            @back="handleCloseConfig"
          />
        </div>
      </div>
    </Teleport>

    <p v-if="configTip" class="lottery-page__tip anim anim-fade-in">{{ configTip }}</p>
  </div>
</template>

<style lang="scss" scoped>
.lottery-page {
  position: relative;
  box-sizing: border-box;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--size-24) var(--size-16) var(--size-48);
  background:
    radial-gradient(circle at 50% 28%, rgba(229, 57, 53, 0.14), transparent 48%),
    radial-gradient(circle at 18% 78%, rgba(255, 193, 7, 0.16), transparent 42%),
    radial-gradient(circle at 85% 70%, rgba(198, 40, 40, 0.08), transparent 38%),
    linear-gradient(180deg, #fff8f0 0%, #fffaf5 52%, #fff3e0 100%);
}

.lottery-page__spark {
  position: absolute;
  z-index: 0;
  font-style: normal;
  line-height: 1;
  pointer-events: none;
  opacity: 0.85;
}

.lottery-page__spark--a {
  color: var(--lottery-spark-a);
}

.lottery-page__spark--b {
  color: var(--lottery-spark-b);
}

.lottery-page__spark--c {
  color: var(--lottery-spark-c);
}

.lottery-page__stage {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(480px, 100%);
}

.lottery-page__cue {
  display: block;
  width: 0;
  height: 0;
  margin: var(--size-8) 0 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 14px solid var(--lottery-red);
  font-style: normal;
}

.lottery-page__start {
  margin-top: var(--size-8);
  min-width: 168px;
  height: 44px;
  padding: 0 var(--size-24);
  border: solid 3px var(--lottery-gold);
  border-radius: 999px;
  background: linear-gradient(180deg, #ef5350 0%, var(--lottery-red) 48%, var(--lottery-red-deep) 100%);
  color: var(--white);
  font-size: var(--fs-16);
  line-height: var(--lh-24);
  font-weight: 800;
  letter-spacing: 0.12em;
  cursor: pointer;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  box-shadow:
    0 6px 0 rgba(183, 28, 28, 0.24),
    inset 0 2px 0 rgba(255, 255, 255, 0.28);
  transition: transform 0.18s ease, opacity 0.18s ease, box-shadow 0.18s ease;

  &:not(:disabled):hover {
    transform: translateY(-1px);
  }

  &:not(:disabled):active {
    transform: translateY(2px);
    box-shadow:
      0 3px 0 rgba(183, 28, 28, 0.24),
      inset 0 2px 0 rgba(255, 255, 255, 0.22);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
}

.lottery-page__hint {
  margin: var(--size-12) 0 0;
  font-size: var(--fs-12);
  line-height: var(--lh-20);
  color: var(--lottery-red);
  text-align: center;
}

.lottery-page__nav {
  margin-top: var(--size-20);
  text-align: center;
}

.lottery-page__link {
  padding: 0;
  border: none;
  background: none;
  font-size: var(--fs-14);
  line-height: var(--lh-22);
  color: var(--lottery-red);
  cursor: pointer;
  transition: color 0.18s ease;

  &:hover {
    color: var(--lottery-red-deep);
  }
}

.config-mask {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-16);
  background: rgba(0, 0, 0, 0.45);
}

.config-dialog {
  width: min(920px, 100%);
  height: min(720px, calc(100vh - 32px));
  overflow: hidden;
  border-radius: var(--size-12);
  background: var(--white);
  box-shadow: var(--shadow);
}

.lottery-page__tip {
  position: fixed;
  left: 50%;
  bottom: var(--size-24);
  z-index: 1200;
  transform: translateX(-50%);
  margin: 0;
  padding: var(--size-8) var(--size-16);
  border-radius: var(--size-8);
  background: var(--success);
  color: var(--white);
  font-size: var(--fs-14);
  line-height: var(--lh-22);
  box-shadow: var(--shadow);
}

@media (prefers-color-scheme: dark) {
  .lottery-page {
    background:
      radial-gradient(circle at 50% 30%, rgba(229, 57, 53, 0.32), transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 193, 7, 0.1), transparent 40%),
      var(--black);
  }
}
</style>
