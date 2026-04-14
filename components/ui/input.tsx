import * as React from "react";
import { cn } from "@/lib/utils";

// Shared base for all field wrappers
const fieldBase =
  "input-field flex w-full px-3 py-2 text-sm " +
  "bg-[hsl(var(--input-bg))] text-[hsl(var(--input-text))] " +
  "border-[hsl(var(--input-border))] " +
  "placeholder:text-[hsl(var(--input-placeholder))] " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "transition-all duration-200";

// ================================
// Input
// ================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 text-[hsl(var(--input-placeholder))]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              fieldBase,
              "h-11 rounded-xl",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-[hsl(var(--input-placeholder))]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z"/>
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// ================================
// Textarea
// ================================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            fieldBase,
            "min-h-[120px] rounded-xl py-2.5 resize-none",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z"/>
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ================================
// Select
// ================================
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[hsl(var(--foreground))]">
            {label}
          </label>
        )}
        {/* Wrapper gives us a styled chevron */}
        <div className="relative">
          <select
            id={inputId}
            ref={ref}
            className={cn(
              fieldBase,
              "h-11 rounded-xl appearance-none pr-9 cursor-pointer",
              "bg-[hsl(var(--input-bg))] text-[hsl(var(--input-text))]",
              error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
              className
            )}
            style={{
              // Force colors on platforms that ignore CSS background on <select>
              colorScheme: "inherit",
            }}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                style={{
                  backgroundColor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              >
                {opt.label}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              className="h-4 w-4 text-[hsl(var(--muted-foreground))]"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6l4 4 4-4" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
            <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Input, Textarea, Select };
