import { useEffect } from "react";
import { Modal, Pressable, View, Text, type ViewProps } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { X } from "lucide-react-native";
import { useThemeStore } from "../../hooks/useColorScheme";

/**
 * Native modal that slides up from the bottom — the modern alternative to centered dialogs on
 * mobile. Keeps the surface high (`pt-4 pb-8`) so the safe-area inset doesn't crowd content.
 *
 * <pre>
 *  &lt;BottomSheet open={open} onClose={() =&gt; setOpen(false)} title="Filter"&gt;
 *    &lt;FilterPanel /&gt;
 *  &lt;/BottomSheet&gt;
 * </pre>
 */
export interface BottomSheetProps extends Omit<ViewProps, "children"> {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Cover the full screen (true) or fit content (false, default). */
  fullScreen?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  fullScreen = false,
  ...rest
}: BottomSheetProps) {
  const { isDark } = useThemeStore();
  const translateY = useSharedValue(600);
  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (open) {
      overlayOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, {
        duration: 320,
        easing: Easing.out(Easing.exp),
      });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 180 });
      translateY.value = withTiming(600, {
        duration: 260,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [open, overlayOpacity, translateY]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  function handleDismiss() {
    overlayOpacity.value = withTiming(0, { duration: 180 });
    translateY.value = withTiming(
      600,
      { duration: 260, easing: Easing.in(Easing.quad) },
      (finished) => {
        if (finished) runOnJS(onClose)();
      },
    );
  }

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }, overlayStyle]}>
        <Pressable className="flex-1" onPress={handleDismiss} />
        <Animated.View
          style={sheetStyle}
          className={`absolute left-0 right-0 bottom-0 rounded-t-3xl pt-3 pb-8 ${
            isDark ? "bg-dark-card" : "bg-white"
          }`}
          {...rest}
        >
          {/* Grabber */}
          <View
            className={`self-center w-10 h-1.5 rounded-full mb-3 ${
              isDark ? "bg-dark-border" : "bg-gray-200"
            }`}
          />
          {title && (
            <View className="flex-row items-center justify-between px-5 pb-3">
              <Text
                className={`text-base font-bold ${isDark ? "text-dark-text" : "text-gray-900"}`}
              >
                {title}
              </Text>
              <Pressable
                onPress={handleDismiss}
                hitSlop={12}
                className={`rounded-full p-1 ${isDark ? "bg-dark-bg" : "bg-gray-100"}`}
              >
                <X size={16} color={isDark ? "#e2e8f0" : "#0f172a"} />
              </Pressable>
            </View>
          )}
          <View className={fullScreen ? "flex-1" : ""}>{children}</View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
