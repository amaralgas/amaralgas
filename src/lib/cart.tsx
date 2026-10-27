import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product, useCatalog } from "@/data/catalog";
import { STORE } from "./config";

export interface CartLine { product: Product; qty: number }

interface CartCtx {
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "amaral-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const catalogLoaded = useCatalog();
  const [items, setItems] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { /* ignore */ }
  }, []);
  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const value = useMemo<CartCtx>(() => {
    const lines = Object.entries(items)
      .map(([id, qty]) => ({ product: getProduct(id)!, qty }))
      .filter((l) => l.product && l.qty > 0);
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
    const delivery = lines.length ? lines.reduce((total, line) => total + (line.product.deliveryFee == null ? STORE.deliveryFee : line.product.deliveryFee), 0) : 0;
    const discount = 0;
    return {
      lines, subtotal, delivery, discount, total: subtotal + delivery - discount,
      count: lines.reduce((s, l) => s + l.qty, 0),
      open, setOpen,
      add: (id, qty = 1) => setItems((p) => ({ ...p, [id]: (p[id] || 0) + qty })),
      setQty: (id, qty) => setItems((p) => {
        const n = { ...p }; if (qty <= 0) delete n[id]; else n[id] = qty; return n;
      }),
      remove: (id) => setItems((p) => { const n = { ...p }; delete n[id]; return n; }),
      clear: () => setItems({}),
    };
  }, [items, open, catalogLoaded]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
};
