// components/link-button.tsx
"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const linkButtonVariants = cva(
  "group relative inline-flex max-h-[3.75rem] items-center hover:cursor-pointer justify-center rounded-2xl px-5 py-4 text-lg font-bold outline-none transition duration-300 focus:ring-2 focus:ring-rose-300/90",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-800 text-background shadow-xl shadow-slate-950/20 after:absolute after:inset-0 after:hidden after:rounded-2xl after:shadow-2xl after:shadow-slate-950/25 after:content-[''] sm:shadow-slate-950/25 sm:after:block pl-[3.25rem]",
        soft: "bg-[#eff2e8] !text-foreground pl-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkButtonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      children,
      asChild = false,
      leftIcon,
      rightIcon,
      variant,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        ref={ref}
        className={cn(linkButtonVariants({ variant, className }))}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

LinkButton.displayName = "LinkButton";
export { LinkButton, linkButtonVariants };
