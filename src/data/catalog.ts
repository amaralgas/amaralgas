import { useSyncExternalStore } from "react";
import gasImg from "@/assets/gas-p13.jpg";
import agua20 from "@/assets/agua-20l.jpg";
import garrafas from "@/assets/agua-garrafas.jpg";
import { supabase } from "@/integrations/supabase/client";

export type Category = "gas" | "agua" | "acessorio" | "combo";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  /** Original price when on promotion */
  oldPrice?: number;
  image: string;
  emoji: string;
  featured?: boolean;
  stock?: number;
  /** Combo contents, display only */
  items?: string[];
}

export const CATEGORY_LABEL: Record<Category, string> = {
  gas: "Gás", agua: "Água", acessorio: "Acessório", combo: "Combo",
};

/** Fallback photo when a product has no uploaded image. */
export function fallbackImage(id: string, c: Category) {
  if (c === "agua") return id.includes("500") || id.includes("1500") ? garrafas : agua20;
  return gasImg;
}

// Products come from the admin panel (database). This store is filled once on
// load; all reads still go through the functions below.
let PRODUCTS: Product[] = [];
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export async function loadProducts() {
  const { data, error } = await supabase
    .from("products").select("*").eq("active", true).order("sort_order").order("name");
  if (error) { console.error(error); return; }
  PRODUCTS = (data ?? []).map((r) => ({
    id: r.id, name: r.name, description: r.description, category: r.category as Category,
    price: Number(r.price), oldPrice: r.old_price ? Number(r.old_price) : undefined,
    image: r.image_url || fallbackImage(r.id, r.category as Category),
    emoji: r.emoji, featured: r.featured, stock: r.stock,
    items: r.items?.length ? r.items : undefined,
  }));
  loaded = true;
  emit();
}

/** Subscribe a component to catalog changes. Returns true once loaded. */
export function useCatalog() {
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => PRODUCTS,
    () => PRODUCTS,
  );
  return loaded;
}

export const getProducts = () => PRODUCTS;
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getByCategory = (c: Category) => PRODUCTS.filter((p) => p.category === c);
export const getOffers = () => PRODUCTS.filter((p) => p.oldPrice && p.category !== "combo");
export const getCombos = () => getByCategory("combo");
export const getUpsell = (inCart: string[]) =>
  ["agua-20l", "regulador", "agua-1500"].filter((id) => !inCart.includes(id)).map((id) => getProduct(id)).filter((p): p is Product => !!p).slice(0, 2);

export const discountPct = (p: Product) =>
  p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
