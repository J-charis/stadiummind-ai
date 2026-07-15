export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatMinutesEta(minutes: number): string {
  if (minutes < 1) return 'now';
  if (minutes === 1) return '1 min';
  return `${Math.round(minutes)} min`;
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}
