import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Droplets, Flame, Gift, Smartphone, ShieldCheck, Truck, Zap, RotateCcw } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import gasImg from "@/assets/gas-p13.jpg";
import { getByCategory, getProducts, useCatalog } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/site/ProductCard";
import { CombosGrid, Faq, OffersGrid, SectionTitle, useOrderNow } from "@/components/site/Sections";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Amaral Gás — Gás e água com entrega rápida | Pediu, chegou!" },
      { name: "description", content: "Peça seu gás P13 e água mineral online. Entrega rápida, compra segura e atendimento pelo WhatsApp." },
      { property: "og:title", content: "Amaral Gás — Pediu, chegou!" },
      { property: "og:description", content: "Gás e água na sua casa com agilidade e confiança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useCatalog();
  const orderNow = useOrderNow();
  const { add, setOpen } = useCart();
  const [tab, setTab] = useState<"gas" | "agua" | "ofertas">("gas");
  const list = tab === "ofertas" ? getProducts().filter((p) => p.oldPrice && p.category !== "combo") : getByCategory(tab);

  const quick = [
    { i: Flame, t: "Gás", to: "/produtos", s: { c: "gas" } },
    { i: Droplets, t: "Água", to: "/produtos", s: { c: "agua" } },
    { i: Gift, t: "Ofertas", to: "/ofertas", s: undefined },
  ] as const;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy text-navy-foreground">
        <img src={heroImg} alt="" width={1600} height={912} className="absolute inset-0 size-full object-cover object-[70%] opacity-60 md:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/85 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-14 md:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-flame/15 px-3 py-1 text-sm font-semibold text-flame-light">
            <Truck className="size-4" /> Entrega em 30 a 50 min
          </p>
          <h1 className="mt-4 font-display text-6xl font-extrabold uppercase leading-[0.9] md:text-8xl">
            Pediu,<br /><span className="text-flame">chegou!</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-navy-foreground/80 md:text-xl">Gás e água na sua casa com agilidade e confiança.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={orderNow} className="btn-flame !text-xl">🔥 Pedir agora</button>
            <Link to="/produtos" className="btn-ghost-light">Ver produtos</Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-foreground/80">
            {["Entrega rápida", "Compra segura", "Atendimento pelo WhatsApp"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check className="size-4 text-flame" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <div className="relative z-10 mx-auto -mt-12 grid max-w-6xl grid-cols-3 gap-2 px-4 md:gap-4">
        {quick.map(({ i: I, t, to, s }) => (
          <Link key={t} to={to} search={s as never} className="flex flex-col items-center gap-2 rounded-2xl bg-card p-3 text-center shadow-card transition hover:-translate-y-1 md:flex-row md:p-5">
            <span className="grid size-12 place-items-center rounded-xl bg-flame/10"><I className="size-6 text-flame" /></span>
            <span className="font-display text-sm font-bold uppercase text-navy md:text-lg">{t}</span>
          </Link>
        ))}
      </div>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle title="Escolha seu produto" subtitle="Peça agora e receba em casa." />
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {([["gas", "🔥 Gás"], ["agua", "💧 Água"], ["ofertas", "🎁 Ofertas"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`shrink-0 rounded-full px-5 py-3 font-display text-lg font-bold uppercase transition ${tab === k ? "bg-navy text-navy-foreground" : "bg-card text-navy shadow-card"}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* GAS HIGHLIGHT */}
      <section className="px-4">
        <div className="mx-auto grid max-w-6xl items-center gap-6 overflow-hidden rounded-3xl bg-gradient-flame p-6 text-flame-foreground md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <h2 className="font-display text-5xl font-extrabold uppercase leading-none md:text-6xl">🔥 Seu gás acabou?</h2>
            <p className="mt-3 text-lg md:text-xl">Peça agora e receba no conforto da sua casa.</p>
            <button onClick={() => { add("gas-p13"); setOpen(true); }} className="btn-navy mt-6 !min-h-14 !px-8 !text-xl">Pedir meu gás</button>
          </div>
          <img src={gasImg} alt="Botijão de gás P13" loading="lazy" className="mx-auto w-48 rounded-2xl md:w-64" />
        </div>
      </section>

      {/* REORDER */}
      <section className="mx-auto max-w-6xl px-4 pt-14">
        <div className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-navy/15 bg-card p-5 sm:flex-row sm:items-center">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-navy"><RotateCcw className="size-7 text-flame" /></span>
          <div className="flex-1">
            <p className="font-display text-2xl font-bold text-navy">🔥 Comprou antes?</p>
            <p className="text-muted-foreground">Peça novamente em poucos segundos. Último pedido: <b className="text-navy">Gás P13 · 1 unidade</b></p>
          </div>
          <button onClick={() => { add("gas-p13"); toast.success("Gás P13 adicionado"); setOpen(true); }} className="btn-flame">Pedir novamente</button>
        </div>
      </section>

      {/* WATER */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle title="💧 Água para sua casa" subtitle="Garrafas e galões direto na sua porta." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {getByCategory("agua").map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* OFFERS */}
      <section className="bg-secondary px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <SectionTitle title="🔥 Ofertas do Amaral" subtitle="Preços especiais por tempo limitado." />
          <OffersGrid />
        </div>
      </section>

      {/* COMBOS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle title="🎁 Aproveite os combos" subtitle="Leve junto e economize." />
        <CombosGrid />
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <SectionTitle title="Por que pedir no Amaral Gás?" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {[
            { i: Zap, t: "Agilidade", d: "Seu pedido chega com rapidez." },
            { i: ShieldCheck, t: "Confiança", d: "Compre de uma empresa local." },
            { i: Smartphone, t: "Facilidade", d: "Faça seu pedido pelo celular." },
            { i: Truck, t: "Entrega", d: "Receba no conforto da sua casa." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="rounded-2xl bg-card p-5 shadow-card">
              <I className="size-8 text-flame" />
              <p className="mt-3 font-display text-xl font-bold text-navy">{t}</p>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <SectionTitle title="Perguntas frequentes" />
        <Faq />
      </section>
    </>
  );
}
