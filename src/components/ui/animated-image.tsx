import { useState } from "react";
import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AnimatedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "onLoad"> & {
  src: string;
};

/** Keeps the image's layout fixed while gently revealing each newly loaded source. */
export function AnimatedImage({ src, className, ...props }: AnimatedImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  return (
    <img
      key={src}
      src={src}
      onLoad={() => setLoadedSrc(src)}
      className={cn("media-fade-in", loadedSrc === src && "media-fade-in--loaded", className)}
      {...props}
    />
  );
}
