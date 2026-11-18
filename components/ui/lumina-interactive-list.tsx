import { useEffect, useRef, useState } from "react";
import { fetchPublicBrands } from "@/lib/public-store";
import gsap from "gsap";
import brandOnen from "@/assets/brand-onen.jpg";
import brandFarak from "@/assets/brand-farak.jpg";
import brandMocha from "@/assets/brand-mocha.jpg";
import "./lumina-interactive-list.css";

const fallbackSlides = [
  { name: "ONEN+", title: "A quieter kind of confidence.", description: "Clean lines, considered details and everyday pieces made to move with you.", image: brandOnen },
  { name: "FARAK", title: "Made to stand apart.", description: "Expressive silhouettes, confident choices and a point of view entirely your own.", image: brandFarak },
  { name: "MOCHA+", title: "Tradition, with a new rhythm.", description: "Thoughtful everyday dressing with a respect for heritage and an eye on what comes next.", image: brandMocha },
];

type BrandSlide = (typeof fallbackSlides)[number] & { video?: string };

export function Component() {
  const [slides, setSlides] = useState<BrandSlide[]>(fallbackSlides);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLElement>(null);
  const slide = slides[active] ?? slides[0]!;

  useEffect(() => {
    let live = true;
    fetchPublicBrands()
      .then((items) => {
        if (!live || !items.length) return;
        const next = items.map((item) => ({
          name: item.name,
          title: item.motto || "Discover the label.",
          description: item.description || "",
          image: item.image_url || item.logo_url || "",
          video: item.video_url || undefined,
        }));
        setSlides(next);
        setActive(0);
      })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);

  // Keep media nodes mounted: GSAP can then animate between real slides
  // instead of restarting every image/video whenever the active index changes.
  useEffect(() => {
    const root = rootRef.current;
    const media = mediaRef.current;
    const copy = copyRef.current;
    if (!root || !media || !copy) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mediaItems = Array.from(media.children) as HTMLElement[];
    const activeMedia = mediaItems[active];
    const ctx = gsap.context(() => {
      gsap.killTweensOf([...mediaItems, copy]);
      mediaItems.forEach((item, index) => {
        if (index !== active) {
          gsap.set(item, { autoAlpha: 0, scale: 1 });
          item.classList.remove("is-active");
        }
      });

      if (reduceMotion) {
        gsap.set(activeMedia, { autoAlpha: 1, scale: 1 });
        gsap.set(copy, { autoAlpha: 1, y: 0 });
      } else {
        if (activeMedia) {
          activeMedia.classList.add("is-active");
          gsap.fromTo(activeMedia,
            { autoAlpha: 0, scale: 1.035 },
            { autoAlpha: 1, scale: 1, duration: 1.05, ease: "power3.out", overwrite: true },
          );
        }
        gsap.fromTo(copy,
          { autoAlpha: 0, y: 22, filter: "blur(5px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.75, ease: "power3.out", delay: 0.12, overwrite: true },
        );
      }
    }, root);

    return () => ctx.revert();
  }, [active, slides]);

  const selectBrand = (index: number) => {
    if (index !== active && index >= 0 && index < slides.length) setActive(index);
  };

  return (
    <main ref={rootRef} className="lumina-brands" data-header-theme="dark">
      <div ref={mediaRef} className="lumina-brands__media" aria-hidden="true">
        {slides.map((item) => (
          item.video
            ? <video key={item.name} src={item.video} autoPlay muted loop playsInline poster={item.image || undefined} />
            : <img key={item.name} src={item.image} alt="" />
        ))}
      </div>
      <svg className="lumina-brands__filters" aria-hidden="true" focusable="false">
        <filter id="brand-water-drop" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="8" result="water">
            <animate attributeName="baseFrequency" dur="1.35s" values="0.025 0.035;0.012 0.018" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="water" scale="0" xChannelSelector="R" yChannelSelector="G">
            <animate attributeName="scale" dur="1.35s" values="72;0" />
          </feDisplacementMap>
        </filter>
      </svg>
      <div className="lumina-brands__shade" />
      <span className="lumina-brands__index lumina-brands__index--left">{String(active + 1).padStart(2, "0")}</span>
      <span className="lumina-brands__index lumina-brands__index--right">{String(slides.length).padStart(2, "0")}</span>
      <section ref={copyRef} className="lumina-brands__copy" aria-live="polite">
        <h1>{slide.name}</h1>
        <a className="lumina-brands__explore" href={`/shop?brand=${encodeURIComponent(slide.name)}`}>ëxplore brand</a>
        <p>{slide.title}</p>
        <span className="lumina-brands__description">{slide.description}</span>
      </section>
      <nav className="lumina-brands__bottom lumina-brands__nav" aria-label="Choose a brand">
        {slides.map((item, index) => (
          <button
            key={item.name}
            type="button"
            onMouseEnter={() => selectBrand(index)}
            onFocus={() => selectBrand(index)}
            onClick={() => selectBrand(index)}
            className={active === index ? "is-active" : ""}
            aria-pressed={active === index}
          >
            <span className="lumina-brands__track"><span /></span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="lumina-brands__progress"><div key={active} /></div>
    </main>
  );
}
