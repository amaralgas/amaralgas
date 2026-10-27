import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { STORE, whatsappLink } from "@/lib/config";
import { Logo } from "./Logo";

export function Footer() {
  const link = "text-navy-foreground/70 hover:text-flame transition";
  return (
    <footer className="bg-navy pb-28 pt-14 text-navy-foreground lg:pb-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 font-display text-3xl font-extrabold uppercase text-flame">Pediu, chegou!</p>
          <p className="mt-2 text-sm text-navy-foreground/60">{STORE.hours}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Link to="/" className={link}>Início</Link>
          <Link to="/produtos" className={link}>Produtos</Link>
          <Link to="/ofertas" className={link}>Ofertas</Link>
          <Link to="/pedidos" className={link}>Meus pedidos</Link>
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className={link}>Contato</a>
          <Link to="/termos" className={link}>Termos de uso</Link>
          <Link to="/privacidade" className={link}>Política de privacidade</Link>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-navy-foreground/50">Siga a gente</p>
          <div className="mt-3 flex gap-2">
            {[Instagram, Facebook].map((I, i) => (
              <a key={i} href="#" aria-label="Rede social (em breve)" className="grid size-11 place-items-center rounded-xl bg-navy-2 hover:bg-flame transition">
                <I className="size-5" />
              </a>
            ))}
            <a href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid size-11 place-items-center rounded-xl bg-navy-2 hover:bg-whatsapp transition">
              <MessageCircle className="size-5" />
            </a>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-navy-foreground/40">
        © {new Date().getFullYear()} Amaral Gás · Agilidade e confiança
      </p>
    </footer>
  );
}
