import { createFileRoute } from "@tanstack/react-router";
import { Crud } from "@/components/admin/Crud";

export const Route = createFileRoute("/admin/entregadores")({
  head: () => ({ meta: [{"title": "Entregadores | Amaral Gás"}, {"name": "description", "content": "Gestão de entregadores do Amaral Gás."}, {"property": "og:title", "content": "Entregadores | Amaral Gás"}, {"property": "og:description", "content": "Gestão de entregadores do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }),
  component: () => (
    <Crud table="drivers" title="Entregadores" order="name" fields={[
      { key: "name", label: "Nome", required: true }, { key: "phone", label: "Telefone" },
      { key: "vehicle", label: "Veículo / placa" }, { key: "active", label: "Ativo", type: "bool" },
    ]} />
  ),
});
