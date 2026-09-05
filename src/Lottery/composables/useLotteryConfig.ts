import { computed, ref } from 'vue'
import {
  createDefaultPrizes,
  getSegmentColorByIndex,
  LOTTERY_STORAGE_KEY,
  type LotteryConfig,
  type PrizeItem
} from '../constants/defaultPrizes'

function readStorage(key: string): string | null {
  try {
    const utools = (window as Window & { utools?: { dbStorage?: { getItem: (k: string) => string | null } } }).utools
    if (utools?.dbStorage?.getItem) {
      return utools.dbStorage.getItem(key)
    }
  } catch {
    // puffseed：无 utools 环境时降级
  }
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    const utools = (window as Window & { utools?: { dbStorage?: { setItem: (k: string, v: string) => void } } }).utools
    if (utools?.dbStorage?.setItem) {
      utools.dbStorage.setItem(key, value)
      return
    }
  } catch {
    // puffseed：无 utools 环境时降级
  }
  try {
    localStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

function normalizeConfig(raw: unknown): LotteryConfig {
  if (!raw || typeof raw !== 'object') {
    return { prizes: createDefaultPrizes(), updatedAt: Date.now() }
  }
  const data = raw as Partial<LotteryConfig>
  if (!Array.isArray(data.prizes) || data.prizes.length < 2) {
    return { prizes: createDefaultPrizes(), updatedAt: Date.now() }
  }
  const prizes = data.prizes.map((item, index) => ({
    id: String(item?.id || `prize-${index + 1}`),
    name: String(item?.name || `奖品${index + 1}`),
    type: item?.type === 'thanks' ? 'thanks' : 'prize',
    color: String(item?.color || getSegmentColorByIndex(index)),
    weight: Math.max(0, Number(item?.weight) || 0),
    enabled: item?.enabled !== false
  })) as PrizeItem[]
  return { prizes, updatedAt: Number(data.updatedAt) || Date.now() }
}

function loadConfig(): LotteryConfig {
  const text = readStorage(LOTTERY_STORAGE_KEY)
  if (!text) return { prizes: createDefaultPrizes(), updatedAt: Date.now() }
  try {
    return normalizeConfig(JSON.parse(text))
  } catch {
    return { prizes: createDefaultPrizes(), updatedAt: Date.now() }
  }
}

/** puffseed：奖品配置读写与持久化 */
export function useLotteryConfig() {
  const config = ref<LotteryConfig>(loadConfig())

  const activePrizes = computed(() =>
    config.value.prizes.filter((item) => item.enabled && item.weight > 0)
  )

  const totalWeight = computed(() =>
    activePrizes.value.reduce((sum, item) => sum + item.weight, 0)
  )

  function persist() {
    config.value.updatedAt = Date.now()
    writeStorage(LOTTERY_STORAGE_KEY, JSON.stringify(config.value))
  }

  function handleSavePrizes(prizes: PrizeItem[]) {
    config.value = {
      prizes: normalizeConfig({ prizes }).prizes,
      updatedAt: Date.now()
    }
    persist()
  }

  function handleResetDefault() {
    config.value = { prizes: createDefaultPrizes(), updatedAt: Date.now() }
    persist()
  }

  function handleReload() {
    config.value = loadConfig()
  }

  return {
    config,
    activePrizes,
    totalWeight,
    handleSavePrizes,
    handleResetDefault,
    handleReload,
    persist
  }
}
