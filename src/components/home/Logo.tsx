import { cn } from "@/lib/utils";
import { STAR_PATH, TAGLINE_PATHS, WORDMARK_PATHS } from "./brand-paths";

/** Official ISHTILE vector wordmark + starburst. Inherits text color; sized by font-size (height = 1em). */
export function Logo({ className, tagline = false }: { className?: string; sparkleClassName?: string; tagline?: boolean }) {
  const vb = tagline ? "40 68 540 124" : "40 68 540 124";
  return (
    <span className={cn("inline-flex items-center leading-none", className)} role="img" aria-label="ISHTILE">
      <svg viewBox={vb} fill="currentColor" className="h-[1.3em] w-auto" aria-hidden="true">
        {WORDMARK_PATHS.map((d, i) => <path key={i} d={d} />)}
        <path d={STAR_PATH} />
        {tagline && TAGLINE_PATHS.map((d, i) => <path key={`t${i}`} d={d} />)}
      </svg>
    </span>
  );
}
