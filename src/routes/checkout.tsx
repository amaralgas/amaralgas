import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Banknote, Check, CreditCard, LocateFixed, QrCode } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { CartSummary } from "@/components/site/CartDrawer";
import { brl } from "@/lib/config";
import { PAYMENT_LABEL, saveOrder, type PaymentMethod } from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido | Amaral Gás" },
      { name: "description", content: "Informe seus dados, endereço e forma de pagamento." },
      { property: "og:title", content: "Finalizar pedido — Amaral Gás" },
      { property: "og:description", content: "Checkout rápido em 4 passos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const STEPS = ["Seus dados", "Endereço", "Pagamento", "Confirmar"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold text-navy">{label}</span>{children}</label>;
}

function Checkout() {
  const cart = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", whatsapp: "", cep: "", street: "", number: "", district: "", complement: "", reference: "" });
  const [pay, setPay] = useState<PaymentMethod>("pix");
  const [needChange, setNeedChange] = useState(false);
  const [changeFor, setChangeFor] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const maskPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d;
  };

  const lookupCep = async (cep: string) => {
    const d = cep.replace(/\D/g, "");
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`).then((x) => x.json());
      if (!r.erro) setF((p) => ({ ...p, street: r.logradouro || p.street, district: r.bairro || p.district }));
    } catch { /* offline */ }
  };

  const useLocation = () => {
    if (!navigator.geolocation) { toast.error("Localização indisponível neste aparelho"); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`).then((x) => x.json());
        const a = r.address || {};
        setF((p) => ({ ...p, street: a.road || p.street, district: a.suburb || a.neighbourhood || p.district, cep: a.postcode || p.cep, number: a.house_number || p.number }));
        toast.success("Endereço preenchido. Confira o número.");
      } catch { toast.error("Não foi possível obter o endereço"); }
    }, () => toast.error("Permissão de localização negada"));
  };

  const [sending, setSending] = useState(false);
  const valid = [
    f.name.trim().length > 2 && f.whatsapp.replace(/\D/g, "").length >= 10,
    f.street && f.number && f.district,
    pay !== "dinheiro" || !needChange || Number(changeFor.replace(",", ".")) >= cart.total,
    true,
  ];

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-4xl font-extrabold uppercase text-navy">Carrinho vazio</h1>
        <p className="mt-2 text-muted-foreground">Escolha seu gás ou água para continuar.</p>
        <Link to="/produtos" className="btn-flame mt-6">Ver produtos</Link>
      </div>
    );
  }

  const confirm = async () => {
    if (sending) return;
    setSending(true);
    let o;
    try { o = await saveOrder({
      customer: { name: f.name, whatsapp: f.whatsapp },
      address: { cep: f.cep, street: f.street, number: f.number, district: f.district, complement: f.complement, reference: f.reference },
      payment: { method: pay, changeFor: pay === "dinheiro" && needChange ? changeFor : undefined },
      items: cart.lines.map((l) => ({ id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price })),
      subtotal: cart.subtotal, delivery: cart.delivery, discount: cart.discount, total: cart.total,
    }); } catch { setSending(false); toast.error("Não foi possível enviar o pedido. Tente novamente."); return; }
    cart.clear();
    navigate({ to: "/pedido/$id", params: { id: String(o.id) }, search: { novo: true } });
  };

  const payOpts: { k: PaymentMethod; i: typeof QrCode }[] = [{ k: "pix", i: QrCode }, { k: "dinheiro", i: Banknote }, { k: "cartao", i: CreditCard }];

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
      <div>
        <ol className="mb-6 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s} className="text-center">
              <div className={`mx-auto grid size-9 place-items-center rounded-full font-bold ${i < step ? "bg-success text-navy-foreground" : i === step ? "bg-flame text-flame-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="size-5" /> : i + 1}
              </div>
              <p className={`mt-1 text-xs font-semibold ${i === step ? "text-navy" : "text-muted-foreground"}`}>{s}</p>
            </li>
          ))}
        </ol>

        <div className="rounded-2xl bg-card p-5 shadow-card md:p-7">
          <h1 className="mb-5 font-display text-3xl font-extrabold uppercase text-navy">{STEPS[step]}</h1>

          {step === 0 && (
            <div className="space-y-4">
              <Field label="Nome completo"><input className="field" value={f.name} onChange={set("name")} autoComplete="name" placeholder="Como podemos te chamar?" /></Field>
              <Field label="WhatsApp"><input className="field" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" /></Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <button onClick={useLocation} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-flame/50 py-3.5 font-semibold text-flame">
                <LocateFixed className="size-5" /> Usar meu endereço atual
              </button>
              <Field label="CEP"><input className="field" inputMode="numeric" value={f.cep} onChange={set("cep")} onBlur={(e) => lookupCep(e.target.value)} placeholder="00000-000" /></Field>
              <div className="grid grid-cols-[1fr_110px] gap-3">
                <Field label="Rua"><input className="field" value={f.street} onChange={set("street")} /></Field>
                <Field label="Número"><input className="field" inputMode="numeric" value={f.number} onChange={set("number")} /></Field>
              </div>
              <Field label="Bairro"><input className="field" value={f.district} onChange={set("district")} /></Field>
              <Field label="Complemento (opcional)"><input className="field" value={f.complement} onChange={set("complement")} placeholder="Apto, bloco, casa..." /></Field>
              <Field label="Ponto de referência (opcional)"><input className="field" value={f.reference} onChange={set("reference")} /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {payOpts.map(({ k, i: I }) => (
                <button key={k} onClick={() => setPay(k)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left font-semibold transition ${pay === k ? "border-flame bg-flame/5 text-navy" : "border-border text-navy"}`}>
                  <I className={`size-6 ${pay === k ? "text-flame" : "text-muted-foreground"}`} /> {PAYMENT_LABEL[k]}
                  {pay === k && <Check className="ml-auto size-5 text-flame" />}
                </button>
              ))}
              {pay === "dinheiro" && (
                <div className="rounded-xl bg-muted p-4">
                  <p className="font-semibold text-navy">Precisa de troco?</p>
                  <div className="mt-2 flex gap-2">
                    {[false, true].map((v) => (
                      <button key={String(v)} onClick={() => setNeedChange(v)} className={`flex-1 rounded-xl py-3 font-semibold ${needChange === v ? "bg-navy text-navy-foreground" : "bg-card text-navy"}`}>{v ? "Sim" : "Não"}</button>
                    ))}
                  </div>
                  {needChange && <div className="mt-3"><Field label="Troco para R$"><input className="field" inputMode="decimal" value={changeFor} onChange={(e) => setChangeFor(e.target.value)} placeholder={`Mínimo ${brl(cart.total)}`} /></Field></div>}
                </div>
              )}
              {pay === "pix" && <p className="text-sm text-muted-foreground">A chave PIX será enviada pelo WhatsApp após a confirmação.</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-sm">
              <div className="rounded-xl bg-muted p-4">
                {cart.lines.map((l) => (
                  <div key={l.product.id} className="flex justify-between py-1"><span>{l.qty}x {l.product.name}</span><span className="font-semibold">{brl(l.qty * l.product.price)}</span></div>
                ))}
              </div>
              <Summary label="Cliente" value={`${f.name} · ${f.whatsapp}`} onEdit={() => setStep(0)} />
              <Summary label="Entrega" value={`${f.street}, ${f.number} – ${f.district}${f.complement ? ` (${f.complement})` : ""}`} onEdit={() => setStep(1)} />
              <Summary label="Pagamento" value={`${PAYMENT_LABEL[pay]}${pay === "dinheiro" && needChange ? ` · troco para R$ ${changeFor}` : ""}`} onEdit={() => setStep(2)} />
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {step > 0 && <button onClick={() => setStep(step - 1)} className="rounded-xl border-2 px-5 font-semibold text-navy">Voltar</button>}
            {step < 3
              ? <button disabled={!valid[step]} onClick={() => setStep(step + 1)} className="btn-flame flex-1">Continuar</button>
              : <button onClick={confirm} className="btn-flame flex-1">Confirmar pedido · {brl(cart.total)}</button>}
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl bg-card p-5 shadow-card lg:sticky lg:top-24">
        <p className="mb-3 font-display text-xl font-bold uppercase text-navy">Resumo</p>
        <CartSummary />
      </aside>
    </div>
  );
}

function Summary({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b pb-3">
      <div><p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p><p className="text-navy">{value}</p></div>
      <button onClick={onEdit} className="text-sm font-semibold text-flame">Alterar</button>
    </div>
  );
}
