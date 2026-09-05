<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import {
  assignSegmentColors,
  getSegmentColorByIndex,
  type PrizeItem
} from '../constants/defaultPrizes'

const props = defineProps<{
  prizes: PrizeItem[]
  /** page：独立页；dialog：弹窗嵌入 */
  mode?: 'page' | 'dialog'
}>()

const emit = defineEmits<{
  save: [prizes: PrizeItem[]]
  reset: []
  back: []
}>()

const isDialog = computed(() => props.mode === 'dialog')

const draft = ref<PrizeItem[]>([])
const addVisible = ref(false)
const addForm = ref({
  name: '新奖品',
  type: 'prize' as PrizeItem['type'],
  weight: 10,
  enabled: true
})

watch(
  () => props.prizes,
  (list) => {
    draft.value = list.map((item) => ({ ...item }))
  },
  { immediate: true, deep: true }
)

const totalWeight = computed(() =>
  draft.value.filter((i) => i.enabled).reduce((sum, i) => sum + Math.max(0, i.weight), 0)
)

function ratio(item: PrizeItem): string {
  if (!item.enabled || totalWeight.value <= 0) return '0%'
  return `${((Math.max(0, item.weight) / totalWeight.value) * 100).toFixed(1)}%`
}

function openAddModal() {
  addForm.value = {
    name: '新奖品',
    type: 'prize',
    weight: 10,
    enabled: true
  }
  addVisible.value = true
}

function closeAddModal() {
  addVisible.value = false
}

function confirmAdd() {
  const name = addForm.value.name.trim() || '未命名奖品'
  const weight = Math.max(0, Number(addForm.value.weight) || 0)
  const index = draft.value.length
  draft.value.push({
    id: `prize-${Date.now()}`,
    name,
    type: addForm.value.type,
    color: getSegmentColorByIndex(index),
    weight,
    enabled: addForm.value.enabled
  })
  addVisible.value = false
}

function handleRemove(id: string) {
  if (draft.value.length <= 2) return
  draft.value = assignSegmentColors(draft.value.filter((item) => item.id !== id))
}

function handleSave() {
  const enabled = draft.value.filter((i) => i.enabled)
  if (enabled.length < 2) {
    window.alert('至少需要 2 个启用中的奖品扇区')
    return
  }
  if (enabled.every((i) => i.weight <= 0)) {
    window.alert('启用奖品的权重之和须大于 0')
    return
  }
  emit(
    'save',
    assignSegmentColors(
      draft.value.map((item) => ({
        ...item,
        name: item.name.trim() || '未命名奖品',
        weight: Math.max(0, Number(item.weight) || 0)
      }))
    )
  )
}

function handleReset() {
  emit('reset')
}

function handleBack() {
  emit('back')
}
</script>

