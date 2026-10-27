// Orders are saved to the store's database (seen in the admin panel). A copy is
// kept in the browser so the customer can see "Meus pedidos" without an account.
import { supabase } from "@/integrations/supabase/client";

export type PaymentMethod = "pix" | "dinheiro" | "cartao";
export type OrderStatus = "recebido" | "preparando" | "saiu" | "entregue" | "cancelado";

export interface Order {
  id: number;
  createdAt: number;
  customer: { name: string; whatsapp: string };
  address: { cep: string; street: string; number: string; district: string; complement?: string | undefined; reference?: string | undefined };
  payment: { method: PaymentMethod; changeFor?: string | undefined };
  items: { id: string; name: string; qty: number; price: number }[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  status?: OrderStatus;
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  pix: "PIX", dinheiro: "Dinheiro", cartao: "Cartão na entrega",
};

export const STATUS_STEPS: { key: OrderStatus; label: string; desc: string }[] = [
  { key: "recebido", label: "Pedido recebido", desc: "Recebemos seu pedido." },
  { key: "preparando", label: "Preparando pedido", desc: "Separando seus produtos." },
  { key: "saiu", label: "Saiu para entrega", desc: "O entregador está a caminho." },
  { key: "entregue", label: "Pedido entregue", desc: "Obrigado pela preferência!" },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  recebido: "Recebido", preparando: "Preparando", saiu: "Saiu para entrega", entregue: "Entregue", cancelado: "Cancelado",
};

const KEY = "amaral-orders";

export function listOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
export function getOrder(id: number) { return listOrders().find((o) => o.id === id); }

export async function saveOrder(data: Omit<Order, "id" | "createdAt">): Promise<Order> {
  const { data: number, error } = await supabase.rpc("create_order", {
    payload: {
      customer_name: data.customer.name, customer_whatsapp: data.customer.whatsapp,
      address: data.address, payment_method: data.payment.method, change_for: data.payment.changeFor ?? null,
      items: data.items, subtotal: data.subtotal, delivery: data.delivery, discount: data.discount, total: data.total,
    },
  });
  if (error || typeof number !== "number") throw error ?? new Error("Pedido não registrado");
  const order: Order = { ...data, id: number, createdAt: Date.now(), status: "recebido" };
  localStorage.setItem(KEY, JSON.stringify([order, ...listOrders()]));
  return order;
}

/** Real statuses set by the store in the admin panel. */
export async function fetchStatuses(ids: number[]): Promise<Record<number, OrderStatus>> {
  if (!ids.length) return {};
  const { data } = await supabase.rpc("order_statuses", { _numbers: ids });
  return Object.fromEntries((data ?? []).map((r) => [r.number, r.status as OrderStatus]));
}

/** Index of the status in STATUS_STEPS (cancelado → -1). */
export const statusIndex = (s?: OrderStatus) => STATUS_STEPS.findIndex((x) => x.key === (s ?? "recebido"));
