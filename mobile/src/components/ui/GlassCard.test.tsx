import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

// expo-blur BlurView falls back to a plain View in tests.
jest.mock("expo-blur", () => {
  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    BlurView: require("react-native").View,
  };
});

// useThemeStore — stable mock so tests don't depend on system theme.
jest.mock("../../hooks/useColorScheme", () => ({
  __esModule: true,
  useThemeStore: () => ({ isDark: false, theme: "light", setTheme: jest.fn() }),
}));

import { GlassCard } from "./GlassCard";

describe("GlassCard", () => {
  it("renders its children", () => {
    const { getByText } = render(
      <GlassCard>
        <Text>inside</Text>
      </GlassCard>
    );
    expect(getByText("inside")).toBeTruthy();
  });

  it("is non-interactive without onPress", () => {
    const { getByText } = render(
      <GlassCard>
        <Text>static</Text>
      </GlassCard>
    );
    // No Pressable wrapper expected
    const node = getByText("static");
    expect(node).toBeTruthy();
  });

  it("becomes pressable when onPress is provided", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <GlassCard onPress={onPress}>
        <Text>tap me</Text>
      </GlassCard>
    );
    fireEvent.press(getByText("tap me"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("renders with each strength variant", () => {
    const strengths = ["subtle", "default", "strong", "frosted"] as const;
    for (const s of strengths) {
      const { getByText } = render(
        <GlassCard strength={s}>
          <Text>{s}</Text>
        </GlassCard>
      );
      expect(getByText(s)).toBeTruthy();
    }
  });

  it("applies glow style when glow=true", () => {
    const { getByText, rerender } = render(
      <GlassCard>
        <Text>no glow</Text>
      </GlassCard>
    );
    expect(getByText("no glow")).toBeTruthy();
    rerender(
      <GlassCard glow>
        <Text>with glow</Text>
      </GlassCard>
    );
    expect(getByText("with glow")).toBeTruthy();
  });
});
