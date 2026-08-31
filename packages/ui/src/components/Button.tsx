import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--ink)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-[var(--paper)] hover:opacity-90 active:scale-[0.99] shadow-xs font-medium",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99] shadow-xs font-medium",
        outline:
          "border border-[var(--line-strong)] bg-transparent text-[var(--ink)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)] active:scale-[0.99] shadow-xs",
        secondary:
          "bg-[var(--paper-sunken)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--paper-raised)] active:scale-[0.99]",
        ghost:
          "text-[var(--ink-muted)] hover:bg-[var(--paper-sunken)] hover:text-[var(--ink)]",
        link:
          "text-[var(--ink)] underline-offset-4 hover:underline p-0 h-auto font-normal",
        subtle:
          "bg-[var(--paper-sunken)] text-[var(--ink)] hover:bg-[var(--paper-raised)]",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs sm:text-sm",
        sm: "h-8 rounded-md px-3 text-xs font-medium",
        lg: "h-11 rounded-md px-6 text-sm font-medium",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";


