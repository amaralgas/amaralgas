import { useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { getUpsell, useCatalog } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/config";

export function CartSummary() {
  const { subtotal, delivery, discount, total } = useCart();
  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{brl(subtotal)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Entrega</dt><dd>{brl(delivery)}</dd></div>
      <div className="flex justify-between"><dt className="text-muted-foreground">Desconto</dt><dd>{brl(discount)}</dd></div>
      <div className="flex justify-between border-t pt-2 font-display text-2xl font-extrabold text-navy"><dt>Total</dt><dd>{brl(total)}</dd></div>
    </dl>
  );
}

export function CartDrawer() {
  useCatalog();
  const { open, setOpen, lines, setQty, remove, add } = useCart();
  const navigate = useNavigate();
  const upsell = getUpsell(lines.map((l) => l.product.id));
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-navy/60 animate-in fade-in" onClick={() => setOpen(false)} aria-label="Fechar" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between bg-navy px-5 py-4 text-navy-foreground">
          <h2 className="font-display text-2xl font-bold uppercase">Seu carrinho</h2>
          <button onClick={() => setOpen(false)} className="grid size-11 place-items-center rounded-xl hover:bg-navy-foreground/10" aria-label="Fechar carrinho">
            <X className="size-6" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingCart className="size-14 text-muted-foreground" />
            <p className="text-lg font-semibold text-navy">Seu carrinho está vazio</p>
            <button className="btn-flame" onClick={() => { setOpen(false); navigate({ to: "/produtos" }); }}>Ver produtos</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map(({ product: p, qty }) => (
                <div key={p.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-card">
                  <img src={p.image} alt="" className="size-20 rounded-xl object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-semibold leading-tight text-navy">{p.name}</p>
                      <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive" aria-label="Remover"><Trash2 className="size-5" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground">{brl(p.price)} / un.</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-xl border">
                        <button onClick={() => setQty(p.id, qty - 1)} className="grid size-10 place-items-center" aria-label="Diminuir"><Minus className="size-4" /></button>
                        <span className="w-8 text-center font-bold">{qty}</span>
                        <button onClick={() => setQty(p.id, qty + 1)} className="grid size-10 place-items-center" aria-label="Aumentar"><Plus className="size-4" /></button>
                      </div>
                      <p className="font-display text-lg font-bold text-navy">{brl(p.price * qty)}</p>
                    </div>
                  </div>
                </div>
              ))}

              {upsell.length > 0 && (
                <div className="pt-3">
                  <p className="mb-2 font-display text-lg font-bold text-navy">Você também pode precisar de...</p>
                  {upsell.map((u) => (
                    <div key={u.id} className="mb-2 flex items-center justify-between rounded-xl border border-dashed border-flame/50 bg-flame/5 p-3">
                      <div>
                        <p className="font-semibold text-navy">{u.emoji} {u.name}</p>
                        <p className="text-sm font-bold text-flame">{brl(u.price)}</p>
                      </div>
                      <button onClick={() => add(u.id)} className="rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-navy-foreground">+ Adicionar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t bg-card p-4">
              <CartSummary />
              <button className="btn-flame mt-4 w-full" onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }}>
                Continuar pedido
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
