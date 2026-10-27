import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { customerAddress, type Customer } from '@/lib/customer-records';
export function CustomerForm({customer,onClose}:{customer:Partial<Customer>;onClose:()=>void}) {
  const qc=useQueryClient();
  const [name,setName]=useState(customer.name??'');
  const [phone,setPhone]=useState(customer.phone??'');
  const [address,setAddress]=useState(customerAddress(customer.address));
  const [busy,setBusy]=useState(false);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(busy||!name.trim())return;setBusy(true);
    try {
      const payload={name:name.trim(),phone:phone.trim(),address};
      const {error}=customer.id?await supabase.from('customers').update(payload).eq('id',customer.id):await supabase.from('customers').insert(payload);
      if(error)throw error;
      await qc.invalidateQueries({queryKey:['admin','customers']});
      toast.success('Cliente salvo');onClose();
    }catch{toast.error('Não foi possível salvar o cliente. Tente novamente.');}finally{setBusy(false);}
  };
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/70 p-4" role="dialog" aria-modal="true" aria-label="Cadastro de cliente"><form onSubmit={submit} className="mx-auto max-w-lg space-y-4 rounded-lg bg-card p-6 shadow-card"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-navy">{customer.id?'Editar cliente':'Novo cliente'}</h2><Button type="button" size="icon" variant="ghost" disabled={busy} onClick={onClose} aria-label="Fechar cadastro"><X/></Button></div><label className="block font-semibold">Nome do cliente<input required maxLength={120} className="field mt-1" value={name} onChange={e=>setName(e.target.value)}/></label><label className="block font-semibold">Telefone<input type="tel" className="field mt-1" value={phone} onChange={e=>setPhone(e.target.value)}/></label><div className="grid gap-3 sm:grid-cols-2">{([['street','Endereço'],['number','Número'],['district','Bairro'],['cep','CEP'],['complement','Complemento']] as const).map(([key,label])=><label key={key} className="block font-semibold">{label}<input className="field mt-1" value={address[key]} onChange={e=>setAddress({...address,[key]:e.target.value})}/></label>)}</div><Button type="submit" disabled={busy} className="btn-flame w-full">{busy?'Salvando…':'Salvar cliente'}</Button></form></div>;
}