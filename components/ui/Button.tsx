import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
          variant === "primary" &&
            "bg-prime text-white hover:bg-prime-light active:bg-prime-dark",
          variant === "secondary" &&
            "bg-bone/90 text-void hover:bg-bone",
          variant === "ghost" &&
            "bg-white/10 text-bone hover:bg-white/20 backdrop-blur-sm",
          variant === "outline" &&
            "border border-mist/40 text-bone hover:border-bone bg-transparent",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-5 py-2.5 text-base",
          size === "lg" && "px-7 py-3.5 text-lg",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
