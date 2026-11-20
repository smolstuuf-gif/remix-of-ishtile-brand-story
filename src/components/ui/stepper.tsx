import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Stepper({
  value,
  defaultValue = 0,
  min = 0,
  max = 999,
  onChange,
  label = "value",
  className,
  size = "md",
}: StepperProps) {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const [direction, setDirection] = React.useState(1);
  const current = controlled ? value : internal;

  const step = (dir: number) => {
    const next = Math.min(max, Math.max(min, current + dir));
    if (next === current) return;
    setDirection(dir);
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  const digits = String(current).split("");
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-background/70 p-1 shadow-sm",
        compact ? "gap-0.5" : "gap-1.5",
        className,
      )}
      aria-label={`${label}: ${current}`}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={current <= min}
        aria-label={`Decrease ${label}`}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-accent active:translate-y-px active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-40",
          compact ? "h-8 w-8" : "h-11 w-11",
        )}
      >
        <Minus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />
      </button>

      <span
        className={cn(
          "relative inline-flex min-w-[2ch] items-center justify-center overflow-hidden font-semibold tabular-nums text-foreground",
          compact ? "h-8 text-sm" : "h-11 text-lg",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {digits.map((digit, index) => (
          <span
            key={`${index}-${digit}`}
            className={cn(
              "stepper-digit inline-block",
              direction > 0 ? "stepper-digit-up" : "stepper-digit-down",
            )}
          >
            {digit}
          </span>
        ))}
      </span>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={current >= max}
        aria-label={`Increase ${label}`}
        className={cn(
          "grid shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-accent active:translate-y-px active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-40",
          compact ? "h-8 w-8" : "h-11 w-11",
        )}
      >
        <Plus className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} />
      </button>
    </div>
  );
}
