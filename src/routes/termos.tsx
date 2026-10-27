import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso | Amaral Gás" },
      { name: "description", content: "Termos de uso do site de pedidos Amaral Gás." },
      { property: "og:title", content: "Termos de uso — Amaral Gás" },
      { property: "og:description", content: "Condições para uso do site de pedidos." },
    ],
  }),
  component: () => (
    <>
      <PageHero title="Termos de uso" />
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 text-muted-foreground">
        <p>Ao fazer um pedido pelo site do Amaral Gás, você concorda em informar dados corretos para entrega e contato.</p>
        <p>Preços e disponibilidade podem mudar sem aviso. O valor final é confirmado no resumo do pedido.</p>
        <p>Pedidos podem ser cancelados pelo WhatsApp antes de saírem para entrega.</p>
        <p>Por segurança, a troca de botijões segue as normas vigentes da ANP.</p>
      </div>
    </>
  ),
});
