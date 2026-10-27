import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { discountPct, getCombos, getOffers, useCatalog } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/config";

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-3xl font-extrabold uppercase text-navy md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function OffersGrid() {
  useCatalog();
  const { add } = useCart();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {getOffers().map((p) => (
        <div key={p.id} className="flex items-center gap-4 overflow-hidden rounded-2xl bg-card p-4 shadow-card">
          <img src={p.image} alt={p.name} loading="lazy" className="size-28 shrink-0 rounded-xl object-cover" />
          <div className="flex-1">
            <span className="inline-block rounded-full bg-flame/15 px-2.5 py-0.5 text-xs font-bold text-flame">{discountPct(p)}% OFF</span>
            <p className="mt-1 font-display text-xl font-bold text-navy">{p.name}</p>
            <p className="text-sm text-muted-foreground">De <span className="line-through">{brl(p.oldPrice!)}</span> por</p>
            <p className="font-display text-3xl font-extrabold text-flame">{brl(p.price)}</p>
            <button onClick={() => { add(p.id); toast.success("Oferta adicionada ao carrinho"); }} className="btn-navy mt-2 w-full !min-h-11 !text-sm">
              Aproveitar oferta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CombosGrid() {
  useCatalog();
  const { add } = useCart();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {getCombos().map((c) => (
        <div key={c.id} className="relative overflow-hidden rounded-2xl bg-gradient-navy p-6 text-navy-foreground shadow-card">
          <Gift className="absolute -right-4 -top-4 size-32 text-navy-foreground/5" />
          <p className="font-display text-3xl font-extrabold uppercase">{c.name}</p>
          <ul className="mt-3 space-y-1 text-lg">{c.items?.map((i) => <li key={i}>{i}</li>)}</ul>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm text-navy-foreground/60">De <span className="line-through">{brl(c.oldPrice!)}</span></p>
              <p className="font-display text-4xl font-extrabold text-flame-light">{brl(c.price)}</p>
            </div>
            <span className="rounded-full bg-flame px-3 py-1 font-display text-sm font-bold">Economize {brl(c.oldPrice! - c.price)}</span>
          </div>
          <button onClick={() => { add(c.id); toast.success(`${c.name} adicionado`); }} className="btn-flame mt-5 w-full">Adicionar combo</button>
        </div>
      ))}
    </div>
  );
}

const FAQ = [
  ["Qual o horário de entrega?", "Entregamos de segunda a sábado das 7h às 20h e aos domingos das 8h às 13h."],
  ["Quais formas de pagamento?", "PIX, dinheiro (com troco) e cartão de débito ou crédito na entrega."],
  ["Vocês entregam no meu bairro?", "Atendemos toda a região. Na dúvida, chame a gente no WhatsApp e confirmamos na hora."],
  ["Qual o prazo de entrega?", "Em média de 30 a 50 minutos após a confirmação do pedido."],
  ["Posso pedir gás e água juntos?", "Sim! Adicione os dois ao carrinho ou aproveite nossos combos com desconto."],
  ["Como acompanho meu pedido?", "Após confirmar, você acompanha cada etapa em Meus Pedidos."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y rounded-2xl bg-card shadow-card">
      {FAQ.map(([q, a], i) => (
        <div key={q}>
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-navy">
            {q}
            <ChevronDown className={`size-5 shrink-0 transition ${open === i ? "rotate-180 text-flame" : ""}`} />
          </button>
          {open === i && <p className="px-5 pb-5 text-muted-foreground">{a}</p>}
        </div>
      ))}
    </div>
  );
}

export function useOrderNow() {
  const navigate = useNavigate();
  return () => navigate({ to: "/produtos", search: { c: "gas" } });
}
