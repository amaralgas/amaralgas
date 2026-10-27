// Admin-side data access (browser client, protected by database access rules).
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbProduct = Tables<"products">;
export type DbOrder = Tables<"orders">;
export type OrderItem = { id: string; name: string; qty: number; price: number };

export const productsQuery = queryOptions({
  queryKey: ["admin", "products"],
  queryFn: async () => {
    const { data, error } = await supabase.from("products").select("*").order("sort_order").order("name");
    if (error) throw error;
    return data;
  },
});

export const ordersQuery = queryOptions({
  queryKey: ["admin", "orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return data;
  },
});

export const orderItems = (o: DbOrder) => (o.items as unknown as OrderItem[]) ?? [];

/** Uploads a photo and returns a long-lived link to show it on the shop. */
export async function uploadProductImage(productId: string, file: File) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("Falha ao gerar link da foto");
  return data.signedUrl;
}

export const isToday = (d: string) => new Date(d).toDateString() === new Date().toDateString();
export const isThisMonth = (d: string) => {
  const x = new Date(d), n = new Date();
  return x.getMonth() === n.getMonth() && x.getFullYear() === n.getFullYear();
};
export const sold = (orders: DbOrder[]) => orders.filter((o) => o.status !== "cancelado");
export const sum = (orders: DbOrder[]) => orders.reduce((s, o) => s + Number(o.total), 0);
