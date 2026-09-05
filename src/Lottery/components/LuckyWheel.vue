<script lang="ts" setup>
import { computed } from 'vue'
import type { PrizeItem } from '../constants/defaultPrizes'
import { buildConicGradient } from '../composables/useLotterySpin'

const props = defineProps<{
  prizes: PrizeItem[]
  rotation: number
  spinning: boolean
  durationMs: number
}>()

const emit = defineEmits<{
  spin: []
}>()

const count = computed(() => Math.max(props.prizes.length, 1))
const sliceDeg = computed(() => 360 / count.value)
const wheelBackground = computed(() => buildConicGradient(props.prizes))

const bulbs = Array.from({ length: 24 }, (_, i) => i)
const bulbTone = (i: number) => {
  const tones = [
    'var(--lottery-bulb-a)',
    'var(--lottery-bulb-b)',
    'var(--lottery-bulb-c)',
    'var(--lottery-bulb-d)'
  ]
  return tones[i % tones.length]
}

const labelStyle = (index: number) => ({
  transform: `rotate(${index * sliceDeg.value}deg)`
})

function handleSpinClick() {
  if (props.spinning) return
  emit('spin')
}
</script>

<template>
  <!-- puffseed：节日风转盘，装饰均用标签元素搭建 -->
  <section class="lucky-wheel" :class="{ 'is-spinning': spinning }" aria-label="幸运大转盘">
    <div class="lucky-wheel__stage">
      <!-- 外环 + 灯珠 -->
      <div class="lucky-wheel__ring" aria-hidden="true">
        <span class="lucky-wheel__ring-glow" />
        <span
          v-for="i in bulbs"
          :key="`bulb-${i}`"
          class="lucky-wheel__bulb anim anim-bulb-glow anim-infinite"
          :style="{
            transform: `rotate(${i * 15}deg) translateY(calc(var(--_size) / -2 + 13px))`,
            background: bulbTone(i),
            animationDelay: `${(i % 5) * 0.14}s`
          }"
        />
      </div>

      <!-- 转动盘面 -->
      <div
        class="lucky-wheel__disk"
        :style="{
          background: wheelBackground,
          transform: `rotate(${rotation}deg)`,
          transition: spinning
            ? `transform ${durationMs}ms cubic-bezier(0.12, 0.75, 0.12, 1)`
            : 'none'
        }"
      >
        <span
          v-for="(prize, index) in prizes"
          :key="prize.id"
          class="lucky-wheel__label-wrap"
          :style="labelStyle(index)"
        >
          <span class="lucky-wheel__label-slot">
            <span class="lucky-wheel__label">{{ prize.name }}</span>
          </span>
        </span>
      </div>

      <!-- 中心抽奖钮 + 指针（指向上方扇面中心） -->
      <button
        type="button"
        class="lucky-wheel__hub"
        :disabled="spinning || prizes.length < 2"
        :aria-label="spinning ? '抽奖中' : '点击抽奖'"
        @click="handleSpinClick"
      >
        <i class="lucky-wheel__pointer" aria-hidden="true" />
        <strong class="lucky-wheel__hub-text">{{ spinning ? '…' : '抽' }}</strong>
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.lucky-wheel {
  --_size: min(var(--lottery-wheel-size), 82vw);
  position: relative;
  width: var(--_size);
  margin: 0 auto;
  flex-shrink: 0;
}

.lucky-wheel__stage {
  position: relative;
  width: var(--_size);
  height: var(--_size);
  filter: drop-shadow(0 12px 26px rgba(183, 28, 28, 0.26));
}

.lucky-wheel__ring {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 22%, #ef5350 0%, var(--lottery-red-ring) 48%, var(--lottery-red-dark) 100%);
  box-shadow:
    0 0 0 4px var(--lottery-gold),
    0 0 0 8px rgba(255, 255, 255, 0.95),
    var(--lottery-shadow-lift),
    inset 0 3px 6px rgba(255, 255, 255, 0.32);
  /* 镂空中心，露出奖品盘面 */
  -webkit-mask-image: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--lottery-ring-width)),
    #000 calc(100% - var(--lottery-ring-width) + 0.5px)
  );
  mask-image: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--lottery-ring-width)),
    #000 calc(100% - var(--lottery-ring-width) + 0.5px)
  );
}

.lucky-wheel__ring-glow {
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  border: solid 2px rgba(255, 255, 255, 0.4);
  pointer-events: none;
  -webkit-mask-image: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--lottery-ring-width) + 4px),
    #000 calc(100% - var(--lottery-ring-width) + 4.5px)
  );
  mask-image: radial-gradient(
    circle closest-side,
    transparent calc(100% - var(--lottery-ring-width) + 4px),
    #000 calc(100% - var(--lottery-ring-width) + 4.5px)
  );
}

.lucky-wheel__bulb {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  width: 11px;
  height: 11px;
  margin: -5.5px 0 0 -5.5px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
  transform-origin: center center;
}

.lucky-wheel__disk {
  position: absolute;
  inset: var(--lottery-ring-width);
  z-index: 3;
  overflow: hidden;
  border-radius: 50%;
  border: solid 3px var(--lottery-gold-deep);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
  will-change: transform;
}

.lucky-wheel__label-wrap {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  transform-origin: center center;
}

.lucky-wheel__label-slot {
  position: absolute;
  /* 外移名称，避免被中心指针遮挡 */
  top: 16%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: max-content;
  max-width: 52px;
  max-height: 34%;
  transform: translate(-50%, -50%);
}

.lucky-wheel__label {
  display: block;
  max-height: 100%;
  color: var(--lottery-label);
  font-size: var(--fs-14);
  /* 竖排时 letter-spacing 控制字距，行高收紧避免横向撑开 */
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: upright;
  overflow: hidden;
}

.lucky-wheel__hub {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 8;
  width: var(--lottery-hub-size);
  height: var(--lottery-hub-size);
  margin: calc(var(--lottery-hub-size) / -2) 0 0 calc(var(--lottery-hub-size) / -2);
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 5px var(--lottery-hub-border);
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 26%, #ef9a9a 0%, var(--lottery-hub-inner) 36%, var(--lottery-hub) 72%, var(--lottery-red-dark) 100%);
  cursor: pointer;
  box-shadow:
    0 6px 16px rgba(183, 28, 28, 0.36),
    inset 0 2px 0 rgba(255, 255, 255, 0.28);
  transition: transform 0.18s ease, opacity 0.18s ease;

  &:not(:disabled):hover {
    transform: scale(1.05);
  }

  &:not(:disabled):active {
    transform: scale(0.97);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.88;
  }
}

.lucky-wheel__pointer {
  position: absolute;
  left: 50%;
  bottom: calc(100% - 2px);
  width: 0;
  height: 0;
  margin-left: -12px;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-bottom: 22px solid var(--lottery-pointer);
  filter: drop-shadow(0 1px 0 var(--lottery-gold));
  pointer-events: none;
  font-style: normal;
}

.lucky-wheel__hub-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 0;
  font-size: var(--fs-30);
  line-height: 1;
  font-weight: 900;
  color: var(--lottery-hub-text);
  text-align: center;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.18);
}

@media (max-width: 640px) {
  .lucky-wheel {
    --lottery-hub-size: 76px;
    --lottery-ring-width: 22px;
  }

  .lucky-wheel__label-slot {
    top: 16%;
    max-width: 44px;
  }

  .lucky-wheel__label {
    font-size: var(--fs-12);
    line-height: 1.1;
    letter-spacing: 0.16em;
  }

  .lucky-wheel__hub-text {
    font-size: var(--fs-24);
    line-height: 1;
  }
}
</style>
