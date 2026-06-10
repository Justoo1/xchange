/**
 * Color helpers for the XCHANGE design system.
 *
 * The design colors avatars/cards by a single `hue` number via OKLCH gradients
 * (perceptually even chroma/lightness, only the hue varies). React Native can't
 * parse `oklch()`, so we convert to hex here. We also derive the accent's
 * soft/line/ink variants the way the prototype's `color-mix()` did.
 */

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function toHex2(n: number): string {
  return Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, '0');
}

/** OKLCH (L 0–1, C chroma, H degrees) → sRGB hex. */
export function oklchToHex(L: number, C: number, H: number): string {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const gamma = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(clamp01(c), 1 / 2.4) - 0.055;

  return `#${toHex2(gamma(lr))}${toHex2(gamma(lg))}${toHex2(gamma(lb))}`;
}

/** The two-stop avatar/card gradient for a given hue (matches data.jsx avatarBg). */
export function hueGradient(hue: number): [string, string] {
  return [oklchToHex(0.62, 0.13, hue), oklchToHex(0.48, 0.15, (hue + 38) % 360)];
}

/**
 * The OKLCH hue (degrees) of a hex color — the inverse of the hue `hueGradient`
 * consumes. Lets a card's gradient/avatar brand from the chosen accent so the
 * card stays in the same color family as the picked swatch.
 */
export function hueFromHex(hex: string): number {
  const [r8, g8, b8] = parseHex(hex);
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  const r = lin(r8);
  const g = lin(g8);
  const b = lin(b8);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(bb, a) * 180) / Math.PI;
  return h < 0 ? h + 360 : h;
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

/** rgba string from a hex + alpha (the prototype's `color-mix(... %, transparent)`). */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Opaque mix of two hex colors; `t` = weight of `a` (the rest is `b`). */
export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const m = (x: number, y: number) => toHex2((x * t + y * (1 - t)) / 255);
  return `#${m(ar, br)}${m(ag, bg)}${m(ab, bb)}`;
}
