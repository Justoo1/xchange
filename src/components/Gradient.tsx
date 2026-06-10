import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

// Let NativeWind map `className` → `style` on the gradient so we can size/round
// it with utilities while still passing `colors` as a prop.
export const Gradient = cssInterop(LinearGradient, { className: 'style' });

/** Diagonal top-left → bottom-right, matching the card direction in the design. */
export const DIAGONAL = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } } as const;
