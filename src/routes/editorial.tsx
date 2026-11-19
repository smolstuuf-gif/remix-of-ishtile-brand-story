import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell, pageHead } from "@/components/layout/PageShell";
import fashion from "@/assets/editorial-fashion.jpg";
import art from "@/assets/editorial-art.jpg";
import { fetchPublicBrandInfo } from "@/lib/public-store";
import { AnimatedImage } from "@/components/ui/animated-image";

export const Route = createFileRoute("/editorial")({
  head: () => pageHead("Editorial", "Stories on fashion, culture and the people shaping style in Bangladesh."),
  component: EditorialPage,
});

const stories = [
  { title: "The New Generation of Fashion", tag: "People", image: fashion },
  { title: "Culture in Contemporary Fashion", tag: "Culture", image: art },
];

function EditorialPage() {
  const [images, setImages] = useState({ fashion, art });
  useEffect(() => { let live = true; fetchPublicBrandInfo().then((info) => { if (live && info) setImages({ fashion: info.editorial_fashion_image_url || fashion, art: info.editorial_art_image_url || art }); }).catch(() => undefined); return () => { live = false; }; }, []);
  const storiesWithImages = stories.map((story, index) => ({ ...story, image: index === 0 ? images.fashion : images.art }));
  return (
    <PageShell eyebrow="Journal" title="Editorial" intro="Fashion, culture and beyond.">
      <div className="grid gap-6 md:grid-cols-2">
        {storiesWithImages.map((s) => (
          <article key={s.title}>
            <AnimatedImage src={s.image} alt={s.title} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">{s.tag}</p>
            <h2 className="mt-1 text-2xl font-semibold">{s.title}</h2>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
