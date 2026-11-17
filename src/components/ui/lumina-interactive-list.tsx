import { useEffect, useState } from "react";
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

export function Component() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [active, setActive] = useState(0);
  const slide = slides[active] ?? slides[0]!;
  useEffect(() => { let live = true; fetchPublicBrands().then((items) => { if (live && items.length) setSlides(items.map((item) => ({ name: item.name, title: item.motto || "Discover the label.", description: item.description || "", image: item.image_url || item.logo_url || "", video: item.video_url || undefined }))); }).catch(() => undefined); return () => { live = false; }; }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const copy = document.querySelector(".lumina-brands__copy");
    if (!copy) return;
    gsap.fromTo(copy, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
  }, [active]);

  return (
    <main className="lumina-brands" data-header-theme="dark">
      <div className="lumina-brands__media" aria-hidden="true">
        {slides.map((item, index) => (
          {item.video ? <video key={`${item.name}-${active}`} src={item.video} autoPlay muted loop playsInline poster={item.image || undefined} className={index === active ? "is-active" : ""} /> : <img key={`${item.name}-${active}`} src={item.image} alt="" className={index === active ? "is-active" : ""} />}
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
      <section className="lumina-brands__copy" aria-live="polite">
        <h1>{slide.name}</h1>
        <a className="lumina-brands__explore" href={`/shop?brand=${encodeURIComponent(slide.name)}`}>ëxplore brand</a>
        <p>{slide.title}</p>
        <span className="lumina-brands__description">{slide.description}</span>
      </section>
      <nav className="lumina-brands__bottom lumina-brands__nav" aria-label="Choose a brand">
        {slides.map((item, index) => (
          <button key={item.name} onClick={() => setActive(index)} className={active === index ? "is-active" : ""} aria-current={active === index ? "true" : undefined}>
            <span className="lumina-brands__track"><span /></span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="lumina-brands__progress"><div key={active} /></div>
    </main>
  );
}
