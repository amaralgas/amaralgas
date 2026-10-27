import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CircleCheck, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { brl, whatsappLink } from "@/lib/config";
import { fetchStatuses, getOrder, PAYMENT_LABEL, statusIndex, STATUS_STEPS, type Order, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/pedido/$id")({
  validateSearch: (s) => z.object({ novo: z.boolean().optional() }).parse(s),
  head: ({ params }) => ({
    meta: [
      { title: `Pedido #${params.id} | Amaral Gás` },
      { name: "description", content: "Acompanhe o status da sua entrega." },
      { property: "og:title", content: "Acompanhar pedido — Amaral Gás" },
      { property: "og:description", content: "Veja em que etapa está seu pedido." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PedidoPage,
});

function PedidoPage() {
  const { id } = Route.useParams();
  const { novo } = Route.useSearch();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [st, setSt] = useState<OrderStatus | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrder(Number(id)) ?? null);
    const load = () => fetchStatuses([Number(id)]).then((m) => setSt(m[Number(id)]));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [id]);

  if (order === undefined) return <div className="py-32" />;
  if (order === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-extrabold uppercase text-navy">Pedido não encontrado</h1>
        <Link to="/pedidos" className="btn-flame mt-6">Meus pedidos</Link>
      </div>
    );
  }

  const status = Math.max(statusIndex(st), 0);
  const wa = whatsappLink(`Olá, Amaral Gás! Sobre meu pedido #${order.id}.`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {novo && (
        <div className="mb-6 rounded-3xl bg-gradient-navy p-8 text-center text-navy-foreground animate-in zoom-in-95">
          <CircleCheck className="mx-auto size-20 text-success" />
          <h1 className="mt-3 font-display text-5xl font-extrabold uppercase">Pedido recebido!</h1>
          <p className="mt-2 text-navy-foreground/75">Obrigado por comprar com o Amaral Gás.</p>
          <p className="mt-4 inline-block rounded-full bg-navy-foreground/10 px-4 py-1.5 font-display text-xl font-bold">Pedido #{order.id}</p>
        </div>
      )}

      <div className="rounded-2xl bg-card p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-extrabold uppercase text-navy">{novo ? "Acompanhe seu pedido" : `Pedido #${order.id}`}</h2>
          <span className="rounded-full bg-flame/10 px-3 py-1 text-sm font-bold text-flame">{STATUS_STEPS[status]!.label}</span>
        </div>
        <ol className="mt-6">
          {STATUS_STEPS.map((s, i) => {
            const done = i <= status;
            return (
              <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
                {i < STATUS_STEPS.length - 1 && <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${i < status ? "bg-success" : "bg-border"}`} />}
                <span className={`relative grid size-10 shrink-0 place-items-center rounded-full ${done ? "bg-success text-navy-foreground" : "bg-muted text-muted-foreground"} ${i === status && status < 3 ? "animate-pulse-ring" : ""}`}>
                  {done ? <Check className="size-5" /> : i + 1}
                </span>
                <div className="pt-1.5">
                  <p className={`font-semibold ${done ? "text-navy" : "text-muted-foreground"}`}>{s.label}</p>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-4 space-y-3 rounded-2xl bg-card p-6 text-sm shadow-card">
        {order.items.map((it) => (
          <div key={it.id} className="flex justify-between"><span>{it.qty}x {it.name}</span><span className="font-semibold">{brl(it.qty * it.price)}</span></div>
        ))}
        <div className="flex justify-between text-muted-foreground"><span>Entrega</span><span>{brl(order.delivery)}</span></div>
        <div className="flex justify-between border-t pt-3 font-display text-2xl font-extrabold text-navy"><span>Total</span><span>{brl(order.total)}</span></div>
        <p><b className="text-navy">Pagamento:</b> {PAYMENT_LABEL[order.payment.method]}{order.payment.changeFor ? ` · troco para R$ ${order.payment.changeFor}` : ""}</p>
        <p><b className="text-navy">Endereço:</b> {order.address.street}, {order.address.number} – {order.address.district}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a href={wa} target="_blank" rel="noreferrer" className="btn-navy flex-1"><MessageCircle className="size-5" /> Falar com o Amaral Gás</a>
        <Link to="/" className="btn-flame flex-1">Voltar ao início</Link>
      </div>
    </div>
  );
}
