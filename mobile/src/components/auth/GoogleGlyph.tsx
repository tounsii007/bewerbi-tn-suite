import { View } from "react-native";
import { Svg, Path } from "react-native-svg";

/**
 * Iter 184 — shared multicolour Google "G" glyph. Was duplicated
 * 3× across `GoogleSignInButton`, `linked-accounts.tsx`, and
 * `activity.tsx` (each with the same 4 fill colors + path data,
 * just different sizes). One source of truth now.
 *
 * Render size defaults to 18; pass {@code size} to scale.
 *
 * Same colours as the web glyph (next to {@code @react-oauth/google}'s
 * default button) so cross-platform builds look identical.
 */
export function GoogleGlyph({ size = 18 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
        />
        <Path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
        />
        <Path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.2c-2 1.4-4.5 2.4-7.3 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
        />
        <Path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.6l6.2 5.2C40.4 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"
        />
      </Svg>
    </View>
  );
}
