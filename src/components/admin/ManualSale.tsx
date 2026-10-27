import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getProducts, useCatalog, loadProducts } from '@/data/catalog';
import { brl } from '@/lib/config';
import { saleTotals } from '@/lib/manual-sales';
import type { DbOrder, OrderItem } from '@/lib/admin-data';
import { blankAddress,customersQuery,saleCustomerDetails,saleDeliveryAddress } from '@/lib/customer-records';
export function ManualSale({ onClose, onSaved }: { onClose: () => void; onSaved: (order: DbOrder) => void }) {
  useCatalog();
  const products = getProducts();
  const qc = useQueryClient();
  const {data:customers=[],error:customerError}=useQuery(customersQuery);
  const [customerId,setCustomerId]=useState('');
  const [customerSearch,setCustomerSearch]=useState('');
  const [useAlternate,setUseAlternate]=useState(false);
  const [alternateAddress,setAlternateAddress]=useState(blankAddress);
  const [name,setName] = useState(''); const [phone,setPhone] = useState('');
  const [address,setAddress] = useState({street:'',number:'',district:'',cep:'',complement:''});
  const [items,setItems] = useState<OrderItem[]>([]); const [product,setProduct] = useState('');
  const [method,setMethod] = useState('pix'); const [received,setReceived] = useState(''); const [busy,setBusy] = useState(false);
  const deliveryAddress=saleDeliveryAddress(address,alternateAddress,useAlternate);
  const chooseCustomer=(id:string)=>{
    setCustomerId(id);setUseAlternate(false);setAlternateAddress(blankAddress());
    const selected=customers.find(c=>c.id===id);
    if(!selected){setName('');setPhone('');setAddress(blankAddress());return;}
    const details=saleCustomerDetails(selected);setName(details.name);setPhone(details.phone);setAddress(details.address);
  };
  const totals = saleTotals(items,method,received);
  const add = () => { const p = products.find(p=>p.id===product); if(!p) return; setItems(old=> old.some(i=>i.id===p.id) ? old.map(i=>i.id===p.id?{...i,qty:i.qty+1}:i) : [...old,{id:p.id,name:p.name,price:p.price,qty:1}]); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if(busy || !items.length || !totals.valid) return;
    setBusy(true);
    try {
      const {data:number,error} = await supabase.rpc('create_manual_sale',{payload:{customer_name:name,customer_whatsapp:phone,address:deliveryAddress,items:items.map(i=>({id:i.id,qty:i.qty})),payment_method:method,change_for:method==='dinheiro'?String(totals.paid):null}});
      if(error) throw error;
      await Promise.all([qc.invalidateQueries({queryKey:['admin']}),loadProducts()]);
      const {data:order,error:readError} = await supabase.from('orders').select('*').eq('number',number).single();
      toast.success(`Venda #${number} registrada!`);
      if(readError || !order){ toast.error('Venda salva. Abra o comprovante na lista de pedidos.'); onClose(); return; }
      onSaved(order);
    } catch(e) { toast.error(e instanceof Error ? e.message : (e as {message?:string})?.message || 'Não foi possível registrar a venda'); } finally {setBusy(false);}
  };
  return <div className="fixed inset-0 z-40 overflow-y-auto bg-navy/70 p-4" role="dialog" aria-modal="true" aria-label="Nova venda de balcão"><form onSubmit={submit} className="mx-auto max-w-2xl rounded-lg bg-card p-5 shadow-card">
    <div className="mb-5 flex items-center justify-between"><h2 className="text-3xl font-bold text-navy">Nova venda de balcão</h2><Button type="button" size="icon" variant="ghost" disabled={busy} onClick={onClose} aria-label="Fechar venda"><X /></Button></div>
    <div className="mb-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Buscar cliente<input className="field mt-1" value={customerSearch} onChange={e=>setCustomerSearch(e.target.value)} placeholder="Nome ou telefone"/></label><label className="text-sm font-semibold">Cliente cadastrado<select className="field mt-1" value={customerId} onChange={e=>chooseCustomer(e.target.value)}><option value="">Cliente avulso</option>{customers.filter(c=>c.id===customerId||(c.name+c.phone).toLowerCase().includes(customerSearch.toLowerCase())).map(c=><option key={c.id} value={c.id}>{c.name}{c.phone?` · ${c.phone}`:''}</option>)}</select></label></div>
    {customerError&&<p className="mb-3 text-destructive">Não foi possível carregar os clientes cadastrados.</p>}
    <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Nome do cliente<input autoFocus required maxLength={120} className="field mt-1" value={name} onChange={e=>setName(e.target.value)}/></label><label className="text-sm font-semibold">Telefone (opcional)<input className="field mt-1" value={phone} onChange={e=>setPhone(e.target.value)}/></label>
    </div>
    {customerId&&<label className="my-3 flex items-center gap-2 font-semibold"><input type="checkbox" checked={useAlternate} onChange={e=>setUseAlternate(e.target.checked)}/>Endereço alternativo</label>}
    <div className="mt-3 grid gap-3 sm:grid-cols-2">{([['street','Endereço (opcional)'],['number','Número'],['district','Bairro'],['cep','CEP'],['complement','Complemento']] as const).map(([key,label])=><label key={key} className="text-sm font-semibold">{label}<input className="field mt-1" value={deliveryAddress[key]} onChange={e=>useAlternate?setAlternateAddress({...alternateAddress,[key]:e.target.value}):setAddress({...address,[key]:e.target.value})}/></label>)}</div>
    <div className="mt-5 flex gap-2"><select aria-label="Produto" className="field min-w-0 flex-1" value={product} onChange={e=>setProduct(e.target.value)}><option value="">Selecionar produto</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} — {brl(p.price)} · estoque {p.stock ?? 0}</option>)}</select><Button type="button" onClick={add} disabled={!product} className="h-auto" aria-label="Adicionar produto"><Plus /></Button></div>
    <div className="mt-3 divide-y">{items.map(i=><div key={i.id} className="flex flex-wrap items-center gap-3 py-3"><span className="min-w-0 flex-1 font-semibold">{i.name}<small className="block font-normal">{brl(i.price)} / un.</small></span><input type="number" min={1} step={1} required aria-label={`Quantidade de ${i.name}`} className="field max-w-20" value={i.qty} onChange={e=>setItems(old=>old.map(x=>x.id===i.id?{...x,qty:Number(e.target.value)}:x))}/><span>{brl(i.price*i.qty)}</span><Button type="button" variant="ghost" size="icon" aria-label={`Remover ${i.name}`} onClick={()=>setItems(old=>old.filter(x=>x.id!==i.id))}><Trash2 /></Button></div>)}</div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Forma de pagamento<select className="field mt-1" value={method} onChange={e=>setMethod(e.target.value)}><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option></select></label>{method==='dinheiro' && <label className="text-sm font-semibold">Valor recebido (R$)<input type="number" min={totals.subtotal} step="0.01" placeholder={String(totals.subtotal)} className="field mt-1" value={received} onChange={e=>setReceived(e.target.value)}/></label>}</div>
    <div className="my-5 flex justify-between text-xl font-bold"><span>Total {brl(totals.subtotal)}</span>{method==='dinheiro' && <span>Troco {brl(Math.max(0,totals.change))}</span>}</div>{!totals.valid && <p className="mb-3 text-destructive">Valor recebido menor que o total.</p>}
    <Button type="submit" disabled={busy || !items.length || !totals.valid} className="btn-flame w-full"><ShoppingBag />{busy?'Registrando…':'Registrar e abrir comprovante'}</Button>
  </form></div>;
}
