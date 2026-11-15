import { cn } from "@/lib/utils";
import { Sparkle } from "./icons";

/** ISHTILE wordmark with the brand sparkle. Inherits text color. */
export function Logo({ className, sparkleClassName }: { className?: string; sparkleClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-[0.18em] leading-none", className)}>
      <span className="font-wide font-extrabold tracking-[-0.035em]">ISHTILE</span>
      <Sparkle className={cn("h-[1.05em] w-[1.05em] shrink-0", sparkleClassName)} />
    </span>
  );
}
