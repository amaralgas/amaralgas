import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, Boxes, Truck, Wallet, Factory, LayoutDashboard, LogOut, Package, ShoppingBag, Store, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel administrativo | Amaral Gás" },
      { name: "description", content: "Gestão de produtos, pedidos, clientes e vendas do Amaral Gás." },
      { property: "og:title", content: "Painel administrativo | Amaral Gás" },
      { property: "og:description", content: "Gestão de produtos, pedidos, clientes e vendas do Amaral Gás." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: ok } = await supabase.rpc("claim_admin");
    if (!ok) throw redirect({ to: "/admin/login", search: { negado: true } });
    return { email: data.user.email ?? "" };
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", l: "Painel", i: LayoutDashboard, exact: true },
  { to: "/admin/pedidos", l: "Pedidos", i: ShoppingBag },
  { to: "/admin/produtos", l: "Produtos", i: Package },
  { to: "/admin/estoque", l: "Estoque", i: Boxes },
  { to: "/admin/financeiro", l: "Financeiro", i: Wallet },
  { to: "/admin/clientes", l: "Clientes", i: Users },
  { to: "/admin/fornecedores", l: "Fornecedores", i: Factory },
  { to: "/admin/entregadores", l: "Entregadores", i: Truck },
  { to: "/admin/relatorios", l: "Relatórios", i: BarChart3 },
] as const;

function AdminLayout() {
  const { email } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };

  return (
    <div className="min-h-screen bg-secondary lg:flex">
      <aside className="bg-navy text-navy-foreground lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <div className="flex items-center justify-between px-4 py-4 lg:block">
          <p className="font-display text-2xl font-extrabold uppercase">Amaral <span className="text-flame">ERP</span></p>
          <p className="hidden truncate text-xs text-navy-foreground/60 lg:block">{email}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 lg:flex-col lg:px-3">
          {NAV.map(({ to, l, i: I, ...r }) => (
            <Link key={to} to={to} activeOptions={{ exact: "exact" in r }}
              className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-foreground/75 transition hover:bg-navy-2"
              activeProps={{ className: "!bg-flame !text-flame-foreground" }}>
              <I className="size-4" /> {l}
            </Link>
          ))}
          <a href="/" target="_blank" className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-foreground/75 hover:bg-navy-2"><Store className="size-4" /> Ver loja</a>
          <button onClick={signOut} className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-navy-foreground/75 hover:bg-navy-2"><LogOut className="size-4" /> Sair</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
