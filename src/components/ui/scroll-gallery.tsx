import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

export interface ScrollGallerySlide {
  image: string;
  title: string;
  url?: string;
  linkLabel?: string;
}

interface ScrollGalleryProps {
  slides: ScrollGallerySlide[];
  prefixLabel?: string;
  linkLabel?: string;
  stripsCount?: number;
  scrollPerTransition?: number;
  className?: string;
}

const STUDIO_CLASSES = {
  root: "relative h-svh w-full overflow-hidden max-lg:h-dvh",
  images: "absolute inset-0 h-full w-full",
  image: "absolute inset-0 h-full w-full object-cover",
  info: "absolute bottom-[11%] left-0 z-[2] w-full border-y border-white/25",
  infoInner: "mx-auto flex w-full max-w-[1600px] items-center gap-5 px-5 py-4 md:gap-8 md:px-10 md:py-5",
  prefix: "hidden flex-1 text-[clamp(12px,1.1vw,18px)] font-medium uppercase tracking-[0.2em] text-white/80 lg:block",
  title: "relative h-[clamp(30px,4vw,58px)] flex-[2] overflow-hidden",
  titleText: "whitespace-nowrap font-display text-[clamp(24px,3.2vw,48px)] font-medium leading-none tracking-[-0.04em] text-white",
  link: "flex flex-1 justify-end",
  linkText: "whitespace-nowrap text-[clamp(12px,1.1vw,18px)] font-medium uppercase tracking-[0.16em] text-white underline decoration-white/60 underline-offset-8 transition-opacity hover:opacity-65",
} as const;

function buildStripMask(progress: number, stripsCount: number) {
  const stops: string[] = [];
  const stripHeight = 100 / stripsCount;

  for (let row = 0; row < stripsCount; row++) {
    const top = row * stripHeight;
    const bottom = (row + 1) * stripHeight;
    const delay = (stripsCount - row - 1) / stripsCount;
    const stripProgress = Math.max(0, Math.min(1, (progress - delay) * stripsCount));
    const revealTop = bottom - stripProgress * stripHeight;

    stops.push(
      `transparent ${top}%`,
      `transparent ${revealTop}%`,
      `black ${revealTop}%`,
      `black ${bottom}%`,
    );
  }

  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

export function ScrollGallery({
  slides,
  prefixLabel = "Collections",
  linkLabel = "Explore",
  stripsCount = 20,
  scrollPerTransition = 100,
  className,
}: ScrollGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageStackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const firstImageRef = useRef<HTMLImageElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const firstSlide = slides[0];

  const safeSlides = slides.filter((slide) => slide.image && slide.title);

  useGSAP(() => {
    const section = sectionRef.current;
    const stack = imageStackRef.current;
    const title = titleRef.current;
    const link = linkRef.current;
    const firstImage = firstImageRef.current;
    if (!section || !stack || !title || !link || !firstImage || safeSlides.length < 2) return;

    const layers: HTMLDivElement[] = [];
    safeSlides.slice(1).forEach((slide) => {
      const layer = document.createElement("div");
      layer.className = "absolute inset-0 h-full w-full";
      const image = document.createElement("img");
      image.src = slide.image;
      image.alt = slide.title;
      image.decoding = "async";
      image.className = "h-full w-full object-cover";
      image.style.cssText = "width:100%;height:100%;object-fit:cover;backface-visibility:hidden;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-size:100% 100%;-webkit-mask-size:100% 100%;";
      image.style.maskImage = "linear-gradient(to bottom, transparent 0%, transparent 100%)";
      image.style.webkitMaskImage = image.style.maskImage;
      layer.appendChild(image);
      stack.appendChild(layer);
      layers.push(layer);
    });

    let activeTitle = 0;
    const setMask = (image: HTMLImageElement, value: string) => {
      image.style.maskImage = value;
      image.style.webkitMaskImage = value;
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: `+=${Math.max(1, safeSlides.length - 1) * scrollPerTransition}vh`,
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const progress = self.progress * (safeSlides.length - 1);
        const firstScale = 1.2 - Math.min(1, Math.max(0, progress / 2)) * 0.2;
        firstImage.style.transform = `translate3d(0,0,0) scale(${firstScale})`;
        const current = Math.min(safeSlides.length - 2, Math.floor(progress));
        const within = progress >= safeSlides.length - 1 ? 1 : progress - current;

        layers.forEach((layer, index) => {
          const image = layer.querySelector("img");
          if (!image) return;
          const distance = progress - index;
          const reveal = Math.max(0, Math.min(1, distance));
          setMask(image, buildStripMask(reveal, stripsCount));
          const scale = 1.2 - Math.min(1, Math.max(0, distance / 2)) * 0.2;
          image.style.transform = `translate3d(0,0,0) scale(${scale})`;
        });

        const titleIndex = Math.min(safeSlides.length - 1, current + (within > 0.3 ? 1 : 0));
        if (titleIndex !== activeTitle) {
          activeTitle = titleIndex;
          gsap.killTweensOf(title);
          gsap.to(title, {
            yPercent: -110,
            duration: 0.22,
            ease: "power2.in",
            onComplete: () => {
              title.textContent = safeSlides[titleIndex]?.title ?? "";
              gsap.set(title, { yPercent: 110 });
              gsap.to(title, { yPercent: 0, duration: 0.28, ease: "power2.out" });
            },
          });
          link.href = safeSlides[titleIndex]?.url ?? "/shop";
          link.textContent = safeSlides[titleIndex]?.linkLabel ?? linkLabel;
        }
      },
    });

    ScrollTrigger.refresh();
    return () => {
      trigger.kill();
      layers.forEach((layer) => layer.remove());
      gsap.killTweensOf(title);
    };
  }, { scope: sectionRef, dependencies: [safeSlides, stripsCount, scrollPerTransition, linkLabel] });

  if (!firstSlide) return null;

  return (
    <section ref={sectionRef} className={`${STUDIO_CLASSES.root} ${className ?? ""}`} aria-label="Seasonal collections" data-header-theme="dark">
      <div ref={imageStackRef} className={STUDIO_CLASSES.images}>
        <img ref={firstImageRef} src={firstSlide.image} alt={firstSlide.title} className={STUDIO_CLASSES.image} style={{ transform: "translate3d(0,0,0) scale(1.2)" }} fetchPriority="high" />
      </div>
      <div className={STUDIO_CLASSES.info}>
        <div className={STUDIO_CLASSES.infoInner}>
          <p className={STUDIO_CLASSES.prefix}>{prefixLabel}</p>
          <div className={STUDIO_CLASSES.title}>
            <p ref={titleRef} className={STUDIO_CLASSES.titleText}>{firstSlide.title}</p>
          </div>
          <div className={STUDIO_CLASSES.link}>
            <a ref={linkRef} href={firstSlide.url ?? "/shop"} className={STUDIO_CLASSES.linkText}>
              {firstSlide.linkLabel ?? linkLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScrollGallery;
