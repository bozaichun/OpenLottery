import type { PrizeItem } from '../constants/defaultPrizes'

/** 按权重加权随机，返回启用列表中的下标 */
export function pickWeightedIndex(prizes: PrizeItem[]): number {
  const total = prizes.reduce((sum, item) => sum + item.weight, 0)
  if (total <= 0 || prizes.length === 0) return 0
  let cursor = Math.random() * total
  for (let i = 0; i < prizes.length; i += 1) {
    cursor -= prizes[i].weight
    if (cursor <= 0) return i
  }
  return prizes.length - 1
}

/**
 * 计算转盘目标角度：指针固定在正上方（12 点），转盘顺时针旋转。
 * 扇区已整体偏移半格，使扇区中心（而非分割线）对准正上方指针。
 */
export function calcTargetRotation(
  index: number,
  count: number,
  currentRotation: number,
  extraTurns = 5
): number {
  const slice = 360 / count
  // 扇区 i 中心在正上方起算的角度为 i * slice（0 号扇区中心即 12 点）
  const centerFromTop = index * slice
  const targetMod = ((360 - centerFromTop) % 360 + 360) % 360
  const base = Math.ceil(currentRotation / 360) * 360
  return base + extraTurns * 360 + targetMod
}

export function buildConicGradient(prizes: PrizeItem[]): string {
  if (prizes.length === 0) return 'conic-gradient(#ccc 0 360deg)'
  const slice = 360 / prizes.length
  const stops = prizes.map((item, index) => {
    const start = index * slice
    const end = (index + 1) * slice
    return `${item.color} ${start}deg ${end}deg`
  })
  // from -半扇区：让首个扇区中心落在正上方，指针对准扇面中间而非分割线
  return `conic-gradient(from ${-slice / 2}deg, ${stops.join(', ')})`
}
