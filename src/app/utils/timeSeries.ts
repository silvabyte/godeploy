export function eachDay(from: Date, to: Date): string[] {
  const dates: string[] = []
  const cur = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  const end = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()))
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return dates
}

export function zeroFillDailySeries(
  from: string,
  to: string,
  countsByDate: Record<string, number>,
): { date: string; count: number }[] {
  const days = eachDay(new Date(from), new Date(to))
  return days.map((d) => ({ date: d, count: countsByDate[d] ?? 0 }))
}
