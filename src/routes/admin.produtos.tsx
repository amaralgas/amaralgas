import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LABEL, fallbackImage, loadProducts, type Category } from "@/data/catalog";
import { brl } from "@/lib/config";
import { productsQuery, uploadProductImage, type DbProduct } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/produtos")({ head: () => ({ meta: [{"title": "Produtos do painel | Amaral Gás"}, {"name": "description", "content": "Gestão de produtos do painel do Amaral Gás."}, {"property": "og:title", "content": "Produtos do painel | Amaral Gás"}, {"property": "og:description", "content": "Gestão de produtos do painel do Amaral Gás."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}, {"name": "robots", "content": "noindex"}] }), component: Produtos });

type Form = {
  id?: string; name: string; description: string; category: Category; price: string; old_price: string;
  cost: string; stock: string; min_stock: string; emoji: string; featured: boolean; active: boolean;
  items: string; sort_order: string; image_url: string | null;
};
const EMOJI: Record<Category, string> = { gas: "🔥", agua: "💧", acessorio: "🔧", combo: "🎁" };
const empty: Form = { name: "", description: "", category: "gas", price: "", old_price: "", cost: "0", stock: "0", min_stock: "5", emoji: "🔥", featured: false, active: true, items: "", sort_order: "0", image_url: null };
const toForm = (p: DbProduct): Form => ({
  id: p.id, name: p.name, description: p.description, category: p.category as Category, price: String(p.price),
  old_price: p.old_price ? String(p.old_price) : "", cost: String(p.cost), stock: String(p.stock), min_stock: String(p.min_stock),
  emoji: p.emoji, featured: p.featured, active: p.active, items: p.items.join("\n"), sort_order: String(p.sort_order), image_url: p.image_url,
});
const num = (s: string) => Number(s.replace(",", ".")) || 0;

