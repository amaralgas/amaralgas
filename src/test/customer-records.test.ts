import {describe,it,expect} from 'vitest';
import {saleCustomerDetails,saleDeliveryAddress,customerAddress} from '../lib/customer-records';
describe('registered customer sales',()=>{
 it('fills customer name phone and saved address',()=>{
  expect(saleCustomerDetails({name:'Maria',phone:'11999998888',address:{street:'Rua A',number:'12',district:'Centro',cep:'12345-678',complement:'Casa'}})).toEqual({name:'Maria',phone:'11999998888',address:{street:'Rua A',number:'12',district:'Centro',cep:'12345-678',complement:'Casa'}});
 });
 it('uses the alternate address without changing the saved address',()=>{
  const saved=customerAddress({street:'Rua A',number:'12'});const alternate=customerAddress({street:'Rua B',number:'50'});
  expect(saleDeliveryAddress(saved,alternate,true).street).toBe('Rua B');
  expect(saved.street).toBe('Rua A');
  expect(saleDeliveryAddress(saved,alternate,false).number).toBe('12');
 });
});