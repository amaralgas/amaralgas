import { useLocation, useNavigate } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { brl, whatsappLink } from "@/lib/config";

export function FloatingActions() {
  const { pathname } = useLocation();
  const { count, total, setOpen } = useCart();
  const navigate = useNavigate();
  const hideBar = pathname.startsWith("/checkout") || pathname.startsWith("/pedido/");

  return (
    <>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noreferrer"
        className={`fixed right-4 z-30 flex items-center gap-2 rounded-full bg-whatsapp px-4 py-3 font-semibold text-navy-foreground shadow-card transition hover:brightness-105 ${hideBar ? "bottom-4" : "bottom-24 lg:bottom-6"}`}
        aria-label="Falar com o Amaral Gás no WhatsApp"
      >
        <MessageCircle className="size-6" />
        <span className="hidden sm:inline">Falar com o Amaral Gás</span>
      </a>
      {!hideBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
          {count > 0 ? (
            <button className="btn-flame w-full" onClick={() => setOpen(true)}>
              Ver carrinho ({count}) · {brl(total)}
            </button>
          ) : (
            <button className="btn-flame w-full animate-pulse-ring" onClick={() => navigate({ to: "/produtos", search: { c: "gas" } })}>
              🔥 Pedir agora
            </button>
          )}
        </div>
      )}
    </>
  );
}
