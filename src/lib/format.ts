/** "Mara Okafor" → "MO" (first two words' initials). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

/** "Photographer · Traveler" from title + company. */
export function roleOf(title?: string, company?: string): string {
  return [title, company].filter(Boolean).join(' · ');
}

const METHOD_LABEL: Record<string, string> = { qr: 'QR', tap: 'Tap', nearby: 'Nearby' };
export function methodLabel(m: string): string {
  return METHOD_LABEL[m] ?? m;
}

/** Group label for a timestamp: "Now" | "Today" | "Yesterday" | "Mon" | "Mar 4". */
export function whenLabel(epoch: number, now = Date.now()): string {
  const diff = now - epoch;
  if (diff < 60_000) return 'Now';
  const startOfDay = (t: number) => {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };
  const days = Math.round((startOfDay(now) - startOfDay(epoch)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return new Date(epoch).toLocaleDateString(undefined, { weekday: 'short' });
  return new Date(epoch).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
