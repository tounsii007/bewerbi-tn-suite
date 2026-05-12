import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  invalid?: boolean;
}

const fieldWrapperBase =
  "group flex w-full items-center gap-2 rounded-xl border bg-white px-3 text-[15px] " +
  "transition-[border-color,box-shadow,background] duration-150 " +
  "dark:bg-dark-card dark:border-dark-border";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leadingIcon, trailingIcon, invalid, disabled, ...props }, ref) => (
    <div
      className={cn(
        fieldWrapperBase,
        "h-11",
        disabled && "opacity-60 pointer-events-none",
        invalid
          ? "border-accent-500 shadow-[0_0_0_3px_oklch(0.629_0.21_25/0.18)]"
          : "border-gray-200 focus-within:border-primary-500 focus-within:shadow-[0_0_0_3px_oklch(0.611_0.1733_254/0.20)]",
        className,
      )}
    >
      {leadingIcon && (
        <span className="text-gray-400 dark:text-dark-muted">{leadingIcon}</span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex-1 bg-transparent outline-none placeholder:text-gray-400",
          "dark:text-dark-text dark:placeholder:text-dark-muted",
          "disabled:cursor-not-allowed",
        )}
        {...props}
      />
      {trailingIcon && (
        <span className="text-gray-400 dark:text-dark-muted">{trailingIcon}</span>
      )}
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
    aria-invalid={invalid || undefined}
    className={cn(
      "w-full rounded-xl border bg-white p-3 text-[15px] outline-none",
      "transition-[border-color,box-shadow] duration-150",
      "dark:bg-dark-card dark:border-dark-border dark:text-dark-text",
      invalid
        ? "border-accent-500 shadow-[0_0_0_3px_oklch(0.629_0.21_25/0.18)]"
        : "border-gray-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_oklch(0.611_0.1733_254/0.20)]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

/**
 * Form-field wrapper that bundles label, hint, and error display so pages don't have to
 * rewrite the same grid every time.
 */
export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-gray-700 dark:text-dark-text"
        >
          {label}
          {required && <span className="ml-0.5 text-accent-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-accent-600 dark:text-accent-500">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500 dark:text-dark-muted">{hint}</p>
      ) : null}
    </div>
  );
}
