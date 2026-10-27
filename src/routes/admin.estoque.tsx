import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { Crud } from "@/components/admin/Crud";
import { brl } from "@/lib/config";
import { productsQuery } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/estoque")({ head: () => ({ meta: [{"title": "Estoque | Amaral Gás"}, {"name": "description", "content": "Gestão de estoque do Amaral Gás."}, {"property": "og:title", "content": "Estoque | Amaral Gás"}, {"property": "og:description", "content": "Gestão de estoque do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }), component: Estoque });

function Estoque() {
  const { data: products = [] } = useQuery(productsQuery);
  const low = products.filter((p) => p.stock <= p.min_stock);
  const value = products.reduce((s, p) => s + p.stock * Number(p.cost), 0);
  const name = (id: unknown) => products.find((p) => p.id === id)?.name ?? String(id);

  return (
    <Crud table="stock_movements" title="Estoque"
      header={
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs font-semibold uppercase text-muted-foreground">Valor em estoque (custo)</p><p className="font-display text-2xl font-extrabold text-navy">{brl(value)}</p></div>
            <div className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs font-semibold uppercase text-muted-foreground">Itens cadastrados</p><p className="font-display text-2xl font-extrabold text-navy">{products.length}</p></div>
            <div className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs font-semibold uppercase text-muted-foreground">Estoque baixo</p><p className="font-display text-2xl font-extrabold text-destructive">{low.length}</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <span key={p.id} className={`rounded-full px-3 py-1 text-sm font-semibold ${p.stock <= p.min_stock ? "bg-destructive/10 text-destructive" : "bg-card text-navy shadow-card"}`}>
                {p.stock <= p.min_stock && <AlertTriangle className="mr-1 inline size-3" />}{p.name}: {p.stock}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Registre entradas (compras) e saídas (perdas, ajustes). Vendas do site dão baixa automática.</p>
        </div>
      }
      render={{ product_id: (r) => name(r.product_id), created_at: (r) => new Date(String(r.created_at)).toLocaleString("pt-BR"), unit_cost: (r) => r.unit_cost ? brl(Number(r.unit_cost)) : "—" }}
      fields={[
        { key: "product_id", label: "Produto", type: "select", required: true, options: products.map((p) => ({ v: p.id, l: p.name })) },
        { key: "kind", label: "Tipo", type: "select", required: true, options: [{ v: "entrada", l: "Entrada" }, { v: "saida", l: "Saída" }] },
        { key: "qty", label: "Quantidade", type: "number", required: true },
        { key: "unit_cost", label: "Custo unitário", type: "number" },
        { key: "note", label: "Observação" },
      ]} />
  );
}
