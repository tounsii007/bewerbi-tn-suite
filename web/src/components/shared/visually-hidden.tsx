import * as React from "react";

/**
 * Visually hides the children while keeping them accessible to assistive tech. Use for
 * descriptions on icon-only buttons, status announcements, and labels that would be redundant
 * for sighted users but mandatory for screen-readers.
 */
export function VisuallyHidden({
  asChild = false,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: `sr-only ${(children as React.ReactElement<{ className?: string }>).props.className ?? ""}`.trim(),
    });
  }
  return <span className="sr-only">{children}</span>;
}
