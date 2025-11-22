import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 👇 UPDATED COLOR STYLES (Dark theme)
          "flex h-10 w-full rounded-md border border-gray-700 bg-[#0F172A] px-3 py-2 text-base text-gray-200 placeholder:text-gray-400",

          // 👇 KEEPING YOUR EXISTING UTILITIES
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
