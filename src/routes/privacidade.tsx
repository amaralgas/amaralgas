import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade | Amaral Gás" },
      { name: "description", content: "Como o Amaral Gás usa e protege seus dados." },
      { property: "og:title", content: "Política de privacidade — Amaral Gás" },
      { property: "og:description", content: "Seus dados usados só para entregar seu pedido." },
    ],
  }),
  component: () => (
    <>
      <PageHero title="Política de privacidade" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-muted-foreground">
        <p>Coletamos apenas nome, WhatsApp e endereço, usados exclusivamente para entregar seu pedido e falar com você.</p>
        <p>Não vendemos nem compartilhamos seus dados com terceiros.</p>
        <p>Você pode pedir a exclusão dos seus dados a qualquer momento pelo nosso WhatsApp.</p>
      </div>
    </>
  ),
});
