import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, MapPin, Send, Check } from "lucide-react";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Vaga Já" },
      { name: "description", content: "Fale com o time da Vaga Já por WhatsApp, e-mail ou formulário. Resposta em até 24h úteis." },
    ],
  }),
  component: Contato,
});

function Contato() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", msg: "" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold md:text-4xl">Fale com a gente</h1>
      <p className="mt-2 text-muted-foreground">Respondemos em até 24h úteis.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Card icon={<MessageCircle className="h-5 w-5" />} t="WhatsApp" v="(11) 90000-0000" href="https://wa.me/5511900000000" />
        <Card icon={<Mail className="h-5 w-5" />} t="E-mail" v="oi@vagaja.com.br" href="mailto:oi@vagaja.com.br" />
        <Card icon={<MapPin className="h-5 w-5" />} t="Endereço" v="São Paulo, SP" />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true); }}
        className="mt-8 space-y-4 rounded-2xl border-2 border-border bg-card p-6 shadow-soft"
      >
        {sent ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-accent-foreground">
              <Check className="h-7 w-7" />
            </div>
            <p className="mt-3 font-extrabold">Mensagem enviada!</p>
            <p className="text-sm text-muted-foreground">A gente responde no e-mail informado.</p>
          </div>
        ) : (
          <>
            <Label l="Seu nome">
              <input required value={form.nome} maxLength={120} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="h-12 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary" />
            </Label>
            <Label l="E-mail">
              <input required type="email" value={form.email} maxLength={160} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-12 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary" />
            </Label>
            <Label l="Mensagem">
              <textarea required value={form.msg} maxLength={1000} rows={5} onChange={(e) => setForm({ ...form, msg: e.target.value })}
                className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary" />
            </Label>
            <button type="submit" className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground">
              <Send className="h-5 w-5" /> Enviar mensagem
            </button>
          </>
        )}
      </form>
    </div>
  );
}

function Card({ icon, t, v, href }: { icon: React.ReactNode; t: string; v: string; href?: string }) {
  const inner = (
    <>
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs font-bold uppercase">{t}</span></div>
      <p className="mt-1 font-bold">{v}</p>
    </>
  );
  return href
    ? <a href={href} className="block rounded-2xl border border-border bg-card p-5 hover:border-accent">{inner}</a>
    : <div className="rounded-2xl border border-border bg-card p-5">{inner}</div>;
}

function Label({ l, children }: { l: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">{l}</span>
      {children}
    </label>
  );
}
