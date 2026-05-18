import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPaginaPublica, enviarCurriculoEmpresa } from "@/lib/empresa.functions";
import { Building2, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

type CampoExtra = { label: string; tipo: "texto" | "numero" | "sim_nao"; obrigatorio: boolean };
type Pagina = Awaited<ReturnType<typeof getPaginaPublica>>;

export const Route = createFileRoute("/c/$slug")({
  loader: async ({ params }) => {
    const data = await getPaginaPublica({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const nome = loaderData?.empresa.company_name ?? "Empresa";
    return {
      meta: [
        { title: `Trabalhe na ${nome} — VagasAgora` },
        { name: "description", content: `Envie seu currículo direto para ${nome}. Vagas abertas e cadastro em 2 minutos.` },
        { property: "og:title", content: `Trabalhe na ${nome}` },
        { property: "og:description", content: `Envie seu currículo direto para ${nome}.` },
      ],
    };
  },
  component: PaginaPublicaEmpresa,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center p-8 text-center">
      <div>
        <h1 className="text-2xl font-extrabold">Página não encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Voltar ao início</Link>
      </div>
    </div>
  ),
});

function PaginaPublicaEmpresa() {
  const data = Route.useLoaderData() as NonNullable<Pagina>;
  const { empresa, vagas } = data;
  const cor = empresa.cor_primaria || "#2563eb";
  const camposExtras = (empresa.campos_extras as CampoExtra[]) ?? [];
  const enviar = useServerFn(enviarCurriculoEmpresa);
  const nav = useNavigate();

  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [profissao, setProfissao] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [resumo, setResumo] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      await enviar({ data: {
        slug: empresa.slug_publico!, nome, whatsapp, profissao,
        bairro: bairro || null, cidade: cidade || null, resumo,
        respostas_extras: extras,
      }});
      toast.success("Currículo enviado! Em breve a empresa entrará em contato.");
      nav({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar");
    } finally { setEnviando(false); }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b" style={{ background: cor, color: "white" }}>
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-6">
          {empresa.logo_url ? (
            <img src={empresa.logo_url} alt={empresa.company_name ?? ""} className="h-16 w-16 rounded-xl bg-white object-contain p-1" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/20">
              <Building2 className="h-8 w-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold leading-tight">{empresa.company_name}</h1>
              {empresa.verificada && <VerifiedBadge size="md" />}
            </div>
            <p className="text-sm opacity-80">Trabalhe com a gente • Envie seu currículo grátis</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-4">
        {empresa.sobre && (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 font-bold">Sobre a empresa</h2>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{empresa.sobre}</p>
          </section>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold">Envie seu currículo</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            <In label="Nome completo *" v={nome} on={setNome} req />
            <In label="WhatsApp *" v={whatsapp} on={setWhatsapp} req placeholder="(11) 9 0000-0000" />
            <In label="Profissão *" v={profissao} on={setProfissao} req placeholder="Ex: Pedreiro" />
            <In label="Bairro" v={bairro} on={setBairro} />
            <In label="Cidade" v={cidade} on={setCidade} />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Resumo / experiência *</label>
            <textarea required value={resumo} onChange={(e) => setResumo(e.target.value)} rows={4} minLength={10} maxLength={2000}
              className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm" />
          </div>

          {camposExtras.map((c) => (
            <div key={c.label}>
              <label className="text-xs font-bold uppercase text-muted-foreground">
                {c.label} {c.obrigatorio && "*"}
              </label>
              {c.tipo === "sim_nao" ? (
                <select required={c.obrigatorio} value={extras[c.label] ?? ""}
                  onChange={(e) => setExtras((x) => ({ ...x, [c.label]: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm">
                  <option value="">Selecione…</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              ) : (
                <input required={c.obrigatorio} type={c.tipo === "numero" ? "number" : "text"}
                  value={extras[c.label] ?? ""} maxLength={500}
                  onChange={(e) => setExtras((x) => ({ ...x, [c.label]: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
              )}
            </div>
          ))}

          <button type="submit" disabled={enviando}
            style={{ background: cor }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white disabled:opacity-50">
            <Send className="h-4 w-4" /> {enviando ? "Enviando…" : "Enviar currículo"}
          </button>
        </form>

        {vagas.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-bold">Vagas abertas</h2>
            {vagas.map((v) => (
              <Link key={v.id} to="/vagas/$slug" params={{ slug: `${v.profissao_slug}-em-${v.cidade.toLowerCase().replace(/\s+/g, "-")}` }}
                className="block rounded-2xl border border-border bg-card p-4 hover:border-primary">
                <h3 className="font-bold">{v.titulo}</h3>
                <p className="text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />{v.bairro}, {v.cidade} • {v.salario} • {v.horario}
                </p>
              </Link>
            ))}
          </section>
        )}

        <footer className="py-6 text-center text-xs text-muted-foreground">
          Página criada com <Link to="/" className="font-bold text-primary">VagasAgora</Link>
        </footer>
      </main>
    </div>
  );
}

function In({ label, v, on, req, placeholder }: { label: string; v: string; on: (s: string) => void; req?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
      <input required={req} value={v} onChange={(e) => on(e.target.value)} placeholder={placeholder} maxLength={120}
        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
    </div>
  );
}
