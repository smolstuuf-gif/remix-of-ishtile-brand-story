import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AutoplayVideoProps = {
  src: string;
  poster?: string | undefined;
  active?: boolean;
  className?: string;
  fallbackClassName?: string;
  label?: string;
};

/**
 * Reliable muted background video playback. React's autoPlay attribute alone
 * does not reliably restart a mounted video when a carousel slide becomes active.
 */
export function AutoplayVideo({
  src,
  poster,
  active = true,
  className,
  fallbackClassName,
  label = "Video preview",
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let disposed = false;

    if (!active || failed) {
      video.pause();
      return;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const start = () => {
      if (disposed || !videoRef.current || !active) return;
      const playback = video.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch(() => {
          // Autoplay can be denied by browser policy. Keep the poster visible;
          // controls are intentionally not forced on editorial background media.
        });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) start();
    else {
      video.addEventListener("canplay", start, { once: true });
      video.addEventListener("loadeddata", start, { once: true });
      video.load();
    }

    return () => {
      disposed = true;
      video.removeEventListener("canplay", start);
      video.removeEventListener("loadeddata", start);
      video.pause();
    };
  }, [src, active, failed]);

  if (failed) {
    return poster
      ? <img src={poster} alt="" aria-label={label} className={cn(className, fallbackClassName)} />
      : <div role="img" aria-label={label} className={cn("bg-ink", className, fallbackClassName)} />;
  }

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      playsInline
      loop
      preload={active ? "auto" : "metadata"}
      aria-label={label}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
