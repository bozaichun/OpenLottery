/** 奖品条目 */
export interface PrizeItem {
  id: string
  name: string
  /** prize：中奖；thanks：谢谢惠顾 */
  type: 'prize' | 'thanks'
  /** 扇区颜色（hex） */
  color: string
  /** 相对权重，越大越易中 */
  weight: number
  enabled: boolean
}

export interface LotteryConfig {
  prizes: PrizeItem[]
  updatedAt: number
}

/** v5：标准幸运大转盘配色（白 / 米黄交替） */
export const LOTTERY_STORAGE_KEY = 'puffseed.openlottery.config.v5'

/**
 * 标准幸运大转盘扇区色
 * 0 白、1 米黄，之后交替（行业常见红金转盘内圈配色）
 */
export const SEGMENT_COLOR_WHITE = '#ffffff'
export const SEGMENT_COLOR_LIGHT = '#fff4d6'

/** @deprecated 兼容旧引用 */
export const DEFAULT_SEGMENT_COLORS = [
  SEGMENT_COLOR_WHITE,
  SEGMENT_COLOR_LIGHT,
  SEGMENT_COLOR_WHITE,
  SEGMENT_COLOR_LIGHT,
  SEGMENT_COLOR_WHITE,
  SEGMENT_COLOR_LIGHT,
  SEGMENT_COLOR_WHITE,
  SEGMENT_COLOR_LIGHT
] as const

/**
 * 按扇区序号取色：0 白、1 米黄，之后交替
 */
export function getSegmentColorByIndex(index: number): string {
  return index % 2 === 0 ? SEGMENT_COLOR_WHITE : SEGMENT_COLOR_LIGHT
}

/** 按当前顺序重排扇区色，保证转盘白/米黄交替协调 */
export function assignSegmentColors<T extends { color: string }>(prizes: T[]): T[] {
  return prizes.map((item, index) => ({
    ...item,
    color: getSegmentColorByIndex(index)
  }))
}

/** 默认 8 个扇区（标准红金幸运大转盘） */
export function createDefaultPrizes(): PrizeItem[] {
  const raw: Array<Omit<PrizeItem, 'id' | 'color' | 'enabled'>> = [
    { name: '一等奖', type: 'prize', weight: 4 },
    { name: '二等奖', type: 'prize', weight: 8 },
    { name: '三等奖', type: 'prize', weight: 12 },
    { name: '谢谢参与', type: 'thanks', weight: 18 },
    { name: '一等奖', type: 'prize', weight: 4 },
    { name: '二等奖', type: 'prize', weight: 8 },
    { name: '三等奖', type: 'prize', weight: 12 },
    { name: '四等奖', type: 'prize', weight: 14 }
  ]

  return assignSegmentColors(
    raw.map((item, index) => ({
      ...item,
      id: `prize-${index + 1}`,
      color: '',
      enabled: true
    }))
  )
}
