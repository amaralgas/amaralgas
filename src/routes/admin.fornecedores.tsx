import { createFileRoute } from "@tanstack/react-router";
import { Crud } from "@/components/admin/Crud";

export const Route = createFileRoute("/admin/fornecedores")({
  head: () => ({ meta: [{"title": "Fornecedores | Amaral Gás"}, {"name": "description", "content": "Gestão de fornecedores do Amaral Gás."}, {"property": "og:title", "content": "Fornecedores | Amaral Gás"}, {"property": "og:description", "content": "Gestão de fornecedores do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }),
  component: () => (
    <Crud table="suppliers" title="Fornecedores" order="name" fields={[
      { key: "name", label: "Nome", required: true }, { key: "phone", label: "Telefone" },
      { key: "email", label: "E-mail" }, { key: "document", label: "CNPJ/CPF" }, { key: "notes", label: "Observações" },
    ]} />
  ),
});
