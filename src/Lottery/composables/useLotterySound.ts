/** puffseed：转盘 / 中奖 / 谢谢惠顾音效（Web Audio 合成，无外置资源） */
let sharedCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  if (!sharedCtx || sharedCtx.state === 'closed') {
    sharedCtx = new Ctx()
  }
  return sharedCtx
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType,
  gainPeak: number
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** 生成先密后疏的滴答时间点，贴合转盘减速 */
function buildTickOffsets(durationSec: number): number[] {
  const ticks: number[] = []
  let elapsed = 0
  while (elapsed < durationSec - 0.08) {
    ticks.push(elapsed)
    const progress = elapsed / durationSec
    // 前半段密集，后半段明显变慢
    const interval = 0.045 + progress * progress * 0.32
    elapsed += interval
  }
  return ticks
}

export function useLotterySound() {
  let spinMuteGain: GainNode | null = null

  async function ensureRunning() {
    const ctx = getAudioContext()
    if (!ctx) return null
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    return ctx
  }

  /** 停止正在播放的转动音效 */
  function stopSpin() {
    if (!spinMuteGain || !sharedCtx) return
    const now = sharedCtx.currentTime
    try {
      spinMuteGain.gain.cancelScheduledValues(now)
      spinMuteGain.gain.setValueAtTime(spinMuteGain.gain.value, now)
      spinMuteGain.gain.linearRampToValueAtTime(0.0001, now + 0.04)
    } catch {
      // ignore
    }
    spinMuteGain = null
  }

  /**
   * 转动音效：短促滴答，节奏随减速由快变慢
   * @param durationMs 与转盘 CSS 过渡时长一致
   */
  async function playSpin(durationMs: number) {
    stopSpin()
    const ctx = await ensureRunning()
    if (!ctx) return

    const master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)
    spinMuteGain = master

    const t0 = ctx.currentTime
    const durationSec = Math.max(0.5, durationMs / 1000)
    const offsets = buildTickOffsets(durationSec)

    offsets.forEach((offset) => {
      const progress = offset / durationSec
      const freq = 920 - progress * 220
      const peak = 0.055 * (1 - progress * 0.35)

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      const start = t0 + offset
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(peak, start + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.035)
      osc.connect(gain)
      gain.connect(master)
      osc.start(start)
      osc.stop(start + 0.05)
    })
  }

  /** 中奖：上扬和弦 */
  async function playWin() {
    stopSpin()
    const ctx = await ensureRunning()
    if (!ctx) return
    const t = ctx.currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone(ctx, freq, t + i * 0.09, 0.28, 'triangle', 0.12)
    })
  }

  /** 谢谢惠顾：轻柔下行音 */
  async function playThanks() {
    stopSpin()
    const ctx = await ensureRunning()
    if (!ctx) return
    const t = ctx.currentTime
    ;[392, 349.23, 293.66].forEach((freq, i) => {
      tone(ctx, freq, t + i * 0.14, 0.32, 'sine', 0.08)
    })
  }

  return { playSpin, stopSpin, playWin, playThanks }
}
