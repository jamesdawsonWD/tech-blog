import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex max-h-[3.75rem] items-center justify-center font-bold outline-none transition duration-300 focus:ring-2 focus:ring-rose-300/90 hover:cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-stone-800 text-background shadow-slate-950/20 after:absolute after:inset-0 after:hidden  after:shadow-slate-950/25 after:content-[''] sm:shadow-slate-950/25 sm:after:block ",
        soft: "bg-[#eff2e8] !text-foreground pl-6",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "px-5 py-4 text-base rounded-lg after:rounded-lg after:shadow-lg",
        sm: "h-9 rounded-md px-3",
        lg: "rounded-2xl px-8 py-8 text-lg after:rounded-2xl after:shadow-2xl",
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
