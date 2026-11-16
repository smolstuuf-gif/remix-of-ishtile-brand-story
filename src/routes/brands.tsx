import { createFileRoute } from "@tanstack/react-router";
import { Component } from "@/components/ui/lumina-interactive-list";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Our Brands — ISHTILE+" },
      { name: "description", content: "Meet the independent labels shaping the ISHTILE+ universe." },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  return <Component />;
}
