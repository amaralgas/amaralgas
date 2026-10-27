import { Plus } from "lucide-react";
import { toast } from "sonner";
import { discountPct, type Product } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { brl } from "@/lib/config";

export function ProductCard({ product, cta = "Adicionar" }: { product: Product; cta?: string }) {
  const { add } = useCart();
  const pct = discountPct(product);
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} loading="lazy" width={816} height={816}
          className="size-full object-cover transition duration-500 group-hover:scale-105" />
        {pct > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-flame px-3 py-1 font-display text-sm font-bold text-flame-foreground">
            {pct}% OFF
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl font-bold leading-tight text-navy">{product.emoji} {product.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-3">
          {product.oldPrice && <p className="text-sm text-muted-foreground line-through">{brl(product.oldPrice)}</p>}
          <p className={`font-display text-2xl font-extrabold ${product.oldPrice ? "text-flame" : "text-navy"}`}>{brl(product.price)}</p>
        </div>
        <button
          onClick={() => { add(product.id); toast.success(`${product.name} adicionado`); }}
          className="btn-flame mt-3 w-full !text-base"
        >
          <Plus className="size-5" /> {cta}
        </button>
      </div>
    </article>
  );
}
