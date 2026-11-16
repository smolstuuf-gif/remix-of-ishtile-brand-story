import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:scale-[1.015] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:translate-y-0.5 active:scale-[0.96] active:duration-100 motion-reduce:transition-none motion-reduce:transform-none motion-reduce:active:transform-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[0_3px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_5px_0_0_color-mix(in_oklab,var(--foreground)_18%,transparent)] active:shadow-none",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md active:shadow-none",
        outline:
          "border border-input bg-background shadow-[0_2px_0_0_color-mix(in_oklab,var(--foreground)_12%,transparent)] hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground active:shadow-none",
        secondary: "bg-secondary text-secondary-foreground shadow-[0_2px_0_0_color-mix(in_oklab,var(--foreground)_10%,transparent)] hover:-translate-y-0.5 hover:shadow-md active:shadow-none",
        ghost: "hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline active:scale-100 active:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
