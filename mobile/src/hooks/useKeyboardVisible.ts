import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/**
 * Tracks whether the on-screen keyboard is currently visible. Screens use this to push their
 * footer button above the keyboard instead of letting it hide behind it.
 */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return visible;
}
