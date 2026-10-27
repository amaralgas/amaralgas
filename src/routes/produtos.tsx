import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { getByCategory, type Category, useCatalog } from "@/data/catalog";
import { ProductCard } from "@/components/site/ProductCard";
import { PageHero } from "@/components/site/PageHero";

const schema = z.object({ c: z.enum(["gas", "agua", "acessorio", "combo"]).optional() });

export const Route = createFileRoute("/produtos")({
  validateSearch: (s) => schema.parse(s),
  head: () => ({
    meta: [
      { title: "Produtos — Gás e Água | Amaral Gás" },
      { name: "description", content: "Gás P13, P45, galões e garrafas de água mineral com entrega rápida." },
      { property: "og:title", content: "Produtos — Amaral Gás" },
      { property: "og:description", content: "Escolha seu gás ou água e receba em casa." },
    ],
  }),
  component: Produtos,
});

const TABS: { k?: Category; l: string }[] = [
  { l: "Todos" }, { k: "gas", l: "🔥 Gás" }, { k: "agua", l: "💧 Água" }, { k: "combo", l: "🎁 Combos" }, { k: "acessorio", l: "🔧 Acessórios" },
];
const SECTIONS: { k: Category; l: string }[] = [
  { k: "gas", l: "🔥 Gás" }, { k: "agua", l: "💧 Água" }, { k: "combo", l: "🎁 Combos" }, { k: "acessorio", l: "🔧 Acessórios" },
];

function Produtos() {
  useCatalog();
  const { c } = Route.useSearch();
  const shown = c ? SECTIONS.filter((s) => s.k === c) : SECTIONS;
  return (
    <>
      <PageHero title="Escolha seu produto" subtitle="Peça agora e receba em casa." />
      <div className="sticky top-16 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
          {TABS.map((t) => (
            <Link key={t.l} to="/produtos" search={{ c: t.k }}
              className={`shrink-0 rounded-full px-4 py-2.5 font-display font-bold uppercase ${c === t.k ? "bg-navy text-navy-foreground" : "bg-card text-navy shadow-card"}`}>
              {t.l}
            </Link>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        {shown.map((s) => (
          <section key={s.k}>
            <h2 className="mb-4 font-display text-3xl font-extrabold uppercase text-navy">{s.l}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
              {getByCategory(s.k).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
