import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CombosGrid, OffersGrid, SectionTitle } from "@/components/site/Sections";

export const Route = createFileRoute("/ofertas")({
  head: () => ({
    meta: [
      { title: "Ofertas e Combos | Amaral Gás" },
      { name: "description", content: "Promoções de gás e água e combos com desconto do Amaral Gás." },
      { property: "og:title", content: "Ofertas do Amaral Gás" },
      { property: "og:description", content: "Gás e água com preço especial e combos que economizam." },
    ],
  }),
  component: () => (
    <>
      <PageHero title="🔥 Ofertas do Amaral" subtitle="Preços especiais por tempo limitado." />
      <div className="mx-auto max-w-6xl space-y-14 px-4 py-10">
        <OffersGrid />
        <section>
          <SectionTitle title="🎁 Aproveite os combos" subtitle="Leve junto e economize." />
          <CombosGrid />
        </section>
      </div>
    </>
  ),
});
