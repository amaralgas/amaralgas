import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/config";
import { fetchStatuses, listOrders, STATUS_LABEL, type Order, type OrderStatus } from "@/lib/orders";

export const Route = createFileRoute("/pedidos")({
  head: () => ({
    meta: [
      { title: "Meus pedidos | Amaral Gás" },
      { name: "description", content: "Veja e acompanhe seus pedidos de gás e água." },
      { property: "og:title", content: "Meus pedidos — Amaral Gás" },
      { property: "og:description", content: "Acompanhe suas entregas e peça novamente." },
    ],
  }),
  component: Pedidos,
});

function Pedidos() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const { add, setOpen } = useCart();
  const [st, setSt] = useState<Record<number, OrderStatus>>({});
  useEffect(() => {
    const l = listOrders(); setOrders(l);
    fetchStatuses(l.map((o) => o.id)).then(setSt);
  }, []);

  const reorder = (o: Order) => { o.items.forEach((i) => add(i.id, i.qty)); setOpen(true); };

  return (
    <>
      <PageHero title="Meus pedidos" subtitle="Acompanhe suas entregas e peça de novo." />
      <div className="mx-auto max-w-2xl space-y-3 px-4 py-10">
        {orders?.length === 0 && (
          <div className="rounded-2xl bg-card p-10 text-center shadow-card">
            <Package className="mx-auto size-14 text-muted-foreground" />
            <p className="mt-3 text-lg font-semibold text-navy">Você ainda não fez pedidos</p>
            <Link to="/produtos" search={{ c: "gas" }} className="btn-flame mt-5">🔥 Pedir agora</Link>
          </div>
        )}
        {orders?.map((o) => (
          <div key={o.id} className="rounded-2xl bg-card p-5 shadow-card">
            <Link to="/pedido/$id" params={{ id: String(o.id) }} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-display text-xl font-bold text-navy">Pedido #{o.id}</p>
                <p className="text-sm text-muted-foreground">{o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}</p>
                <p className="mt-1 text-sm"><span className="font-bold text-flame">{STATUS_LABEL[st[o.id] ?? "recebido"]}</span> · {brl(o.total)}</p>
              </div>
              <ChevronRight className="size-6 text-muted-foreground" />
            </Link>
            <button onClick={() => reorder(o)} className="btn-navy mt-4 w-full !min-h-11 !text-sm">Pedir novamente</button>
          </div>
        ))}
      </div>
    </>
  );
}
