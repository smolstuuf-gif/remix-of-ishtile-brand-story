import type { ReactNode } from "react";
import { Footer } from "@/components/home/Footer";

export function PageShell({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 md:px-6 md:pt-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
        <h1 className="mt-2 font-headline text-[clamp(2.4rem,6vw,5.5rem)] font-extrabold uppercase italic leading-[0.9] tracking-[-0.03em]">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
        <div className="mt-10">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — ISHTILE+` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — ISHTILE+` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
