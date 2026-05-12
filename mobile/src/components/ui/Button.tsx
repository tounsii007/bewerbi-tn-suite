import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { motion } from "../../lib/tokens";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "subtle"
  | "destructive"
  | "gradient";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  disabled?: boolean;
  /** Renders before the title. */
  icon?: React.ReactNode;
  /** Renders after the title. */
  trailingIcon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  /** Accessible label — falls back to {@code title}. */
  accessibilityLabel?: string;
}

/**
 * Press-feedback button shared across the mobile app. Spring scales to 0.97 on press-in, fades
 * its opacity once disabled, and swaps the body for a spinner during {@code loading}. Variants
 * are kept intentionally small — the screens lean on three or four well-tested looks.
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  trailingIcon,
  className = "",
  fullWidth = false,
  accessibilityLabel,
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, motion.press);
    opacity.value = withTiming(0.85, { duration: motion.fast, easing: Easing.out(Easing.quad) });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, motion.press);
    opacity.value = withTiming(1, { duration: motion.fast, easing: Easing.out(Easing.quad) });
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-primary-500",
    secondary: "bg-accent-500",
    destructive: "bg-accent-500",
    outline: "border border-primary-500 bg-transparent",
    ghost: "bg-transparent",
    subtle: "bg-primary-50 dark:bg-primary-500/15",
    // RN doesn't support real CSS gradients; this looks gradient-like with a darker base.
    gradient: "bg-primary-600",
  };

  const sizeStyles = {
    sm: "px-4 py-2.5 min-h-[36px] rounded-xl",
    md: "px-6 py-3.5 min-h-[48px] rounded-2xl",
    lg: "px-8 py-4   min-h-[52px] rounded-2xl",
    xl: "px-9 py-5   min-h-[58px] rounded-3xl",
  };

  const textVariant: Record<ButtonVariant, string> = {
    primary: "text-white",
    secondary: "text-white",
    destructive: "text-white",
    outline: "text-primary-500",
    ghost: "text-primary-500",
    subtle: "text-primary-700 dark:text-primary-300",
    gradient: "text-white",
  };

  const textSize = {
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-base",
    xl: "text-[17px]",
  };

  const spinnerColor =
    variant === "primary" ||
    variant === "secondary" ||
    variant === "destructive" ||
    variant === "gradient"
      ? "#ffffff"
      : "#2563EB";

  return (
    <AnimatedTouchable
      style={animatedStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      className={`items-center justify-center flex-row ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-40" : ""} ${fullWidth ? "w-full" : ""} ${className}`}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          {title ? (
            <Text className={`font-semibold ${textVariant[variant]} ${textSize[size]}`}>
              {title}
            </Text>
          ) : null}
          {trailingIcon}
        </View>
      )}
    </AnimatedTouchable>
  );
}
