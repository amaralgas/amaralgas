import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Nova senha | Amaral Gás" },
      { name: "description", content: "Defina uma nova senha de acesso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pass, setPass] = useState("");
  const navigate = useNavigate();
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pass });
    if (error) return toast.error(error.message);
    toast.success("Senha atualizada");
    navigate({ to: "/admin" });
  };
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <form onSubmit={save} className="rounded-3xl bg-card p-7 shadow-card">
        <h1 className="mb-4 font-display text-3xl font-extrabold uppercase text-navy">Nova senha</h1>
        <input className="field" type="password" minLength={8} required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mínimo 8 caracteres" />
        <button className="btn-flame mt-4 w-full">Salvar</button>
      </form>
    </div>
  );
}
