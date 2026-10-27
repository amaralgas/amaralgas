import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { brl } from "@/lib/config";
import { PAYMENT_LABEL, type PaymentMethod } from "@/lib/orders";
import { orderItems, ordersQuery, productsQuery, sold, sum } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/relatorios")({ head: () => ({ meta: [{"title": "Relatórios de vendas | Amaral Gás"}, {"name": "description", "content": "Gestão de relatórios de vendas do Amaral Gás."}, {"property": "og:title", "content": "Relatórios de vendas | Amaral Gás"}, {"property": "og:description", "content": "Gestão de relatórios de vendas do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }), component: Relatorios });

const PERIODS = [[1, "Hoje"], [7, "7 dias"], [30, "30 dias"], [365, "12 meses"]] as const;

function Relatorios() {
  const { data: orders = [] } = useQuery(ordersQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const [days, setDays] = useState<number>(30);
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
  const list = sold(orders.filter((o) => new Date(o.created_at) >= start));
  const cost = new Map(products.map((p) => [p.id, Number(p.cost)]));

  const byProduct = new Map<string, { name: string; qty: number; revenue: number; cost: number }>();
  const byPay = new Map<string, number>();
  for (const o of list) {
    byPay.set(o.payment_method, (byPay.get(o.payment_method) ?? 0) + Number(o.total));
    for (const i of orderItems(o)) {
      const r = byProduct.get(i.id) ?? { name: i.name, qty: 0, revenue: 0, cost: 0 };
      r.qty += i.qty; r.revenue += i.qty * i.price; r.cost += i.qty * (cost.get(i.id) ?? 0);
      byProduct.set(i.id, r);
    }
  }
  const revenue = sum(list);
  const totalCost = [...byProduct.values()].reduce((s, r) => s + r.cost, 0);
  const delivery = list.reduce((s, o) => s + Number(o.delivery), 0);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl font-extrabold uppercase text-navy">Relatórios</h1>
      <div className="flex gap-2 overflow-x-auto">
        {PERIODS.map(([d, l]) => (
          <button key={d} onClick={() => setDays(d)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${days === d ? "bg-navy text-navy-foreground" : "bg-card text-navy shadow-card"}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Faturamento", brl(revenue)], ["Pedidos", String(list.length)], ["Ticket médio", brl(list.length ? revenue / list.length : 0)], ["Lucro bruto estimado", brl(revenue - delivery - totalCost)]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-sm text-muted-foreground">{l}</p><p className="font-display text-3xl font-extrabold text-navy">{v}</p></div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <section className="overflow-x-auto rounded-2xl bg-card shadow-card">
          <h2 className="p-4 font-display text-xl font-bold uppercase text-navy">Mais vendidos</h2>
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left"><tr><th className="p-3">Produto</th><th className="p-3">Qtd.</th><th className="p-3">Receita</th><th className="p-3">Custo</th></tr></thead>
            <tbody>
              {[...byProduct.values()].sort((a, b) => b.revenue - a.revenue).map((r) => (
                <tr key={r.name} className="border-t"><td className="p-3">{r.name}</td><td className="p-3">{r.qty}</td><td className="p-3 font-semibold">{brl(r.revenue)}</td><td className="p-3">{brl(r.cost)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="mb-3 font-display text-xl font-bold uppercase text-navy">Por pagamento</h2>
          {[...byPay.entries()].map(([k, v]) => (
            <p key={k} className="flex justify-between border-t py-2 text-sm"><span>{PAYMENT_LABEL[k as PaymentMethod] ?? k}</span><b>{brl(v)}</b></p>
          ))}
          {byPay.size === 0 && <p className="text-sm text-muted-foreground">Sem vendas no período.</p>}
        </section>
      </div>
    </div>
  );
}
