import type { OrderStatus } from '@/lib/orders';
export function orderStatusMessage(name:string, number:number, status:OrderStatus) {
  switch(status) {
    case 'preparando': return `Olá, ${name}, seu pedido foi aceito e está sendo preparado para o envio, entrega em até 30 minutos.`;
    case 'saiu': return `Olá, ${name}, seu pedido já saiu para entrega!`;
    case 'entregue': return `Olá, ${name}, seu pedido #${number} foi entregue. Obrigado pela preferência! Amaral Gás.`;
    case 'cancelado': return `Olá, ${name}, seu pedido #${number} foi cancelado. Entre em contato com a Amaral Gás se precisar de ajuda.`;
    case 'recebido': return `Olá, ${name}, recebemos seu pedido #${number}! Em breve confirmaremos a preparação. Amaral Gás.`;
  }
}
export function orderWhatsAppLink(phone:string, name:string, number:number, status:OrderStatus) {
  const digits=phone.replace(/\D/g,'');
  const international=digits.length===10||digits.length===11?`55${digits}`:digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(orderStatusMessage(name,number,status))}`;
}