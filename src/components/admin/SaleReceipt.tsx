import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brl, STORE } from '@/lib/config';
import { orderItems, type DbOrder } from '@/lib/admin-data';
import { receiptAddress, saleTotals } from '@/lib/manual-sales';
export function SaleReceipt({ order, onClose }: { order: DbOrder; onClose: () => void }) {
  const totals = saleTotals([{id:'total',name:'Total',qty:1,price:Number(order.total)}],order.payment_method,order.change_for ?? '');
  return createPortal(<div className="receipt-overlay fixed inset-0 z-50 overflow-y-auto bg-navy/70 p-4" role="dialog" aria-modal="true" aria-label="Comprovante de venda">
    <div className="receipt-paper mx-auto max-w-md rounded-lg bg-card p-6 text-card-foreground shadow-card">
      <div className="receipt-actions mb-5 flex justify-between gap-3"><Button onClick={() => window.print()}><Printer />Imprimir / PDF</Button><Button variant="ghost" size="icon" aria-label="Fechar comprovante" onClick={onClose}><X /></Button></div>
      <h2 className="text-center text-3xl font-bold">{STORE.name}</h2>
      <p className="text-center text-sm font-bold">COMPROVANTE DE VENDA</p><p className="text-center text-xs">SEM VALOR FISCAL</p>
      <div className="my-4 border-y border-dashed py-3 text-sm"><p>Venda #{order.number}</p><p>{new Date(order.created_at).toLocaleString('pt-BR')}</p><p><b>Cliente:</b> {order.customer_name}</p>{order.customer_whatsapp && <p><b>Telefone:</b> {order.customer_whatsapp}</p>}<p className="break-words"><b>Endereço:</b> {receiptAddress(order.address)}</p></div>
      <table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left">Produto</th><th className="text-right">Total</th></tr></thead><tbody>{orderItems(order).map(i=><tr key={i.id}><td className="py-2 pr-3">{i.name}<br/><span className="text-xs">{i.qty} × {brl(i.price)}</span></td><td className="text-right whitespace-nowrap">{brl(i.qty*i.price)}</td></tr>)}</tbody></table>
      <div className="mt-3 space-y-1 border-t border-dashed pt-3 text-sm"><p className="flex justify-between"><span>Subtotal</span>{brl(Number(order.subtotal))}</p><p className="flex justify-between"><span>Entrega</span>{brl(Number(order.delivery))}</p><p className="flex justify-between"><span>Desconto</span>{brl(Number(order.discount))}</p><p className="flex justify-between text-lg font-bold"><span>Total</span>{brl(Number(order.total))}</p><p><b>Pagamento:</b> {({pix:'PIX',cartao:'Cartão',dinheiro:'Dinheiro'} as Record<string,string>)[order.payment_method] ?? order.payment_method}</p>{order.payment_method === 'dinheiro' && <><p><b>Valor recebido:</b> {brl(totals.paid)}</p><p><b>Troco:</b> {brl(Math.max(0,totals.change))}</p></>}{order.notes && <p>{order.notes}</p>}</div>
      <p className="mt-5 text-center text-xs">Obrigado pela preferência!</p>
    </div>
  </div>,document.body);
}
