export function formatDateTime(value: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));
}

export function formatDateOnly(value: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-NZ", {
    timeZone,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: "NZD",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDurationMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
}

export function minutesBetween(start: string | Date, end: string | Date) {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
}
