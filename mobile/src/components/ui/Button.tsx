import { TouchableOpacity, Text, ActivityIndicator, View, Platform } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }); };
  const handlePressOut = () => { scale.value = withSpring(1, { damping: 15, stiffness: 400 }); };

  const variantStyles = {
    primary: "bg-primary-500",
    secondary: "bg-accent-500",
    outline: "border-[1.5px] border-primary-500 bg-transparent",
    ghost: "bg-transparent",
  };

  const sizeStyles = {
    sm: "px-4 py-2.5 min-h-[36px]",
    md: "px-6 py-3.5 min-h-[48px]",
    lg: "px-8 py-4 min-h-[52px]",
  };

  const textVariant = {
    primary: "text-white",
    secondary: "text-white",
    outline: "text-primary-500",
    ghost: "text-primary-500",
  };

  const textSize = {
    sm: "text-[13px]",
    md: "text-[15px]",
    lg: "text-base",
  };

  return (
    <AnimatedTouchable
      style={animatedStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={`rounded-xl items-center justify-center flex-row ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "opacity-40" : ""} ${fullWidth ? "w-full" : ""} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "secondary" ? "#fff" : "#2563EB"} size="small" />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          {title ? (
            <Text className={`font-semibold ${textVariant[variant]} ${textSize[size]}`}>
              {title}
            </Text>
          ) : null}
        </View>
      )}
    </AnimatedTouchable>
  );
}
