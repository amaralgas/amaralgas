import type { OrderItem } from '@/lib/admin-data';
export function customerKey(phone: string, name: string) {
  return phone.replace(/\D/g, '') || `name:${name.trim().toLocaleLowerCase('pt-BR')}`;
}
export function saleTotals(items: OrderItem[], method: string, received: string) {
  const subtotal = Math.round(items.reduce((sum, i) => sum + Math.round(i.price * 100) * i.qty, 0)) / 100;
  const paid = method === 'dinheiro' ? (received.trim() ? Number(received.replace(',', '.')) : subtotal) : subtotal;
  return { subtotal, paid, change: Math.round((paid - subtotal) * 100) / 100, valid: Number.isFinite(paid) && paid >= subtotal };
}
export function receiptAddress(address: unknown) {
  const a = (address ?? {}) as Record<string, string>;
  return [ [a.street, a.number].filter(Boolean).join(', '), a.district, a.cep, a.complement, a.reference ].filter(Boolean).join(' · ') || 'Não informado — venda de balcão';
}
