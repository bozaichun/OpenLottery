<script lang="ts" setup>
import type { PrizeItem } from '../constants/defaultPrizes'

defineProps<{
  visible: boolean
  prize: PrizeItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

function handleClose() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && prize" class="result-mask" @click.self="handleClose">
      <div
        class="result-panel anim anim-lottery-pop"
        :class="prize.type === 'thanks' ? 'is-thanks' : 'is-win'"
        role="dialog"
        aria-modal="true"
      >
        <p class="result-panel__eyebrow">{{ prize.type === 'thanks' ? '未中奖' : '恭喜中奖' }}</p>
        <h2 class="result-panel__title">{{ prize.name }}</h2>
        <p v-if="prize.type === 'thanks'" class="result-panel__desc">
          感谢参与，期待您下次中奖！
        </p>
        <button type="button" class="result-panel__btn" @click="handleClose">知道了</button>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.result-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-16);
  background: rgba(0, 0, 0, 0.45);
}

.result-panel {
  width: min(360px, 100%);
  padding: var(--size-24);
  border-radius: var(--size-12);
  background: var(--white);
  box-shadow: var(--shadow);
  text-align: center;
}

.result-panel.is-win {
  border: solid var(--border-1) var(--lottery-red-soft);
}

.result-panel.is-thanks {
  border: solid var(--border-1) var(--info-border);
}

.result-panel__eyebrow {
  margin: 0 0 var(--size-8);
  font-size: var(--fs-12);
  line-height: var(--lh-20);
  color: var(--secondary-text);
}

.result-panel.is-win .result-panel__eyebrow {
  color: var(--lottery-red);
}

.result-panel__title {
  margin: 0 0 var(--size-20);
  font-size: var(--fs-20);
  line-height: var(--lh-28);
  color: var(--title);
  word-break: break-word;
}

.result-panel.is-win .result-panel__title {
  color: var(--lottery-red-dark);
}

.result-panel__desc {
  margin: 0 0 var(--size-20);
  font-size: var(--fs-14);
  line-height: var(--lh-22);
  color: var(--main-text);
}

.result-panel__btn {
  min-width: 120px;
  height: var(--size-30);
  padding: 0 var(--size-16);
  border: none;
  border-radius: var(--size-8);
  background: var(--lottery-red);
  color: var(--white);
  cursor: pointer;
  transition: opacity 0.18s ease, background 0.18s ease;

  &:hover {
    background: var(--lottery-red-deep);
  }

  &:active {
    background: var(--lottery-red-dark);
  }
}
</style>
