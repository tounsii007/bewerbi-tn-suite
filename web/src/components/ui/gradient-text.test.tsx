import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GradientText } from "./gradient-text";

/**
 * Iter 145 — smoke tests for GradientText. We can't directly assert
 * gradient colours in jsdom/happy-dom (no real layout), so we focus on
 * three things:
 *   1. the rendered DOM tag matches the `as` prop
 *   2. children are forwarded as text content
 *   3. variant changes the className (proxy for gradient swap)
 */
describe("GradientText", () => {
  it("renders the text content", () => {
    render(<GradientText>Deutschland</GradientText>);
    expect(screen.getByText("Deutschland")).toBeInTheDocument();
  });

  it("renders as the requested tag (default span)", () => {
    const { container } = render(<GradientText>x</GradientText>);
    expect(container.querySelector("span")).not.toBeNull();
  });

  it("renders as h1 when as='h1'", () => {
    const { container } = render(<GradientText as="h1">x</GradientText>);
    expect(container.querySelector("h1")).not.toBeNull();
  });

  it("applies a different className when variant changes", () => {
    const { container: brand } = render(
      <GradientText variant="brand">x</GradientText>,
    );
    const { container: sunrise } = render(
      <GradientText variant="sunrise">x</GradientText>,
    );
    expect(brand.firstChild).not.toBeNull();
    expect(sunrise.firstChild).not.toBeNull();
    expect((brand.firstChild as HTMLElement).className).not.toEqual(
      (sunrise.firstChild as HTMLElement).className,
    );
  });

  it("forwards additional className", () => {
    const { container } = render(
      <GradientText className="extra-class">x</GradientText>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(
      /extra-class/,
    );
  });

  it("toggles animate-border-flow class via the animate prop", () => {
    const { container: on } = render(
      <GradientText animate>x</GradientText>,
    );
    const { container: off } = render(
      <GradientText animate={false}>x</GradientText>,
    );
    expect((on.firstChild as HTMLElement).className).toMatch(/animate-border-flow/);
    expect((off.firstChild as HTMLElement).className).not.toMatch(
      /animate-border-flow/,
    );
  });
});
