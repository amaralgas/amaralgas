import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { brl } from "@/lib/config";
import { STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { isThisMonth, isToday, orderItems, ordersQuery, productsQuery, sold, sum } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/")({ head: () => ({ meta: [{"title": "Resumo de vendas | Amaral Gás"}, {"name": "description", "content": "Gestão de resumo de vendas do Amaral Gás."}, {"property": "og:title", "content": "Resumo de vendas | Amaral Gás"}, {"property": "og:description", "content": "Gestão de resumo de vendas do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }), component: Dashboard });

function Dashboard() {
  const { data: orders = [] } = useQuery(ordersQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const today = sold(orders.filter((o) => isToday(o.created_at)));
  const month = sold(orders.filter((o) => isThisMonth(o.created_at)));
  const pending = orders.filter((o) => ["recebido", "preparando", "saiu"].includes(o.status));
  const low = products.filter((p) => p.active && p.stock <= p.min_stock);

  const cards = [
    { l: "Vendas hoje", v: brl(sum(today)), s: `${today.length} pedidos`, i: DollarSign },
    { l: "Vendas no mês", v: brl(sum(month)), s: `${month.length} pedidos`, i: ShoppingBag },
    { l: "Em andamento", v: String(pending.length), s: "a entregar", i: Clock },
    { l: "Estoque baixo", v: String(low.length), s: "produtos", i: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-extrabold uppercase text-navy">Painel</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ l, v, s, i: I }) => (
          <div key={l} className="rounded-2xl bg-card p-4 shadow-card">
            <I className="size-5 text-flame" />
            <p className="mt-2 text-sm text-muted-foreground">{l}</p>
            <p className="font-display text-3xl font-extrabold text-navy">{v}</p>
            <p className="text-xs text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-card p-5 shadow-card">
          <div className="mb-3 flex justify-between"><h2 className="font-display text-xl font-bold uppercase text-navy">Pedidos em andamento</h2><Link to="/admin/pedidos" className="text-sm font-semibold text-flame">Ver todos</Link></div>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Nenhum pedido aguardando.</p>}
          <ul className="divide-y">
            {pending.slice(0, 8).map((o) => (
              <li key={o.id} className="flex justify-between gap-3 py-2 text-sm">
                <span><b className="text-navy">#{o.number}</b> {o.customer_name} · {orderItems(o).map((i) => `${i.qty}x ${i.name}`).join(", ")}</span>
                <span className="shrink-0 font-semibold text-flame">{STATUS_LABEL[o.status as OrderStatus]}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl bg-card p-5 shadow-card">
          <div className="mb-3 flex justify-between"><h2 className="font-display text-xl font-bold uppercase text-navy">Estoque baixo</h2><Link to="/admin/produtos" className="text-sm font-semibold text-flame">Produtos</Link></div>
          {low.length === 0 && <p className="text-sm text-muted-foreground">Estoque em dia.</p>}
          <ul className="divide-y">
            {low.map((p) => (
              <li key={p.id} className="flex justify-between py-2 text-sm"><span>{p.name}</span><b className="text-destructive">{p.stock} un.</b></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
