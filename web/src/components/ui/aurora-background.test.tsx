import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AuroraBackground } from "./aurora-background";

describe("AuroraBackground", () => {
  it("renders children inside the wrapper", () => {
    const { getByText } = render(
      <AuroraBackground>
        <span>hero content</span>
      </AuroraBackground>,
    );
    expect(getByText("hero content")).toBeInTheDocument();
  });

  it("renders three decorative blobs (default)", () => {
    const { container } = render(
      <AuroraBackground>
        <span />
      </AuroraBackground>,
    );
    // Each blob is a <span> with rounded-full inside the pointer-events-none aria-hidden wrapper
    const decorWrapper = container.querySelector("[aria-hidden]");
    expect(decorWrapper).not.toBeNull();
    const blobs = decorWrapper!.querySelectorAll(".rounded-full");
    // 3 blobs + 1 dark-mode tint span = 4 elements; we check >= 3
    expect(blobs.length).toBeGreaterThanOrEqual(3);
  });

  it("emits animate-blob classes when not static", () => {
    const { container } = render(
      <AuroraBackground>
        <span />
      </AuroraBackground>,
    );
    const animated = container.querySelectorAll(".animate-blob, .animate-blob-slow");
    expect(animated.length).toBeGreaterThan(0);
  });

  it("omits animate-blob classes when static=true", () => {
    const { container } = render(
      <AuroraBackground static>
        <span />
      </AuroraBackground>,
    );
    const animated = container.querySelectorAll(".animate-blob, .animate-blob-slow");
    expect(animated.length).toBe(0);
  });

  it("changes opacity bucket when variant changes", () => {
    const { container: subtle } = render(
      <AuroraBackground variant="subtle">
        <span />
      </AuroraBackground>,
    );
    const { container: vivid } = render(
      <AuroraBackground variant="vivid">
        <span />
      </AuroraBackground>,
    );
    const subtleDecor = subtle.querySelector("[aria-hidden]") as HTMLElement;
    const vividDecor = vivid.querySelector("[aria-hidden]") as HTMLElement;
    expect(subtleDecor.className).not.toEqual(vividDecor.className);
  });
});
