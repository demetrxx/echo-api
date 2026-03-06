export function formatTimestamp(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  if (hrs > 0) {
    return `${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}`;
  }

  return `${pad2(mins)}:${pad2(secs)}`;
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0');
}

export function parseTimestampToSeconds(timestamp: string): number | null {
  const parts = timestamp.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}
