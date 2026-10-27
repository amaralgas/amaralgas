import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, MessageCircle, Plus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualSale } from "@/components/admin/ManualSale";
import { SaleReceipt } from "@/components/admin/SaleReceipt";
import { receiptAddress } from "@/lib/manual-sales";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/config";
import { PAYMENT_LABEL, STATUS_LABEL, type OrderStatus, type PaymentMethod } from "@/lib/orders";
import { orderItems, ordersQuery, type DbOrder } from "@/lib/admin-data";
import { orderWhatsAppLink } from '@/lib/order-messages';

export const Route = createFileRoute("/admin/pedidos")({ head: () => ({meta:[{title:'Pedidos e vendas | Amaral Gás'},{name:'description',content:'Gestão de pedidos, vendas de balcão e comprovantes do Amaral Gás.'},{property:'og:title',content:'Pedidos e vendas | Amaral Gás'},{property:'og:description',content:'Gestão de pedidos e vendas do Amaral Gás.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}), component: Pedidos });

const FLOW: OrderStatus[] = ["recebido", "preparando", "saiu", "entregue", "cancelado"];
const FILTERS = [["ativos", "Em andamento"], ["entregue", "Entregues"], ["cancelado", "Cancelados"], ["todos", "Todos"]] as const;

function Pedidos() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery(ordersQuery);
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("ativos");
  const [manual, setManual] = useState(false);
  const [receipt, setReceipt] = useState<DbOrder | null>(null);
  const [savingStatus,setSavingStatus] = useState<string|null>(null);
  const [selectedStatuses,setSelectedStatuses] = useState<Record<string,OrderStatus>>({});

  useEffect(() => {
    const ch = supabase.channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (p) => {
        if (p.eventType === "INSERT") toast.success("🔔 Novo pedido recebido!");
        qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const setStatus = async (o: DbOrder, status: OrderStatus) => {
    if(savingStatus)return;
    setSavingStatus(o.id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", o.id);
    setSavingStatus(null);
    if (error) return toast.error(error.message);
    setSelectedStatuses(previous=>({...previous,[o.id]:status}));
    qc.invalidateQueries({ queryKey: ["admin", "orders"] });
  };

  const list = data.filter((o) =>
    f === "todos" ? true : f === "ativos" ? !["entregue", "cancelado"].includes(o.status) : o.status === f);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl font-extrabold uppercase text-navy">Pedidos e vendas</h1><Button className="btn-flame" onClick={() => setManual(true)}><Plus />Nova venda</Button></div>
      {manual && <ManualSale onClose={() => setManual(false)} onSaved={o => {setManual(false); setReceipt(o); setF('todos');}} />}
      {receipt && <SaleReceipt order={receipt} onClose={() => setReceipt(null)} />}
      <div className="flex gap-2 overflow-x-auto">
        {FILTERS.map(([k, l]) => (
          <Button key={k} onClick={() => setF(k)} variant={f === k ? 'default' : 'outline'}>{l}</Button>
        ))}
      </div>
      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      {!isLoading && list.length === 0 && <p className="text-muted-foreground">Nenhum pedido aqui.</p>}
      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((o) => {
          const phone = o.customer_whatsapp.replace(/\D/g, "");
          const status = selectedStatuses[o.id] ?? o.status as OrderStatus;
          const next = FLOW[FLOW.indexOf(status) + 1];
          return (
            <div key={o.id} className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-2xl font-bold text-navy">#{o.number} <span className="text-base font-semibold">{o.customer_name}</span></p>
                  <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <select aria-label={`Etapa do pedido #${o.number}`} disabled={savingStatus!==null} value={status} onChange={(e) => setStatus(o, e.target.value as OrderStatus)} className="rounded-lg border bg-background px-2 py-1 text-sm font-semibold">
                  {FLOW.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <ul className="mt-3 text-sm">
                {orderItems(o).map((i) => <li key={i.id}>{i.qty}x {i.name} <span className="text-muted-foreground">({brl(i.price)})</span></li>)}
              </ul>
              <p className="mt-2 flex gap-1 text-sm text-muted-foreground"><MapPin className="size-4 shrink-0" /> {receiptAddress(o.address)}</p>
              <p className="mt-1 text-sm"><b>{PAYMENT_LABEL[o.payment_method as PaymentMethod] ?? o.payment_method}</b>{o.change_for ? ` · troco para R$ ${o.change_for}` : ""} · Total <b className="text-flame">{brl(Number(o.total))}</b></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setReceipt(o)}><Printer />Comprovante</Button>
                {phone && <Button asChild><a href={orderWhatsAppLink(phone,o.customer_name,o.number,status)} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a></Button>}
                {next && status !== "entregue" && <Button disabled={savingStatus!==null} onClick={() => setStatus(o, next === "cancelado" ? "entregue" : next)} className="btn-flame !min-h-10 !text-sm">→ {STATUS_LABEL[next === "cancelado" ? "entregue" : next]}</Button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