<template>
  <div class="prize-config" :class="{ 'is-dialog': isDialog }">
    <header class="prize-config__head">
      <div class="prize-config__title-row">
        <h1 class="prize-config__title">奖品配置</h1>
        <button
          v-if="!isDialog"
          type="button"
          class="prize-config__back"
          @click="handleBack"
        >
          返回抽奖
        </button>
        <button
          v-else
          type="button"
          class="prize-config__close"
          aria-label="关闭"
          @click="handleBack"
        >
          <i class="prize-config__close-icon" aria-hidden="true" />
        </button>
      </div>
      <div class="prize-config__toolbar">
        <p class="prize-config__meta">当前启用权重合计：{{ totalWeight }}</p>
        <div class="prize-config__actions">
          <button type="button" class="btn btn--ghost" @click="handleReset">恢复默认</button>
          <button type="button" class="btn btn--ghost" @click="openAddModal">添加奖品</button>
          <button type="button" class="btn btn--primary" @click="handleSave">保存配置</button>
        </div>
      </div>
    </header>

    <div class="prize-config__body">
      <div class="prize-table-wrap">
        <table class="prize-table">
          <thead>
            <tr>
              <th class="col-index">序号</th>
              <th class="col-name">名称</th>
              <th class="col-type">类型</th>
              <th class="col-weight">权重</th>
              <th class="col-enabled">启用</th>
              <th class="col-ratio">占比</th>
              <th class="col-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in draft"
              :key="item.id"
              :class="index % 2 === 0 ? 'is-white' : 'is-light'"
            >
              <td class="col-index">{{ index + 1 }}</td>
              <td class="col-name">
                <input v-model="item.name" class="cell-input" type="text" maxlength="32" />
              </td>
              <td class="col-type">
                <select v-model="item.type" class="cell-select">
                  <option value="prize">奖品</option>
                  <option value="thanks">谢谢惠顾</option>
                </select>
              </td>
              <td class="col-weight">
                <input
                  v-model.number="item.weight"
                  class="cell-input cell-input--num"
                  type="number"
                  min="0"
                  step="1"
                />
              </td>
              <td class="col-enabled">
                <span class="switch-wrap">
                  <i
                    class="switch-dot"
                    :class="item.enabled ? 'is-on' : 'is-off'"
                    aria-hidden="true"
                  />
                  <input
                    v-model="item.enabled"
                    class="switch-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="item.enabled"
                    :aria-label="`启用 ${item.name}`"
                  />
                </span>
              </td>
              <td class="col-ratio">{{ ratio(item) }}</td>
              <td class="col-action">
                <button
                  type="button"
                  class="btn btn--danger btn--sm"
                  :disabled="draft.length <= 2"
                  @click="handleRemove(item.id)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加奖品弹窗 -->
    <Teleport to="body">
      <div v-if="addVisible" class="add-mask" @click.self="closeAddModal">
        <div class="add-panel anim anim-lottery-pop" role="dialog" aria-modal="true" aria-labelledby="add-prize-title">
          <h2 id="add-prize-title" class="add-panel__title">添加奖品</h2>
          <label class="add-field">
            <span>名称</span>
            <input v-model="addForm.name" type="text" maxlength="32" placeholder="请输入奖品名称" />
          </label>
          <label class="add-field">
            <span>类型</span>
            <select v-model="addForm.type">
              <option value="prize">奖品</option>
              <option value="thanks">谢谢惠顾</option>
            </select>
          </label>
          <label class="add-field">
            <span>权重</span>
            <input v-model.number="addForm.weight" type="number" min="0" step="1" />
          </label>
          <label class="add-field add-field--switch">
            <span>启用</span>
            <span class="switch-wrap">
              <i
                class="switch-dot"
                :class="addForm.enabled ? 'is-on' : 'is-off'"
                aria-hidden="true"
              />
              <input
                v-model="addForm.enabled"
                class="switch-input"
                type="checkbox"
                role="switch"
                :aria-checked="addForm.enabled"
              />
            </span>
          </label>
          <div class="add-panel__actions">
            <button type="button" class="btn btn--ghost" @click="closeAddModal">取消</button>
            <button type="button" class="btn btn--primary" @click="confirmAdd">确定添加</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.prize-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: var(--layout-content);
  margin: 0 auto;
  overflow: hidden;

  &.is-dialog {
    max-width: none;
    margin: 0;
    background: var(--white);
    border-radius: var(--size-12);
  }
}

.prize-config__head {
  position: relative;
  flex-shrink: 0;
  z-index: 10;
  padding: var(--size-16) var(--size-20) var(--size-12);
  background: var(--bg);
  border-bottom: var(--solid);
}

.prize-config.is-dialog .prize-config__head {
  padding-right: 48px;
  background: var(--white);
}

.prize-config__title-row {
  display: flex;
  align-items: center;
  gap: var(--size-12);
  flex-wrap: wrap;
}

.prize-config__title {
  margin: 0;
  font-size: var(--fs-20);
  line-height: var(--lh-28);
  color: var(--title);
}

.prize-config__back {
  padding: 0;
  border: none;
  background: none;
  font-size: var(--fs-14);
  line-height: var(--lh-22);
  color: var(--primary);
  cursor: pointer;
  transition: color 0.18s ease;

  &:hover {
    color: var(--primary-hover);
  }
}

.prize-config__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: background 0.18s ease;

  &:hover {
    background: var(--hover);
  }
}

.prize-config__close-icon {
  position: relative;
  display: block;
  width: 14px;
  height: 14px;
  font-style: normal;

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 2px;
    border-radius: 1px;
    background: var(--secondary-text);
  }

  &::before {
    transform: translateY(-50%) rotate(45deg);
  }

  &::after {
    transform: translateY(-50%) rotate(-45deg);
  }
}

.prize-config__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-12);
  align-items: center;
  justify-content: space-between;
  margin-top: var(--size-12);
}

.prize-config__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-8);
}

.prize-config__meta {
  margin: 0;
  font-size: var(--fs-12);
  line-height: var(--lh-20);
  color: var(--secondary-text);
}

