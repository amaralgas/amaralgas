import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type Customer = Tables<'customers'>;
export type CustomerAddress = {street:string;number:string;district:string;cep:string;complement:string};
export const blankAddress = (): CustomerAddress => ({street:'',number:'',district:'',cep:'',complement:''});
export function customerAddress(value: unknown): CustomerAddress {
  const result = blankAddress();
  if (!value || typeof value !== 'object') return result;
  for (const key of Object.keys(result) as (keyof CustomerAddress)[]) {
    const v = (value as Record<string, unknown>)[key];
    if (typeof v === 'string') result[key] = v;
  }
  return result;
}
export function saleCustomerDetails(customer: Pick<Customer,'name'|'phone'|'address'>) {
  return {name:customer.name,phone:customer.phone,address:customerAddress(customer.address)};
}
export function saleDeliveryAddress(saved: CustomerAddress, alternate: CustomerAddress, useAlternate: boolean) {
  return {...(useAlternate ? alternate : saved)};
}
export const customersQuery = queryOptions({
  queryKey:['admin','customers'],
  queryFn: async () => {
    const {data,error} = await supabase.from('customers').select('*').order('name');
    if(error) throw error;
    return data;
  },
});