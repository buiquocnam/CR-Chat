const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const smartFormat = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, "0");

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const isThisWeek = (() => {
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - now.getDay()); // Sunday is the first day of the week
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    return d >= firstDayOfWeek && d <= lastDayOfWeek;
  })();

  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (isToday) return time;
  if (isThisWeek) return `${time} - ${DAYS[d.getDay()]}`;
  return `${time} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};


export function isTimeGapLarge(prevDate: string, nextDate: string): boolean {
    const diff = new Date(nextDate).getTime() - new Date(prevDate).getTime();
    return diff > 5 * 60 * 1000; // 5 phút
  }