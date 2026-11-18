"use client";

import { useEffect, useRef, useState } from "react";

type CountingNumberProps = {
  target: number;
  duration?: number;
};

export function CountingNumber({ target, duration = 1800 }: CountingNumberProps) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    let startTime = 0;
    const from = 0;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return <span ref={elementRef} aria-label={String(target)}>{value.toLocaleString()}</span>;
}
