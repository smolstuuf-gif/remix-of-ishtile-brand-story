"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";

export type PortalCarouselImage = { src: string; alt?: string; title?: string };
type Rect = { left: number; top: number; width: number; height: number };
type Layer = { id: number; index: number; origin: Rect };
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function RollingText({ value }: { value: string }) {
  const [previous, setPrevious] = useState<string | null>(null);
  const currentRef = useRef<HTMLSpanElement>(null);
  const previousRef = useRef<HTMLSpanElement>(null);
  const last = useRef(value);
  useEffect(() => {
    if (last.current !== value) { setPrevious(last.current); last.current = value; }
  }, [value]);
  useIsoLayoutEffect(() => {
    if (!previous) return;
    const incoming = currentRef.current;
    const outgoing = previousRef.current;
    if (!incoming || !outgoing) return;
    const tweens = reducedMotion()
      ? [gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: .2 }), gsap.to(outgoing, { opacity: 0, duration: .2 })]
      : [gsap.fromTo(incoming, { yPercent: 110 }, { yPercent: 0, duration: .65, ease: "expo.out" }), gsap.to(outgoing, { yPercent: -110, duration: .65, ease: "expo.out" })];
    const timer = window.setTimeout(() => setPrevious(null), 700);
    return () => { tweens.forEach((tween) => tween.kill()); window.clearTimeout(timer); };
  }, [previous]);
  return <span className="relative inline-block overflow-hidden align-bottom"><span ref={currentRef} className="block">{value}</span>{previous && <span ref={previousRef} aria-hidden="true" className="absolute inset-0 block">{previous}</span>}</span>;
}

export default function PortalCarousel({ images, label = "NEXT", thumbWidth = 190, followSpeed = .14, duration = 1.15, className = "", children, onIndexChange }: {
  images: PortalCarouselImage[]; label?: string; thumbWidth?: number; followSpeed?: number; duration?: number; className?: string;
  children?: ReactNode; onIndexChange?: (index: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const idRef = useRef(0);
  const [current, setCurrent] = useState(0);
  const [layer, setLayer] = useState<Layer | null>(null);
  const count = images.length;
  const next = count ? (current + 1) % count : 0;

  useEffect(() => { images.forEach(({ src }) => { const image = new Image(); image.src = src; }); }, [images]);
  useEffect(() => {
    const root = rootRef.current, follower = followerRef.current, tag = tagRef.current;
    if (!root || !follower || !tag) return;
    const pointer = { x: 0, y: 0, active: false };
    const pos = { x: 0, y: 0 };
    let placed = false, frame = 0;
    const tick = () => {
      const rect = root.getBoundingClientRect();
      const w = follower.offsetWidth, h = follower.offsetHeight;
      const targetX = pointer.active ? pointer.x : rect.width - w - 28;
      const targetY = pointer.active ? pointer.y : rect.height - h - 28;
      const ease = reducedMotion() ? 1 : Math.min(1, Math.max(.02, followSpeed));
      if (!placed) { pos.x = targetX; pos.y = targetY; placed = true; }
      else { pos.x += (targetX - pos.x) * ease; pos.y += (targetY - pos.y) * ease; }
      follower.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
      tag.style.transform = `translate3d(${(pointer.active ? pointer.x : pos.x + 8) + 14}px,${(pointer.active ? pointer.y : pos.y + 8) + 10}px,0)`;
      frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => { if (event.pointerType === "touch") return; const rect = root.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true; };
    const leave = () => { pointer.active = false; };
    root.addEventListener("pointermove", move); root.addEventListener("pointerleave", leave); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave); };
  }, [followSpeed]);
  useIsoLayoutEffect(() => {
    if (!layer) return;
    const element = rootRef.current?.querySelector<HTMLElement>("[data-portal-layer]");
    const root = rootRef.current;
    if (!element || !root) return;
    const rect = root.getBoundingClientRect();
    const tween = reducedMotion()
      ? gsap.to(element, { opacity: 1, duration: .25, onComplete: finish })
      : gsap.to(element, { left: 0, top: 0, width: rect.width, height: rect.height, duration, ease: "expo.out", onComplete: finish });
    function finish() { setCurrent(layer.index); onIndexChange?.(layer.index); setLayer(null); }
    return () => { tween.kill(); };
  }, [layer, duration, onIndexChange]);
  const advance = () => {
    const root = rootRef.current, follower = followerRef.current;
    if (!root || !follower || count < 2 || layer) return;
    const a = root.getBoundingClientRect(), b = follower.getBoundingClientRect();
    idRef.current += 1;
    setLayer({ id: idRef.current, index: next, origin: { left: b.left - a.left, top: b.top - a.top, width: b.width, height: b.height } });
  };
  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const interactive = target.closest("a,button,input,select,textarea,[role=button]");
    if (interactive && !interactive.hasAttribute("data-portal-next")) return;
    advance();
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); advance(); }
    if (event.key === "ArrowLeft" && count > 1) { event.preventDefault(); setCurrent((value) => { const index = (value - 1 + count) % count; onIndexChange?.(index); return index; }); }
  };
  if (!count) return null;
  const active = images[current];
  const preview = images[next];
  return <div ref={rootRef} role="region" aria-roledescription="carousel" aria-label="ISHTILE lookbook" tabIndex={0} onKeyDown={onKeyDown} onClick={onClick} className={`relative h-svh min-h-[560px] w-full cursor-pointer select-none overflow-hidden bg-[#171717] outline-none ${className}`}>
    <img src={active.src} alt={active.alt ?? active.title ?? ""} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
    {layer && <div data-portal-layer className="absolute z-20 overflow-hidden" style={layer.origin}><img src={images[layer.index].src} alt="" draggable={false} className="h-full w-full object-cover" /></div>}
    {children && <div className="pointer-events-none absolute inset-0 z-30">{children}</div>}
    {count > 1 && <>
      <div ref={followerRef} className="pointer-events-none absolute left-0 top-0 z-40 aspect-square will-change-transform" style={{ width: `min(${thumbWidth}px, 38vw)` }}>
        <button type="button" data-portal-next aria-label={`Show next look: ${preview.title ?? "Next"}`} className="pointer-events-auto block h-full w-full overflow-hidden border border-white/70 shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"><img src={preview.src} alt="" draggable={false} className="h-full w-full object-cover" /></button>
      </div>
      <span ref={tagRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-50 bg-[#171717] px-2 py-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#F0EAE0]">{label}</span>
    </>}
    <div className="pointer-events-none absolute bottom-10 left-[7%] z-30 flex flex-col gap-2 text-[#F0EAE0] md:bottom-14 md:left-[10%]">
      <span className="text-xs font-semibold tabular-nums tracking-wider text-white/70"><RollingText value={String(current + 1).padStart(2,"0")} /> <span className="text-white/45">/ {String(count).padStart(2,"0")}</span></span>
      <span className="font-wide text-2xl font-extrabold uppercase leading-none tracking-tight md:text-4xl">{active.title}</span>
    </div>
    <p className="sr-only" aria-live="polite">{`Look ${current + 1} of ${count}: ${active.title ?? ""}`}</p>
  </div>;
}
