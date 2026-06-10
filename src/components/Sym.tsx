import { MaterialIcons } from '@expo/vector-icons';

export type SymName = keyof typeof MaterialIcons.glyphMap;

/**
 * Icon wrapper. The design uses Material Symbols Rounded; we render the closest
 * MaterialIcons glyphs (same names, kebab-cased) from @expo/vector-icons.
 */
export function Sym({
  name,
  size = 24,
  color,
  style,
}: {
  name: SymName;
  size?: number;
  color?: string;
  style?: object;
}) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}
