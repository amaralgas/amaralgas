import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Plus, Pencil, UserPlus } from "lucide-react";
import { useState } from "react";
import { brl } from "@/lib/config";
import { ordersQuery, sold } from "@/lib/admin-data";
import { customerKey } from "@/lib/manual-sales";
import { customersQuery,customerAddress,type Customer } from '@/lib/customer-records';
import { CustomerForm } from '@/components/admin/CustomerForm';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/admin/clientes")({ head: () => ({ meta: [{"title": "Clientes | Amaral Gás"}, {"name": "description", "content": "Gestão de clientes do Amaral Gás."}, {"property": "og:title", "content": "Clientes | Amaral Gás"}, {"property": "og:description", "content": "Gestão de clientes do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }), component: Clientes });

function Clientes() {
  const { data = [] } = useQuery(ordersQuery);
  const {data:customers=[],error}=useQuery(customersQuery);
  const [edit,setEdit]=useState<Partial<Customer>|null>(null);
  const [q, setQ] = useState("");
  const map = new Map<string, { name: string; phone: string; district: string; count: number; total: number; last: string; customer?:Customer;address?:unknown }>();
  for(const customer of customers)map.set(customerKey(customer.phone,customer.name),{name:customer.name,phone:customer.phone,district:customerAddress(customer.address).district,count:0,total:0,last:'',customer,address:customer.address});
  for (const o of sold(data)) {
    const k = customerKey(o.customer_whatsapp, o.customer_name);
    const c = map.get(k) ?? { name: o.customer_name, phone: o.customer_whatsapp, district: (o.address as Record<string, string>).district ?? "", count: 0, total: 0, last: o.created_at,address:o.address };
    c.count++; c.total += Number(o.total); if (o.created_at > c.last) c.last = o.created_at;
    map.set(k, c);
  }
  const list = [...map.values()].filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl font-extrabold uppercase text-navy">Clientes</h1><Button className="btn-flame" onClick={()=>setEdit({})}><Plus/>Novo cliente</Button></div>
      {edit&&<CustomerForm customer={edit} onClose={()=>setEdit(null)}/>}
      {error&&<p className="text-destructive">Não foi possível carregar os clientes cadastrados.</p>}
      <input className="field max-w-sm" placeholder="Buscar por nome ou telefone..." value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 && <p className="text-muted-foreground">Nenhum cliente encontrado.</p>}
      <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-navy"><tr><th className="p-3">Cliente</th><th className="p-3">Bairro</th><th className="p-3">Pedidos</th><th className="p-3">Total gasto</th><th className="p-3">Último</th><th /></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={customerKey(c.phone, c.name)} className="border-t">
                <td className="p-3"><b className="text-navy">{c.name}</b><br /><span className="text-muted-foreground">{c.phone}</span></td>
                <td className="p-3">{c.district}</td>
                <td className="p-3">{c.count}</td>
                <td className="p-3 font-semibold">{brl(c.total)}</td>
                <td className="p-3">{c.last?new Date(c.last).toLocaleDateString("pt-BR"):'—'}</td>
                <td className="p-3"><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label={`${c.customer?'Editar':'Cadastrar'} ${c.name}`} onClick={()=>setEdit(c.customer??{name:c.name,phone:c.phone,address:customerAddress(c.address)})}>{c.customer?<Pencil/>:<UserPlus/>}</Button>{c.phone&&<Button asChild variant="ghost" size="icon"><a href={`https://wa.me/55${c.phone.replace(/\D/g, "").replace(/^55/, "")}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${c.name}`}><MessageCircle className="size-5 text-success" /></a></Button>}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
