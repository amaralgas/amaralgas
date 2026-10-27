import {describe,it,expect} from 'vitest';
import {orderStatusMessage,orderWhatsAppLink} from '../lib/order-messages';
describe('status notification rules',()=>{
 it('preparing promises delivery in up to thirty minutes',()=>expect(orderStatusMessage('Maria',42,'preparando')).toBe('Olá, Maria, seu pedido foi aceito e está sendo preparado para o envio, entrega em até 30 minutos.'));
 it('out for delivery tells the named customer it has left',()=>expect(orderStatusMessage('João',42,'saiu')).toBe('Olá, João, seu pedido já saiu para entrega!'));
 it('changes the WhatsApp message when the status changes',()=>{
  expect(orderWhatsAppLink('55999998888','Maria',42,'saiu')).toContain('https://wa.me/5555999998888?text=');
  expect(decodeURIComponent(orderWhatsAppLink('11999998888','Maria',42,'entregue'))).toContain('foi entregue');
  expect(decodeURIComponent(orderWhatsAppLink('11999998888','Maria',42,'cancelado'))).toContain('foi cancelado');
 });
});