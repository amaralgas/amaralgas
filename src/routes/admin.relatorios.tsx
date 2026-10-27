import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarDays, Download, Printer, Search } from "lucide-react";
import { brl } from "@/lib/config";
import { PAYMENT_LABEL, type PaymentMethod } from "@/lib/orders";
import { orderItems, ordersQuery, productsQuery, sold, sum } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/relatorios")({ head: () => ({ meta: [{ title: "Relatórios de vendas | Amaral Gás" }, { name: "description", content: "Relatórios detalhados de vendas do Amaral Gás." }, { name: "robots", content: "noindex" }] }), component: Relatorios });

const dateInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

function Relatorios() {
  const { data: orders = [], isLoading: loadingOrders } = useQuery(ordersQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const today = dateInput(new Date());
  const [startInput, setStartInput] = useState(today);
  const [endInput, setEndInput] = useState(today);
  const [applied, setApplied] = useState({ start: today, end: today });
  const [loaded, setLoaded] = useState(true);
  const [loading, setLoading] = useState(false);

  const list = useMemo(() => {
    const start = new Date(`${applied.start}T00:00:00`);
    const end = new Date(`${applied.end}T23:59:59.999`);
    return sold(orders.filter((o) => { const d = new Date(o.created_at); return d >= start && d <= end; }));
  }, [orders, applied]);
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
  const loadReport = () => {
    if (!startInput || !endInput) return;
    if (startInput > endInput) { setLoaded(false); return; }
    setLoading(true);
    setApplied({ start: startInput, end: endInput });
    setLoaded(true);
    // React applies the selected range immediately; this short state gives clear button feedback.
    window.setTimeout(() => setLoading(false), 250);
  };
  const exportPdf = () => window.print();

  return <div className="space-y-5 print:space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-semibold uppercase tracking-widest text-flame">Amaral Gás · Gestão</p><h1 className="font-display text-4xl font-extrabold uppercase text-navy">Relatórios</h1><p className="mt-1 text-sm text-muted-foreground">Consulte vendas, produtos e pagamentos por período.</p></div>
      <div className="flex gap-2 print:hidden"><button onClick={exportPdf} className="btn-flame !min-h-10"><Download className="size-4"/> Baixar PDF / Imprimir</button></div>
    </div>

    <section className="rounded-2xl border bg-card p-4 shadow-card print:hidden">
      <div className="mb-3 flex items-center gap-2 font-bold text-navy"><CalendarDays className="size-5 text-flame"/> Selecionar período</div>
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-navy">Data inicial<input type="date" className="field mt-1" value={startInput} max={endInput || undefined} onChange={e=>setStartInput(e.target.value)}/></label>
        <label className="text-sm font-semibold text-navy">Data final<input type="date" className="field mt-1" value={endInput} min={startInput || undefined} onChange={e=>setEndInput(e.target.value)}/></label>
        <button onClick={loadReport} disabled={loading || loadingOrders} className="btn-flame !min-h-11"><Search className="size-4"/>{loading ? "Carregando..." : "Carregar relatório"}</button>
      </div>
      {!loaded && <p className="mt-2 text-sm text-destructive">A data inicial deve ser anterior ou igual à data final.</p>}
    </section>

    <div className="hidden text-sm print:block"><b>Período:</b> {applied.start.split("-").reverse().join("/")} até {applied.end.split("-").reverse().join("/")} · <b>Gerado em:</b> {new Date().toLocaleString("pt-BR")}</div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 print:grid-cols-4">
      {[ ["Faturamento", brl(revenue)], ["Pedidos", String(list.length)], ["Ticket médio", brl(list.length ? revenue / list.length : 0)], ["Lucro bruto estimado", brl(revenue - delivery - totalCost)] ].map(([l,v])=><div key={l} className="rounded-2xl border bg-card p-4 shadow-card print:break-inside-avoid"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-2xl font-extrabold text-navy sm:text-3xl">{v}</p></div>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-[2fr_1fr] print:grid-cols-[2fr_1fr]">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-card print:break-inside-avoid"><h2 className="p-4 font-display text-xl font-bold uppercase text-navy">Produtos vendidos</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-secondary text-left"><tr><th className="p-3">Produto</th><th className="p-3">Qtd.</th><th className="p-3">Receita</th><th className="p-3">Custo estimado</th></tr></thead><tbody>{[...byProduct.values()].sort((a,b)=>b.revenue-a.revenue).map(r=><tr key={r.name} className="border-t"><td className="p-3">{r.name}</td><td className="p-3">{r.qty}</td><td className="p-3 font-semibold">{brl(r.revenue)}</td><td className="p-3">{brl(r.cost)}</td></tr>)}{byProduct.size===0&&<tr><td colSpan={4} className="p-5 text-center text-muted-foreground">Nenhum produto vendido no período.</td></tr>}</tbody></table></div></section>
      <section className="rounded-2xl border bg-card p-4 shadow-card print:break-inside-avoid"><h2 className="mb-3 font-display text-xl font-bold uppercase text-navy">Por forma de pagamento</h2>{[...byPay.entries()].map(([k,v])=><p key={k} className="flex justify-between gap-3 border-t py-2 text-sm"><span>{PAYMENT_LABEL[k as PaymentMethod]??k}</span><b>{brl(v)}</b></p>)}{byPay.size===0&&<p className="text-sm text-muted-foreground">Sem vendas no período.</p>}<div className="mt-3 border-t pt-3"><p className="flex justify-between text-sm"><span>Fretes cobrados</span><b>{brl(delivery)}</b></p><p className="mt-2 flex justify-between text-sm"><span>Custos estimados</span><b>{brl(totalCost)}</b></p></div></section>
    </div>
    <section className="overflow-hidden rounded-2xl border bg-card shadow-card print:break-before-page"><h2 className="p-4 font-display text-xl font-bold uppercase text-navy">Pedidos do período ({list.length})</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-secondary text-left"><tr><th className="p-3">Data e hora</th><th className="p-3">Cliente</th><th className="p-3">Pagamento</th><th className="p-3">Status</th><th className="p-3 text-right">Total</th></tr></thead><tbody>{list.map(o=><tr key={o.id} className="border-t"><td className="whitespace-nowrap p-3">{fmtDate(o.created_at)}</td><td className="p-3">{o.customer_name}</td><td className="p-3">{PAYMENT_LABEL[o.payment_method as PaymentMethod]??o.payment_method}</td><td className="p-3 capitalize">{o.status}</td><td className="p-3 text-right font-semibold">{brl(Number(o.total))}</td></tr>)}{list.length===0&&<tr><td colSpan={5} className="p-5 text-center text-muted-foreground">Nenhum pedido encontrado neste período.</td></tr>}</tbody></table></div></section>
    <p className="text-xs text-muted-foreground print:mt-4">Lucro bruto estimado calculado a partir dos custos cadastrados dos produtos e dos fretes registrados nos pedidos. Confira os dados antes de tomar decisões financeiras.</p>
    <style>{`@media print { body { background: white !important; } aside, nav, header, .no-print { display: none !important; } main { padding: 0 !important; } button { display: none !important; } .shadow-card { box-shadow: none !important; } }`}</style>
  </div>;
}
