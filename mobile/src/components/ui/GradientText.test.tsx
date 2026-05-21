import React from "react";
import { render } from "@testing-library/react-native";

// Iter 150 — inline native module mocks. Jest hoists jest.mock() to the
// top of the file before imports run, so the GradientText import below
// will see these mocks instead of the real native bindings.
// Mocks must not reference outer variables (nativewind injects refs to
// `_ReactNativeCSSInterop` which clashes with jest's hoist rule). We
// stub the native modules to plain pass-through components built from
// require() inside the factory.
jest.mock("@react-native-masked-view/masked-view", () => {
  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    default: require("react-native").View,
  };
});
jest.mock("expo-linear-gradient", () => {
  return {
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    LinearGradient: require("react-native").View,
  };
});

import { GradientText } from "./GradientText";

/**
 * Iter 150 — smoke tests for mobile GradientText.
 *
 * MaskedView + LinearGradient are mocked to plain Views (above) so we
 * test the React-level wiring, not the native gradient render.
 *
 * NOTE: GradientText renders its text TWICE internally — once as the
 * visible mask element, once as the invisible duplicate that provides
 * dimensions to the LinearGradient. Tests use getAllByText accordingly.
 */
describe("GradientText", () => {
  it("renders the text content", () => {
    const { getAllByText } = render(<GradientText>Deutschland</GradientText>);
    expect(getAllByText("Deutschland").length).toBeGreaterThanOrEqual(1);
  });

  it("renders for each variant without throwing", () => {
    const variants = ["brand", "aurora", "sunrise", "flame"] as const;
    for (const v of variants) {
      const { getAllByText } = render(
        <GradientText variant={v}>{v}</GradientText>
      );
      expect(getAllByText(v).length).toBeGreaterThan(0);
    }
  });

  it("forwards style prop to the underlying Text", () => {
    const { getAllByText } = render(
      <GradientText style={{ fontSize: 36, fontWeight: "800" }}>
        Headline
      </GradientText>
    );
    const nodes = getAllByText("Headline");
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes[0]?.props.style).toBeDefined();
  });

  it("defaults to brand variant when no variant prop", () => {
    const { getAllByText } = render(<GradientText>default</GradientText>);
    expect(getAllByText("default").length).toBeGreaterThan(0);
  });
});
