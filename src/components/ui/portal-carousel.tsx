"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode, type TouchEvent } from "react";
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
  useEffect(() => { if (last.current !== value) { setPrevious(last.current); last.current = value; } }, [value]);
  useIsoLayoutEffect(() => {
    if (!previous) return;
    const incoming = currentRef.current, outgoing = previousRef.current;
    if (!incoming || !outgoing) return;
    const tweens = reducedMotion()
      ? [gsap.fromTo(incoming, { opacity: 0 }, { opacity: 1, duration: .2 }), gsap.to(outgoing, { opacity: 0, duration: .2 })]
      : [gsap.fromTo(incoming, { yPercent: 110 }, { yPercent: 0, duration: .65, ease: "expo.out" }), gsap.to(outgoing, { yPercent: -110, duration: .65, ease: "expo.out" })];
    const timer = window.setTimeout(() => setPrevious(null), 700);
    return () => { tweens.forEach((tween) => tween.kill()); window.clearTimeout(timer); };
  }, [previous]);
  return <span className="relative inline-block overflow-hidden align-bottom"><span ref={currentRef} className="block">{value}</span>{previous && <span ref={previousRef} aria-hidden="true" className="absolute inset-0 block">{previous}</span>}</span>;
}

function ExpandingLayer({ layer, image, duration, onDone }: { layer: Layer; image: PortalCarouselImage; duration: number; onDone: (id: number, index: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useIsoLayoutEffect(() => {
    const element = ref.current, parent = element?.parentElement;
    if (!element || !parent) return;
    const bounds = parent.getBoundingClientRect();
    const finish = () => doneRef.current(layer.id, layer.index);
    const tween = reducedMotion()
      ? gsap.fromTo(element, { left: 0, top: 0, width: bounds.width, height: bounds.height, opacity: 0 }, { opacity: 1, duration: .25, ease: "power1.out", onComplete: finish })
      : gsap.to(element, { left: 0, top: 0, width: bounds.width, height: bounds.height, duration, ease: "expo.out", onComplete: finish });
    return () => { tween.kill(); };
  }, []);
  return <div ref={ref} className="absolute overflow-hidden" style={{ ...layer.origin, zIndex: 10 + layer.id }}><img src={image.src} alt="" draggable={false} className="h-full w-full object-cover" /></div>;
}

export default function PortalCarousel({ images, label = "NEXT", thumbWidth = 190, followSpeed = .14, duration = 1.15, className = "", children, onIndexChange }: {
  images: PortalCarouselImage[]; label?: string; thumbWidth?: number; followSpeed?: number; duration?: number; className?: string;
  children?: ReactNode; onIndexChange?: (index: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLButtonElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const idRef = useRef(0);
  const touchStartRef = useRef<number | null>(null);
  const ignoreClickRef = useRef(false);
  const [current, setCurrent] = useState(0);
  const [layers, setLayers] = useState<Layer[]>([]);
  const count = images.length;
  const wrap = (index: number) => count ? ((index % count) + count) % count : 0;
  const head = layers.length ? layers[layers.length - 1].index : current;
  const thumbIndex = wrap(head + 1);

  useEffect(() => { images.forEach(({ src }) => { const image = new Image(); image.src = src; }); }, [images]);
  useEffect(() => {
    const root = rootRef.current, follower = followerRef.current, tag = tagRef.current;
    if (!root || !follower || !tag) return;
    const pointer = { x: 0, y: 0, active: false };
    const position = { x: 0, y: 0 };
    let placed = false, frame = 0;
    const tick = () => {
      const rect = root.getBoundingClientRect(), w = follower.offsetWidth, h = follower.offsetHeight;
      const goalX = pointer.active ? pointer.x : rect.width - w - 28;
      const goalY = pointer.active ? pointer.y : rect.height - h - 28;
      const ease = reducedMotion() ? 1 : Math.min(1, Math.max(.02, followSpeed));
      if (!placed) { position.x = goalX; position.y = goalY; placed = true; }
      else { position.x += (goalX - position.x) * ease; position.y += (goalY - position.y) * ease; }
      follower.style.transform = `translate3d(${position.x}px,${position.y}px,0)`;
      const tagX = pointer.active ? pointer.x + 14 : position.x + 22;
      const tagY = pointer.active ? pointer.y + 10 : position.y + 18;
      tag.style.transform = `translate3d(${tagX}px,${tagY}px,0)`;
      frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => { if (event.pointerType === "touch") return; const rect = root.getBoundingClientRect(); pointer.x = event.clientX - rect.left; pointer.y = event.clientY - rect.top; pointer.active = true; };
    const leave = () => { pointer.active = false; };
    root.addEventListener("pointermove", move); root.addEventListener("pointerleave", leave); frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); root.removeEventListener("pointermove", move); root.removeEventListener("pointerleave", leave); };
  }, [followSpeed]);

  const advance = () => {
    const root = rootRef.current, thumb = thumbRef.current;
    if (!root || !thumb || count < 2) return;
    const rootRect = root.getBoundingClientRect(), thumbRect = thumb.getBoundingClientRect();
    idRef.current += 1;
    setLayers((previous) => [...previous, { id: idRef.current, index: thumbIndex, origin: { left: thumbRect.left - rootRect.left, top: thumbRect.top - rootRect.top, width: thumbRect.width, height: thumbRect.height } }]);
    if (!reducedMotion()) gsap.fromTo(thumb, { scale: .2 }, { scale: 1, duration: .45, ease: "expo.out", overwrite: true });
  };
  const onLayerDone = (id: number, index: number) => {
    setCurrent(index);
    onIndexChange?.(index);
    setLayers((previous) => previous.filter((item) => item.id > id));
  };
  const onRootClick = (event: MouseEvent<HTMLDivElement>) => {
    if (ignoreClickRef.current) { ignoreClickRef.current = false; return; }
    const target = event.target as HTMLElement;
    const interactive = target.closest("a,button,input,select,textarea,[role=button]");
    if (interactive && interactive !== thumbRef.current) return;
    advance();
  };
  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => { touchStartRef.current = event.touches[0]?.clientX ?? null; };
  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current, end = event.changedTouches[0]?.clientX;
    touchStartRef.current = null;
    if (count < 2 || start === null || end === undefined || Math.abs(end - start) < 45) return;
    ignoreClickRef.current = true;
    window.setTimeout(() => { ignoreClickRef.current = false; }, 500);
    if (end < start) advance();
    else {
      const index = wrap(head - 1);
      setLayers([]);
      setCurrent(index);
      onIndexChange?.(index);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === " ") { event.preventDefault(); advance(); }
    if (event.key === "ArrowLeft" && count > 1) { event.preventDefault(); const index = wrap(head - 1); setLayers([]); setCurrent(index); onIndexChange?.(index); }
  };
  if (!count) return null;
  const currentImage = images[wrap(current)];
  const thumbImage = images[thumbIndex];
  const headTitle = images[wrap(head)].title;
  return <div ref={rootRef} role="region" aria-roledescription="carousel" aria-label="ISHTILE lookbook" tabIndex={0} onKeyDown={onKeyDown} onClick={onRootClick} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} className={`relative h-svh min-h-[560px] w-full cursor-pointer select-none overflow-hidden bg-[#171717] touch-pan-y outline-none ${className}`}>
    <img src={currentImage.src} alt={currentImage.alt ?? currentImage.title ?? ""} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 z-[1]">{layers.map((layer) => <ExpandingLayer key={layer.id} layer={layer} image={images[layer.index]} duration={duration} onDone={onLayerDone} />)}</div>
    {children && <div className="pointer-events-none absolute inset-0 z-[1000]">{children}</div>}
    {count > 1 && <>
      <div ref={followerRef} className="pointer-events-none absolute left-0 top-0 z-[1001] aspect-square will-change-transform" style={{ width: `min(${thumbWidth}px, 38vw)` }}>
        <button ref={thumbRef} type="button" data-portal-next aria-label={`Show next look: ${thumbImage.alt ?? thumbImage.title ?? "Next"}`} className="pointer-events-auto block h-full w-full overflow-hidden border border-white/70 shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><img src={thumbImage.src} alt="" draggable={false} className="h-full w-full object-cover" /></button>
      </div>
      <span ref={tagRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-[1002] bg-[#171717] px-2 py-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#F0EAE0] will-change-transform">{label}</span>
    </>}
    <div className="pointer-events-none absolute bottom-10 left-[7%] z-[999] flex flex-col gap-2 text-[#F0EAE0] md:bottom-14 md:left-[10%]">
      <span className="text-xs font-semibold tabular-nums tracking-wider text-white/70"><RollingText value={String(wrap(head) + 1).padStart(2,"0")} /> <span className="text-white/45">/ {String(count).padStart(2,"0")}</span></span>
      {headTitle && <span className="font-wide text-2xl font-extrabold uppercase leading-none tracking-tight md:text-4xl"><RollingText value={headTitle} /></span>}
    </div>
    <p className="sr-only" aria-live="polite">{`Look ${wrap(head) + 1} of ${count}: ${currentImage.alt ?? currentImage.title ?? ""}`}</p>
  </div>;
}
