import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  validateSearch: (s) => z.object({ negado: z.boolean().optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "Entrar no painel | Amaral Gás" },
      { name: "description", content: "Acesso restrito à equipe do Amaral Gás." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const { negado } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (error) throw error;
        toast.success("Enviamos um link de confirmação para seu e-mail.");
        setMode("in");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast.success("Enviamos um link para redefinir a senha.");
        setMode("in");
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : "";
      toast.error(m.includes("Invalid login") ? "E-mail ou senha incorretos" : m.includes("not confirmed") ? "Confirme seu e-mail antes de entrar" : m || "Erro");
    } finally { setBusy(false); }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-navy px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-card p-7 shadow-card">
        <p className="font-display text-3xl font-extrabold uppercase text-navy">Amaral <span className="text-flame">ERP</span></p>
        <p className="mb-5 text-sm text-muted-foreground">
          {mode === "in" ? "Entre para gerenciar a loja." : mode === "up" ? "Crie o acesso do administrador." : "Receba um link para nova senha."}
        </p>
        {negado && <p className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Esta conta não tem acesso ao painel.</p>}
        <label className="mb-3 block text-sm font-semibold text-navy">E-mail
          <input className="field mt-1" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        {mode !== "reset" && (
          <label className="mb-5 block text-sm font-semibold text-navy">Senha
            <input className="field mt-1" type="password" required minLength={8} value={pass} onChange={(e) => setPass(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} />
          </label>
        )}
        <button disabled={busy} className="btn-flame w-full">{busy ? "Aguarde..." : mode === "in" ? "Entrar" : mode === "up" ? "Criar acesso" : "Enviar link"}</button>
        <div className="mt-4 flex justify-between text-sm">
          <button type="button" onClick={() => setMode(mode === "up" ? "in" : "up")} className="font-semibold text-navy underline">{mode === "up" ? "Já tenho acesso" : "Primeiro acesso"}</button>
          <button type="button" onClick={() => setMode("reset")} className="text-muted-foreground underline">Esqueci a senha</button>
        </div>
      </form>
    </div>
  );
}
