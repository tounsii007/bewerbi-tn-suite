import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BentoGrid, BentoCell } from "./bento-grid";

/**
 * Iter 145 — verifies the BentoCell span/row mapping that powers the
 * Iter 117 dashboard + landing layouts. These are pure className
 * tests because happy-dom doesn't run actual CSS Grid layout.
 */
describe("BentoGrid", () => {
  it("renders the .bento wrapper", () => {
    const { container } = render(
      <BentoGrid>
        <BentoCell>child</BentoCell>
      </BentoGrid>,
    );
    expect(container.querySelector(".bento")).not.toBeNull();
  });

  it("renders all child cells", () => {
    const { getAllByText } = render(
      <BentoGrid>
        <BentoCell>a</BentoCell>
        <BentoCell>b</BentoCell>
        <BentoCell>c</BentoCell>
      </BentoGrid>,
    );
    expect(getAllByText(/[abc]/).length).toBe(3);
  });
});

describe("BentoCell", () => {
  it("defaults to col-span-12 (full-width on mobile)", () => {
    const { container } = render(<BentoCell>x</BentoCell>);
    expect((container.firstChild as HTMLElement).className).toMatch(
      /col-span-12/,
    );
  });

  it("applies the base span class for span.base", () => {
    const { container } = render(<BentoCell span={{ base: 6 }}>x</BentoCell>);
    expect((container.firstChild as HTMLElement).className).toMatch(
      /col-span-6/,
    );
  });

  it("applies md: and lg: prefixed classes", () => {
    const { container } = render(
      <BentoCell span={{ md: 8, lg: 4 }}>x</BentoCell>,
    );
    const cls = (container.firstChild as HTMLElement).className;
    expect(cls).toMatch(/md:col-span-8/);
    expect(cls).toMatch(/lg:col-span-4/);
  });

  it("applies row-span-* for rows prop", () => {
    const { container } = render(<BentoCell rows={2}>x</BentoCell>);
    expect((container.firstChild as HTMLElement).className).toMatch(
      /row-span-2/,
    );
  });

  it("rows=1 does NOT emit row-span-1 (it's the default)", () => {
    const { container } = render(<BentoCell rows={1}>x</BentoCell>);
    expect((container.firstChild as HTMLElement).className).not.toMatch(
      /row-span-/,
    );
  });

  it("interactive=true adds the lift class", () => {
    const { container } = render(<BentoCell interactive>x</BentoCell>);
    expect((container.firstChild as HTMLElement).className).toMatch(/lift/);
  });
});
