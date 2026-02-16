export function getDatesInRange(fromDate: Date, toDate: Date): Date[] {
  const dates: Date[] = [];
  const from = new Date(fromDate);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(toDate);
  to.setUTCHours(0, 0, 0, 0);
  const curr = new Date(from);
  while (curr <= to) {
    dates.push(new Date(curr));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}
