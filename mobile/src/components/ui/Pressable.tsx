import { Pressable as RNPressable, type PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { motion } from "../../lib/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

/**
 * Drop-in replacement for {@code Pressable} that adds the project's signature scale + opacity
 * feedback. Slightly bouncier than the button's scale because it's typically used on card-sized
 * touch targets where the springiness is more visible.
 *
 * Pass {@code scaleTo} for finer control on large cards (e.g. {@code scaleTo={0.985}}).
 */
export interface FeedbackPressableProps extends PressableProps {
  scaleTo?: number;
  opacityTo?: number;
  /** Disable the feedback animation — useful for items already inside a stagger. */
  flat?: boolean;
}

export function FeedbackPressable({
  children,
  onPressIn,
  onPressOut,
  scaleTo = 0.97,
  opacityTo = 0.85,
  flat = false,
  style,
  ...rest
}: FeedbackPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  function handleIn(e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) {
    if (!flat) {
      scale.value = withSpring(scaleTo, motion.press);
      opacity.value = withTiming(opacityTo, { duration: motion.fast });
    }
    onPressIn?.(e);
  }
  function handleOut(e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) {
    scale.value = withSpring(1, motion.press);
    opacity.value = withTiming(1, { duration: motion.fast });
    onPressOut?.(e);
  }

  return (
    <AnimatedPressable
      onPressIn={handleIn}
      onPressOut={handleOut}
      style={[style, animated]}
      {...rest}
    >
      {children as any}
    </AnimatedPressable>
  );
}
