// utils/parse-times.ts
export type ParsedTimes = {
  place: string[]
  day: number[]
  startTime: number[]
  endTime: number[]
}

const DAY_MAP: Record<string, number> = {
  "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "日": 7, "天": 7,
  "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7,
}

function parseDayToken(tok: string): number | null {
  const t = tok.trim()
  if (DAY_MAP[t] != null) return DAY_MAP[t]
  // 數字日也允許：1..7
  const n = Number(t)
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : null
}

function parsePeriodToken(tok: string): [number, number] | null {
  const t = tok.replace(/\s/g, "")
  // 支援 "6,7" | "6-7" | "6~7" | "6"
  const mComma = t.match(/^(\d+),(\d+)$/)
  if (mComma) {
    const a = Number(mComma[1]), b = Number(mComma[2])
    return [Math.min(a, b), Math.max(a, b)]
  }
  const mRange = t.match(/^(\d+)[-~–—](\d+)$/)
  if (mRange) {
    const a = Number(mRange[1]), b = Number(mRange[2])
    return [Math.min(a, b), Math.max(a, b)]
  }
  const mSingle = t.match(/^(\d+)$/)
  if (mSingle) {
    const v = Number(mSingle[1])
    return [v, v]
  }
  return null
}

/** 解析像 ["五 / 6,7 / B 206", "三/3-4/資電101"] 的陣列 */
export function parseTimes(times: string[] | undefined | null): ParsedTimes {
  const out: ParsedTimes = { place: [], day: [], startTime: [], endTime: [] }
  if (!times || times.length === 0) return out

  for (const line of times) {
    // 切成 三段：day / periods / place
    const parts = line.split("/").map(s => s.trim()).filter(Boolean)
    if (parts.length < 2) continue
    const d = parseDayToken(parts[0])
    const pe = parsePeriodToken(parts[1])
    const pl = (parts[2] ?? "").replace(/\s+/g, "")

    if (d != null && pe != null) {
      out.day.push(d)
      out.startTime.push(pe[0])
      out.endTime.push(pe[1])
      out.place.push(pl)
    }
  }
  return out
}
