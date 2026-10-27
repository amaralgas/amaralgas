import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crud, useTable } from "@/components/admin/Crud";
import { brl } from "@/lib/config";
import { isThisMonth, ordersQuery, orderItems, productsQuery, sold, sum } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/financeiro")({ head: () => ({ meta: [{"title": "Financeiro | Amaral Gás"}, {"name": "description", "content": "Gestão de financeiro do Amaral Gás."}, {"property": "og:title", "content": "Financeiro | Amaral Gás"}, {"property": "og:description", "content": "Gestão de financeiro do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }), component: Financeiro });

const CATS = ["Fornecedor", "Combustível", "Salários", "Aluguel", "Impostos", "Manutenção", "Outros"].map((c) => ({ v: c, l: c }));

function Financeiro() {
  const { data: orders = [] } = useQuery(ordersQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const { data: expenses = [] } = useTable("expenses", "due_date");
  const { data: suppliers = [] } = useTable("suppliers", "name");

  const month = sold(orders).filter((o) => isThisMonth(o.created_at));
  const revenue = sum(month);
  const costMap = new Map(products.map((p) => [p.id, Number(p.cost)]));
  const cmv = month.reduce((s, o) => s + orderItems(o).reduce((a, i) => a + (costMap.get(i.id) ?? 0) * i.qty, 0), 0);
  const monthExp = expenses.filter((e) => isThisMonth(String(e.due_date) + "T12:00"));
  const paid = monthExp.filter((e) => e.paid).reduce((s, e) => s + Number(e.amount), 0);
  const open = expenses.filter((e) => !e.paid).reduce((s, e) => s + Number(e.amount), 0);
  const totalExp = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const profit = revenue - cmv - totalExp;

  const cards = [
    ["Receita do mês", brl(revenue)], ["Custo dos produtos", brl(cmv)], ["Despesas do mês", brl(totalExp)],
    ["Pagas no mês", brl(paid)], ["Contas a pagar (total)", brl(open)], ["Lucro estimado", brl(profit)],
  ];

  return (
    <Crud table="expenses" title="Financeiro" order="due_date"
      header={
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {cards.map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-card p-4 shadow-card">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{l}</p>
              <p className="font-display text-2xl font-extrabold text-navy">{v}</p>
            </div>
          ))}
        </div>
      }
      render={{ amount: (r) => <b>{brl(Number(r.amount))}</b>, paid: (r) => r.paid ? <span className="text-success">Paga</span> : <span className="text-destructive">Em aberto</span> }}
      fields={[
        { key: "description", label: "Descrição", required: true },
        { key: "category", label: "Categoria", type: "select", options: CATS },
        { key: "amount", label: "Valor (R$)", type: "number", required: true },
        { key: "due_date", label: "Vencimento", type: "date", required: true },
        { key: "supplier_id", label: "Fornecedor", type: "select", options: suppliers.map((s) => ({ v: s.id, l: String(s.name) })) },
        { key: "paid", label: "Paga", type: "bool" },
      ]} />
  );
}
