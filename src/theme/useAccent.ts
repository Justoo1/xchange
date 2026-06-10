import { useSettings } from '@/state/settings';
import { accentSet, type AccentSet } from '@/theme';

/** The active brand accent + its derived soft/line/ink variants. */
export function useAccent(): AccentSet {
  return accentSet(useSettings((s) => s.accent));
}
