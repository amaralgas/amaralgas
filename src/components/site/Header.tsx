import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Início", search: undefined },
  { to: "/produtos", label: "Gás", search: { c: "gas" } },
  { to: "/produtos", label: "Água", search: { c: "agua" } },
  { to: "/ofertas", label: "Ofertas", search: undefined },
  { to: "/pedidos", label: "Meus Pedidos", search: undefined },
] as const;

export function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur border-b border-navy-foreground/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              search={n.search as never}
              activeOptions={{ exact: true, includeSearch: true }}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-foreground/75 transition hover:text-navy-foreground"
              activeProps={{ className: "!text-flame" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOpen(true)}
            className="relative grid size-12 place-items-center rounded-xl text-navy-foreground hover:bg-navy-foreground/10"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart className="size-6" />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-flame px-1 text-xs font-bold text-flame-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenu((v) => !v)}
            className="grid size-12 place-items-center rounded-xl text-navy-foreground hover:bg-navy-foreground/10 lg:hidden"
            aria-label="Menu"
          >
            {menu ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="border-t border-navy-foreground/10 bg-navy px-4 pb-4 lg:hidden">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              search={n.search as never}
              onClick={() => setMenu(false)}
              className="block border-b border-navy-foreground/10 py-4 font-display text-lg font-bold uppercase tracking-wide text-navy-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
