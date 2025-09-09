// utils/parse-times.ts
export type ParsedTimes = {
  place: string[];
  day: number[];
  startTime: number[];
  endTime: number[];
};

const DAY_MAP: Record<string, number> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  日: 7,
  天: 7,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function parseDayToken(tok: string): number | null {
  const t = tok.trim();
  if (DAY_MAP[t] != null) return DAY_MAP[t];
  const n = Number(t);
  return Number.isInteger(n) && n >= 1 && n <= 7 ? n : null;
}

/** 解析時段字串，支援：'6', '6-8', '6~8', '6,7,8', '3-4,6,8-10'
 * 輸出為多個 [start, end]；會把連續節次合併（如 6,7,8 -> [6,8]）
 */
function parsePeriodTokens(tok: string): Array<[number, number]> | null {
  const t = tok.replace(/\s/g, "").replace(/，/g, ",");
  if (!t) return null;

  // 先展開為所有單一節次的集合
  const points: number[] = [];
  for (const seg of t.split(",")) {
    if (!seg) continue;
    const mRange = seg.match(/^(\d+)[-~–—](\d+)$/);
    if (mRange) {
      let a = Number(mRange[1]),
        b = Number(mRange[2]);
      if (!Number.isInteger(a) || !Number.isInteger(b)) return null;
      if (a > b) [a, b] = [b, a];
      for (let v = a; v <= b; v++) points.push(v);
      continue;
    }
    const mSingle = seg.match(/^(\d+)$/);
    if (mSingle) {
      const v = Number(mSingle[1]);
      if (!Number.isInteger(v)) return null;
      points.push(v);
      continue;
    }
    return null;
  }

  if (points.length === 0) return null;
  points.sort((a, b) => a - b);

  // 把連續數字壓成區間
  const out: Array<[number, number]> = [];
  let s = points[0],
    e = points[0];
  for (let i = 1; i < points.length; i++) {
    const v = points[i];
    if (v === e + 1) {
      e = v;
    } else if (v === e) {
      // 重複值，跳過
      continue;
    } else {
      out.push([s, e]);
      s = e = v;
    }
  }
  out.push([s, e]);
  return out;
}

/** 解析像 ["五 / 6,7,8 / E 219", "三/3-4/資電101"] 的陣列 */
export function parseTimes(times: string[] | undefined | null): ParsedTimes {
  const out: ParsedTimes = { place: [], day: [], startTime: [], endTime: [] };
  if (!times || times.length === 0) return out;

  for (const line of times) {
    const parts = line
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 2) continue;
    const d = parseDayToken(parts[0]);
    const intervals = parsePeriodTokens(parts[1]);
    const pl = (parts[2] ?? "").replace(/\s+/g, "");

    if (d != null && intervals != null) {
      for (const [st, en] of intervals) {
        out.day.push(d);
        out.startTime.push(st);
        out.endTime.push(en);
        out.place.push(pl);
      }
    }
  }
  return out;
}