function Produtos() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery(productsQuery);
  const [form, setForm] = useState<Form | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin"] }); loadProducts(); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form) return;
    if (!form.name.trim() || num(form.price) <= 0) return toast.error("Informe nome e preço");
    setBusy(true);
    try {
      const row = {
        name: form.name.trim(), description: form.description.trim(), category: form.category, price: num(form.price),
        old_price: form.old_price ? num(form.old_price) : null, cost: num(form.cost), stock: Math.round(num(form.stock)),
        min_stock: Math.round(num(form.min_stock)), emoji: form.emoji || EMOJI[form.category], featured: form.featured,
        active: form.active, items: form.items.split("\n").map((s) => s.trim()).filter(Boolean), sort_order: Math.round(num(form.sort_order)),
      };
      let id = form.id;
      if (id) {
        const { error } = await supabase.from("products").update(row).eq("id", id);
        if (error) throw error;
      } else {
        const { data: ins, error } = await supabase.from("products").insert(row).select("id").single();
        if (error) throw error;
        id = ins.id;
      }
      if (file) {
        const url = await uploadProductImage(id, file);
        const { error } = await supabase.from("products").update({ image_url: url }).eq("id", id);
        if (error) throw error;
      }
      toast.success("Produto salvo");
      setForm(null); setFile(null); refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally { setBusy(false); }
  };

  const remove = async (p: DbProduct) => {
    if (!confirm(`Excluir "${p.name}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    toast.success("Produto excluído"); refresh();
  };

  const toggle = async (p: DbProduct) => {
    const { error } = await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const list = data.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => f && { ...f, [k]: e.target.value });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl font-extrabold uppercase text-navy">Produtos</h1>
        <button onClick={() => { setForm(empty); setFile(null); }} className="btn-flame !min-h-11"><Plus className="size-5" /> Novo produto</button>
      </div>
      <input className="field max-w-sm" placeholder="Buscar produto..." value={q} onChange={(e) => setQ(e.target.value)} />

      {isLoading && <p className="text-muted-foreground">Carregando...</p>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <div key={p.id} className={`flex gap-3 rounded-2xl bg-card p-3 shadow-card ${p.active ? "" : "opacity-60"}`}>
            <img src={p.image_url || fallbackImage(p.id, p.category as Category)} alt="" className="size-20 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy">{p.name}</p>
              <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[p.category as Category]} · Estoque: <b className={p.stock <= p.min_stock ? "text-destructive" : ""}>{p.stock}</b></p>
              <p className="font-display text-lg font-bold text-flame">{brl(Number(p.price))} {p.old_price && <s className="text-xs text-muted-foreground">{brl(Number(p.old_price))}</s>}</p>
              <div className="mt-1 flex gap-1">
                <button onClick={() => { setForm(toForm(p)); setFile(null); }} className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-navy"><Pencil className="inline size-3" /> Editar</button>
                <button onClick={() => toggle(p)} className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold text-navy">{p.active ? "Pausar" : "Ativar"}</button>
                <button onClick={() => remove(p)} className="rounded-lg bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive" aria-label="Excluir"><Trash2 className="inline size-3" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 sm:items-center" onClick={() => setForm(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold uppercase text-navy">{form.id ? "Editar produto" : "Novo produto"}</h2>
              <button type="button" onClick={() => setForm(null)} aria-label="Fechar"><X className="size-6" /></button>
            </div>

            <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed p-3">
              {file || form.image_url
                ? <img src={file ? URL.createObjectURL(file) : form.image_url!} alt="" className="size-20 rounded-xl object-cover" />
                : <span className="grid size-20 place-items-center rounded-xl bg-secondary"><ImagePlus className="size-8 text-muted-foreground" /></span>}
              <span className="text-sm"><b className="text-navy">Foto do produto</b><br /><span className="text-muted-foreground">Toque para escolher (até 10 MB)</span></span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <L c="col-span-2" t="Nome"><input className="field" value={form.name} onChange={set("name")} required /></L>
              <L c="col-span-2" t="Descrição"><textarea className="field min-h-20" value={form.description} onChange={set("description")} /></L>
              <L t="Categoria">
                <select className="field" value={form.category} onChange={(e) => { const c = e.target.value as Category; setForm({ ...form, category: c, emoji: EMOJI[c] }); }}>
                  {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
              </L>
              <L t="Ordem na loja"><input className="field" inputMode="numeric" value={form.sort_order} onChange={set("sort_order")} /></L>
              <L t="Preço de venda (R$)"><input className="field" inputMode="decimal" value={form.price} onChange={set("price")} required /></L>
              <L t="Preço antigo (promoção)"><input className="field" inputMode="decimal" value={form.old_price} onChange={set("old_price")} placeholder="Opcional" /></L>
              <L t="Custo (R$)"><input className="field" inputMode="decimal" value={form.cost} onChange={set("cost")} /></L>
              <L t="Estoque"><input className="field" inputMode="numeric" value={form.stock} onChange={set("stock")} /></L>
              <L t="Estoque mínimo"><input className="field" inputMode="numeric" value={form.min_stock} onChange={set("min_stock")} /></L>
              {form.category === "combo" && <L c="col-span-2" t="Itens do combo (um por linha)"><textarea className="field min-h-20" value={form.items} onChange={set("items")} /></L>}
              <label className="flex items-center gap-2 text-sm font-semibold text-navy"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Visível na loja</label>
              <label className="flex items-center gap-2 text-sm font-semibold text-navy"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Destaque</label>
            </div>
            <button disabled={busy} className="btn-flame mt-5 w-full">{busy ? "Salvando..." : "Salvar produto"}</button>
          </form>
        </div>
      )}
    </div>
  );
}

function L({ t, c = "", children }: { t: string; c?: string; children: React.ReactNode }) {
  return <label className={`block text-sm font-semibold text-navy ${c}`}>{t}<div className="mt-1">{children}</div></label>;
}
