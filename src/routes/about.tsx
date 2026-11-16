import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, pageHead } from "@/components/layout/PageShell";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About", "ISHTILE+ brings together Bangladesh's most exciting fashion labels. Explore. Discover. Belong."),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell eyebrow="Our story" title="About ISHTILE+" intro="Fashion, culture and beyond. ISHTILE+ brings together independent labels from Bangladesh in one place. Explore. Discover. Belong.">
      <Link to="/shop" className="inline-flex rounded-full bg-ink px-6 py-3 font-medium text-ink-foreground">Shop the brands</Link>
    </PageShell>
  );
}
