import { TRIP, type TripEvent } from "./trip";

/** Convierte fecha + hora de Mendoza a un Date (instante UTC). */
function toInstant(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh - TRIP.utcOffsetHours, mm));
}

function stamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Pliega líneas a 75 octetos como pide RFC 5545. */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function vevent(e: TripEvent): string[] {
  return [
    "BEGIN:VEVENT",
    `UID:${e.id}@despedida-gordo`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(toInstant(e.date, e.start))}`,
    `DTEND:${stamp(toInstant(e.endDate ?? e.date, e.end))}`,
    `SUMMARY:${escapeText(`${e.title} · Despedida del Gordo`)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    ...(e.location ? [`LOCATION:${escapeText(e.location)}`] : []),
    "END:VEVENT",
  ];
}

export function buildIcs(events: TripEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Despedida del Gordo//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.flatMap(vevent),
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e: TripEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${e.title} · Despedida del Gordo`,
    dates: `${stamp(toInstant(e.date, e.start))}/${stamp(toInstant(e.endDate ?? e.date, e.end))}`,
    details: e.description,
    ...(e.location ? { location: e.location } : {}),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Descarga (o abre en iOS) un .ics generado en el cliente. */
export function downloadIcs(filename: string, events: TripEvent[]): void {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
