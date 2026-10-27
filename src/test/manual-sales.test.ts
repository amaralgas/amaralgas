import { describe, it, expect } from 'vitest';
import { saleTotals, receiptAddress, customerKey } from '../lib/manual-sales';
describe('manual sale rules', () => {
  it('keeps walk-in customers without phones separate', () => {
    expect(customerKey('', 'Maria')).not.toBe(customerKey('', 'João'));
  });
  it('calculates product quantities in the total', () => {
    expect(saleTotals([{id:'gas',name:'Gás',qty:2,price:110},{id:'water',name:'Água',qty:1,price:15}], 'pix', '').subtotal).toBe(235);
  });
  it('calculates cash change', () => {
    expect(saleTotals([{id:'gas',name:'Gás',qty:1,price:110}], 'dinheiro', '150').change).toBe(40);
  });
  it('rejects insufficient received cash', () => {
    expect(saleTotals([{id:'gas',name:'Gás',qty:1,price:110}], 'dinheiro', '100').valid).toBe(false);
  });
  it('does not give change for card payment', () => {
    expect(saleTotals([{id:'gas',name:'Gás',qty:1,price:110}], 'cartao', '150').change).toBe(0);
  });
  it('includes the customer address', () => {
    expect(receiptAddress({street:'Rua A',number:'10',district:'Centro',cep:'12345-678'})).toBe('Rua A, 10 · Centro · 12345-678');
  });
});