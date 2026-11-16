import * as React from "react";
import { cn } from "@/lib/utils";

type MenuToggleProps = React.ComponentProps<"svg"> & {
  open: boolean;
  duration?: number;
};

/** Animated, state-driven menu/close glyph. */
export function MenuToggleIcon({
  open,
  className,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2.5,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  duration = 500,
  ...props
}: MenuToggleProps) {
  const motion = {
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: "cubic-bezier(.22,1,.36,1)",
  } as const;

  return (
    <svg
      viewBox="0 0 32 32"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      className={cn("block", className)}
      style={{
        ...motion,
        transform: open ? "rotate(-45deg)" : "rotate(0deg)",
        transitionProperty: "transform",
      }}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
        style={{
          ...motion,
          strokeDasharray: open ? "20 300" : "12 63",
          strokeDashoffset: open ? "-32.42" : "0",
          transitionProperty: "stroke-dasharray, stroke-dashoffset",
        }}
      />
      <path
        d="M7 16 27 16"
        style={{
          ...motion,
          strokeDasharray: open ? "0 20" : "20 0",
          opacity: open ? 0 : 1,
          transitionProperty: "stroke-dasharray, opacity",
        }}
      />
    </svg>
  );
}
