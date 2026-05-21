import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShimmerButton } from "./shimmer-button";

describe("ShimmerButton", () => {
  it("renders as a <button> in button mode", () => {
    render(<ShimmerButton>Loslegen</ShimmerButton>);
    const btn = screen.getByRole("button", { name: /loslegen/i });
    expect(btn.tagName).toBe("BUTTON");
  });

  it("renders as an <a> when href is provided", () => {
    render(<ShimmerButton href="/register">Starten</ShimmerButton>);
    const link = screen.getByRole("link", { name: /starten/i });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/register");
  });

  it("fires onClick in button mode", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ShimmerButton onClick={onClick}>x</ShimmerButton>);
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies size-specific classes", () => {
    render(<ShimmerButton size="xl">x</ShimmerButton>);
    const btn = screen.getByRole("button");
    expect(btn.className).toMatch(/h-14/);
  });

  it("omits the rotating border when static=true", () => {
    const { container: dynamic } = render(
      <ShimmerButton>animated</ShimmerButton>,
    );
    const { container: stat } = render(
      <ShimmerButton static>static</ShimmerButton>,
    );
    // The rotating conic border lives in an aria-hidden span with
    // animate-conic-spin. Static mode should not render it.
    expect(
      dynamic.querySelector(".animate-conic-spin"),
    ).not.toBeNull();
    expect(stat.querySelector(".animate-conic-spin")).toBeNull();
  });

  it("respects the disabled attribute in button mode", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ShimmerButton onClick={onClick} disabled>
        x
      </ShimmerButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
