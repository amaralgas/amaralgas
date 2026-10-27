import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Field = { key: string; label: string; type?: "text" | "number" | "date" | "bool" | "select"; options?: { v: string; l: string }[]; required?: boolean };
type Row = Record<string, unknown> & { id: string };

export function useTable(table: string, order = "created_at") {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table as never).select("*").order(order, { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });
}

export function Crud({ table, title, fields, render, header, order }: {
  table: string; title: string; fields: Field[]; order?: string;
  render?: Record<string, (r: Row) => ReactNode>; header?: ReactNode;
}) {
  const qc = useQueryClient();
  const { data = [] } = useTable(table, order);
  const [edit, setEdit] = useState<Partial<Row> | null>(null);

  const save = async () => {
    if (!edit) return;
    const payload: Record<string, unknown> = {};
    for (const f of fields) {
      const v = edit[f.key];
      if (f.required && (v === undefined || v === "")) { toast.error(`Preencha: ${f.label}`); return; }
      payload[f.key] = f.type === "number" ? (v === "" || v == null ? null : Number(v)) : f.type === "bool" ? !!v : v === "" ? null : v;
    }
    const q = edit.id
      ? supabase.from(table as never).update(payload as never).eq("id", edit.id)
      : supabase.from(table as never).insert(payload as never);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Salvo"); setEdit(null); qc.invalidateQueries({ queryKey: ["admin"] });
  };
  const del = async (id: string) => {
    if (!confirm("Excluir este registro?")) return;
    const { error } = await supabase.from(table as never).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
  const show = (r: Row, f: Field) => {
    if (render?.[f.key]) return render[f.key]!(r);
    const v = r[f.key];
    if (f.type === "bool") return v ? "Sim" : "Não";
    if (f.type === "select") return f.options?.find((o) => o.v === v)?.l ?? String(v ?? "");
    if (f.type === "date" && v) return new Date(String(v) + "T12:00").toLocaleDateString("pt-BR");
    return String(v ?? "—");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-extrabold uppercase text-navy">{title}</h1>
        <button className="btn-flame !min-h-11" onClick={() => setEdit({})}><Plus className="size-4" /> Novo</button>
      </div>
      {header}
      <div className="overflow-x-auto rounded-2xl bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-navy"><tr>{fields.map((f) => <th key={f.key} className="p-3">{f.label}</th>)}<th /></tr></thead>
          <tbody>
            {data.length === 0 && <tr><td colSpan={fields.length + 1} className="p-6 text-center text-muted-foreground">Nenhum registro ainda.</td></tr>}
            {data.map((r) => (
              <tr key={r.id} className="border-t">
                {fields.map((f) => <td key={f.key} className="p-3">{show(r, f)}</td>)}
                <td className="whitespace-nowrap p-3 text-right">
                  <button onClick={() => setEdit(r)} aria-label="Editar" className="p-1 text-navy"><Pencil className="size-4" /></button>
                  <button onClick={() => del(r.id)} aria-label="Excluir" className="p-1 text-destructive"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => setEdit(null)}>
          <div className="w-full max-w-md space-y-3 rounded-2xl bg-card p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-extrabold uppercase text-navy">{edit.id ? "Editar" : "Novo"}</h2>
            {fields.map((f) => (
              <label key={f.key} className="block text-sm font-semibold text-navy">
                {f.label}
                {f.type === "bool" ? (
                  <input type="checkbox" className="ml-2" checked={!!edit[f.key]} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.checked })} />
                ) : f.type === "select" ? (
                  <select className="field mt-1" value={String(edit[f.key] ?? "")} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })}>
                    <option value="">Selecione...</option>
                    {f.options?.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : (
                  <input className="field mt-1" type={f.type ?? "text"} step="0.01" value={String(edit[f.key] ?? "")} onChange={(e) => setEdit({ ...edit, [f.key]: e.target.value })} />
                )}
              </label>
            ))}
            <div className="flex gap-2 pt-2">
              <button className="btn-flame flex-1" onClick={save}>Salvar</button>
              <button className="btn-navy flex-1" onClick={() => setEdit(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
