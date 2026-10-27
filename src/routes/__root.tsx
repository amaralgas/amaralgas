import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/lib/cart";
import { loadProducts } from "@/data/catalog";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { CustomerAuthProvider } from '@/lib/customer-auth';

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-navy">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-navy">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">A página que você procura não existe.</p>
        <Link to="/" className="btn-flame mt-6">Voltar ao início</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-navy">Esta página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">Algo deu errado. Tente novamente.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-flame">Tentar de novo</button>
          <a href="/" className="btn-navy">Início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#071B3A" },
      { title: "Amaral Gás — Pediu, chegou!" },
      { name: "description", content: "Peça gás e água online com entrega rápida." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600;700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => { loadProducts(); }, []);
  const isAdmin = useRouterState({ select: (s) => s.location.pathname.startsWith("/admin") });

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <CustomerAuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
        </CustomerAuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <CustomerAuthProvider>
      <CartProvider>
        <Header />
        <main className="min-h-[70vh]">
          <Outlet />
        </main>
        <Footer />
        <CartDrawer />
        <FloatingActions />
        <Toaster position="top-center" richColors />
      </CartProvider>
      </CustomerAuthProvider>
    </QueryClientProvider>
  );
}
