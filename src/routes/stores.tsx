import { createFileRoute } from "@tanstack/react-router";
import { PageShell, pageHead } from "@/components/layout/PageShell";
import store from "@/assets/stores/dhaka-store.jpg";

export const Route = createFileRoute("/stores")({
  head: () => pageHead("Stores", "Visit the ISHTILE+ store in Dhaka — try on the latest collections in person."),
  component: StoresPage,
});

function StoresPage() {
  return (
    <PageShell eyebrow="Visit us" title="Stores">
      <div className="grid gap-6 lg:grid-cols-2">
        <img src={store} alt="Inside the ISHTILE+ Dhaka store" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <div className="rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-semibold">ISHTILE+ Dhaka</h2>
          <p className="mt-3 text-muted-foreground">Store address, hours and phone coming soon.</p>
        </div>
      </div>
    </PageShell>
  );
}
