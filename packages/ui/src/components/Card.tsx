import * as React from "react";
import { cn } from "../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  notch?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, notch = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-md border border-[var(--line)] bg-[var(--paper-raised)] text-[var(--ink)] shadow-xs transition-colors",
        className
      )}
      {...props}
    >
      {notch && (
        <>
          <span aria-hidden="true" className="pointer-events-none absolute -top-px -left-px size-1.5 border-t-2 border-l-2 border-[var(--line-strong)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -top-px -right-px size-1.5 border-t-2 border-r-2 border-[var(--line-strong)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px size-1.5 border-b-2 border-l-2 border-[var(--line-strong)]" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-px -bottom-px size-1.5 border-r-2 border-b-2 border-[var(--line-strong)]" />
        </>
      )}
      {children}
    </div>
  )
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5 md:p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-medium leading-none tracking-tight text-base md:text-lg text-[var(--ink)]", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs md:text-sm text-[var(--ink-muted)] leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-5 md:p-6 pt-0 md:pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-5 md:p-6 pt-0 md:pt-0 text-[var(--ink)]", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

