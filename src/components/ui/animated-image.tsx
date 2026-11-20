import { useEffect, useState } from "react";
import type { ImgHTMLAttributes, TransitionEvent } from "react";
import { cn } from "@/lib/utils";

type AnimatedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onLoad"> & {
  src: string;
};

/** Preloads a replacement before crossfading, keeping the wrapper's layout dimensions stable. */
export function AnimatedImage({ src, className, alt = "", width, height, style, ...imgProps }: AnimatedImageProps) {
  const [displayedSrc, setDisplayedSrc] = useState(src);
  const [incomingSrc, setIncomingSrc] = useState<string | null>(null);
  const [incomingReady, setIncomingReady] = useState(false);

  useEffect(() => {
    if (src === displayedSrc || src === incomingSrc) return;
    let active = true;
    const preload = new window.Image();
    preload.onload = () => {
      if (!active) return;
      setIncomingReady(false);
      setIncomingSrc(src);
    };
    preload.onerror = () => {
      if (active) setIncomingSrc(null);
    };
    preload.src = src;
    return () => {
      active = false;
      preload.onload = null;
      preload.onerror = null;
    };
  }, [src, displayedSrc, incomingSrc]);

  const finishCrossfade = (event: TransitionEvent<HTMLImageElement>) => {
    if (event.propertyName !== "opacity" || !incomingSrc) return;
    setDisplayedSrc(incomingSrc);
    setIncomingSrc(null);
    setIncomingReady(false);
  };

  const revealIncoming = () => {
    setIncomingReady(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && incomingSrc) {
      setDisplayedSrc(incomingSrc);
      setIncomingSrc(null);
      setIncomingReady(false);
    }
  };

  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <img
        {...imgProps}
        src={displayedSrc}
        alt={alt}
        width={width}
        height={height}
        style={style}
        className="absolute inset-0 h-full w-full object-cover opacity-100"
      />
      {incomingSrc && (
        <img
          {...imgProps}
          src={incomingSrc}
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          loading="eager"
          style={style}
          onLoad={revealIncoming}
          onTransitionEnd={finishCrossfade}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[420ms] ease-out motion-reduce:transition-none", incomingReady ? "opacity-100" : "opacity-0")}
        />
      )}
    </span>
  );
}
