import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leadingIcon, trailingIcon, invalid, ...props }, ref) => (
    <div
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-xl border bg-white px-3 text-[15px]",
        "dark:bg-dark-card dark:border-dark-border",
        invalid
          ? "border-accent-500"
          : "border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20",
        className,
      )}
    >
      {leadingIcon && <span className="text-gray-400 dark:text-dark-muted">{leadingIcon}</span>}
      <input
        ref={ref}
        className={cn(
          "flex-1 bg-transparent outline-none placeholder:text-gray-400",
          "dark:text-dark-text dark:placeholder:text-dark-muted",
        )}
        {...props}
      />
      {trailingIcon && <span className="text-gray-400 dark:text-dark-muted">{trailingIcon}</span>}
    </div>
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      "w-full rounded-xl border bg-white p-3 text-[15px] outline-none",
      "dark:bg-dark-card dark:border-dark-border dark:text-dark-text",
      invalid
        ? "border-accent-500"
        : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
