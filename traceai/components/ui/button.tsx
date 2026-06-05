import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-[#1428A0] text-white hover:bg-[#1E3ADB] shadow-md hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-2 border-[#1428A0]/20 bg-transparent text-[#1428A0] hover:bg-[#1428A0] hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-[#1428A0] underline-offset-4 hover:underline",
        success: "bg-[#16A34A] text-white hover:bg-[#15803D] shadow-md",
        warning: "bg-[#F59E0B] text-white hover:bg-[#D97706] shadow-md",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-[10px] px-4",
        lg: "h-12 rounded-[12px] px-8 text-base",
        xl: "h-14 rounded-[12px] px-10 text-lg",
        icon: "h-10 w-10",
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
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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

export { Button, buttonVariants };