.prize-config__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--size-16) var(--size-20) var(--size-24);
}

.prize-table-wrap {
  overflow-x: auto;
  border: var(--solid);
  border-radius: var(--size-8);
  background: var(--white);
  box-shadow: var(--shadow);
}

.prize-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  table-layout: fixed;
}

.prize-table th,
.prize-table td {
  padding: var(--size-12) var(--size-8);
  border-bottom: var(--solid);
  text-align: left;
  vertical-align: middle;
  font-size: var(--fs-14);
  line-height: var(--lh-22);
}

.prize-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--bg);
  color: var(--secondary-text);
  font-size: var(--fs-12);
  line-height: var(--lh-20);
  font-weight: 600;
}

.prize-table tbody tr:last-child td {
  border-bottom: none;
}

.prize-table tbody tr.is-white {
  background: var(--white);
}

.prize-table tbody tr.is-light {
  background: var(--lottery-segment-light, #fff4d6);
}

.col-index {
  width: 56px;
  text-align: center;
  color: var(--secondary-text);
}

.col-name {
  width: 28%;
}

.col-type {
  width: 120px;
}

.col-weight {
  width: 96px;
}

.col-enabled {
  width: 100px;
}

.col-ratio {
  width: 88px;
  color: var(--main-text);
  white-space: nowrap;
}

.col-action {
  width: 88px;
}

.cell-input,
.cell-select {
  box-sizing: border-box;
  width: 100%;
  height: var(--size-30);
  padding: 0 var(--size-8);
  border: var(--solid);
  border-radius: var(--size-6);
  background: var(--white);
  color: var(--title);
  font-size: var(--fs-14);
  line-height: var(--lh-22);
}

.cell-input--num {
  text-align: center;
}

.switch-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: var(--size-30);
}

.switch-dot {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  font-style: normal;
  transition: background 0.18s ease;

  &.is-on {
    background: #13ce66;
  }

  &.is-off {
    background: #c0c4cc;
  }
}

.switch-input {
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background-color: #dcdfe6;
  vertical-align: middle;
  cursor: pointer;
  outline: none;
  transition: background-color 0.2s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: transform 0.2s ease;
  }

  &:checked {
    background-color: #13ce66;
  }

  &:checked::after {
    transform: translateX(20px);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(19, 206, 102, 0.35);
  }
}

.btn {
  height: var(--size-30);
  padding: 0 var(--size-12);
  border-radius: var(--size-8);
  border: var(--solid);
  cursor: pointer;
  font-size: var(--fs-14);
  line-height: var(--lh-22);
  transition: background 0.18s ease, opacity 0.18s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn--sm {
  height: 28px;
  padding: 0 var(--size-8);
  font-size: var(--fs-12);
  line-height: var(--lh-20);
}

.btn--primary {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--white);

  &:hover:not(:disabled) {
    background: var(--primary-hover);
  }
}

.btn--ghost {
  background: var(--white);
  color: var(--title);
}

.btn--danger {
  background: var(--error-bg);
  border-color: var(--error-border);
  color: var(--error);
}

.add-mask {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-16);
  background: rgba(0, 0, 0, 0.45);
}

.add-panel {
  width: min(400px, 100%);
  padding: var(--size-24);
  border-radius: var(--size-12);
  background: var(--white);
  box-shadow: var(--shadow);
}

.add-panel__title {
  margin: 0 0 var(--size-16);
  font-size: var(--fs-18);
  line-height: var(--lh-26);
  color: var(--title);
}

.add-field {
  display: flex;
  flex-direction: column;
  gap: var(--size-4);
  margin-bottom: var(--size-12);
  font-size: var(--fs-12);
  line-height: var(--lh-20);
  color: var(--secondary-text);

  /* 排除开关 checkbox，避免破坏扁平绿轨样式 */
  input:not([type='checkbox']),
  select {
    height: var(--size-30);
    padding: 0 var(--size-8);
    border: var(--solid);
    border-radius: var(--size-6);
    background: var(--white);
    color: var(--title);
    font-size: var(--fs-14);
    line-height: var(--lh-22);
  }
}

.add-field--switch {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.add-panel__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--size-8);
  margin-top: var(--size-20);
}

@media (prefers-color-scheme: dark) {
  .prize-config__head {
    background: var(--black);
  }

  .prize-table th {
    background: var(--black);
  }
}
</style>
