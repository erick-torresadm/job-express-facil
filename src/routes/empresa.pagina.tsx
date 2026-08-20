import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { getEmpresaPagina, salvarEmpresaPagina, sugerirSlugEmpresa } from "@/lib/empresa.functions";
import { geocodificarEndereco } from "@/lib/intel.functions";
import { Copy, ExternalLink, Plus, Trash2, Save, MapPin, MessageCircle, Mail } from "lucide-react";
import { toast } from "sonner";

type CampoExtra = { label: string; tipo: "texto" | "numero" | "sim_nao"; obrigatorio: boolean };

export const Route = createFileRoute("/empresa/pagina")({
  head: () => ({ meta: [{ title: "Sua página de captação — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: EmpresaPaginaEditor,
});

function EmpresaPaginaEditor() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const fetchPagina = useServerFn(getEmpresaPagina);
  const salvar = useServerFn(salvarEmpresaPagina);
  const sugerir = useServerFn(sugerirSlugEmpresa);
  const geocodificar = useServerFn(geocodificarEndereco);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [slug, setSlug] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [sobre, setSobre] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [cor, setCor] = useState("#2563eb");
  const [campos, setCampos] = useState<CampoExtra[]>([]);
  const [raioKm, setRaioKm] = useState("20");
  const [endereco, setEndereco] = useState("");
  const [enderecoCidade, setEnderecoCidade] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocodificando, setGeocodificando] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { nav({ to: "/auth" }); return; }
    fetchPagina()
      .then(async (d) => {
        if (d) {
          setSlug(d.slug_publico ?? "");
          setCompanyName(d.company_name ?? "");
          setSobre(d.sobre ?? "");
          setLogoUrl(d.logo_url ?? "");
          setCor(d.cor_primaria ?? "#2563eb");
          setCampos((d.campos_extras as CampoExtra[]) ?? []);
          setRaioKm(d.raio_km_padrao != null ? String(d.raio_km_padrao) : "20");
          if (d.latitude != null && d.longitude != null) setCoords({ lat: d.latitude, lng: d.longitude });
          if (!d.slug_publico && d.company_name) {
            const s = await sugerir({ data: { nome: d.company_name } });
            setSlug(s.slug);
          }
        }
      })
      .finally(() => setCarregando(false));
  }, [loading, user, nav, fetchPagina, sugerir]);

  const linkPublico = slug ? `${typeof window !== "undefined" ? window.location.origin : ""}/c/${slug}` : "";

  async function handleSalvar() {
    setSalvando(true);
    try {
      await salvar({ data: {
        slug_publico: slug, company_name: companyName,
        sobre: sobre || null, logo_url: logoUrl || null,
        cor_primaria: cor || null, campos_extras: campos,
        raio_km_padrao: raioKm ? parseInt(raioKm, 10) : null,
        latitude: coords?.lat ?? null, longitude: coords?.lng ?? null,
      }});
      toast.success("Página salva! Compartilhe seu link.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally { setSalvando(false); }
  }

  async function handleGeocodificar() {
    if (!endereco.trim() || !enderecoCidade.trim()) {
      toast.error("Preencha endereço e cidade primeiro");
      return;
    }
    setGeocodificando(true);
    try {
      const r = await geocodificar({ data: { endereco: endereco.trim(), cidade: enderecoCidade.trim() } });
      if (r.latitude == null || r.longitude == null) {
        toast.error("Não encontramos esse endereço. Tente ser mais específico.");
        return;
      }
      setCoords({ lat: r.latitude, lng: r.longitude });
      toast.success("Localização encontrada! Não esqueça de salvar.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao localizar endereço");
    } finally { setGeocodificando(false); }
  }

  function copiar() {
    navigator.clipboard.writeText(linkPublico);
    toast.success("Link copiado!");
  }

  if (carregando) return <p className="p-8 text-muted-foreground">Carregando…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 lg:p-8">
      <header>
        <Link to="/empresa" className="text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>
        <h1 className="mt-2 text-2xl font-extrabold">Sua página de captação</h1>
        <p className="text-sm text-muted-foreground">
          Página com a cara da sua empresa (logo, cores). Ótima pra indicação: se alguém do seu time quer indicar
          uma pessoa, é só mandar esse link por WhatsApp ou e-mail — ela aplica direto, sem sair da sua marca.
        </p>
      </header>

      {slug && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 break-all text-sm">{linkPublico}</code>
            <button onClick={copiar} className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold">
              <Copy className="h-3 w-3" /> Copiar
            </button>
            <a href={linkPublico} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
              <ExternalLink className="h-3 w-3" /> Abrir
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Vaga aberta na ${companyName || "nossa empresa"}! Se conhece alguém, é só clicar e se candidatar: ${linkPublico}`)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Compartilhar no WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(`Vaga aberta na ${companyName || "nossa empresa"}`)}&body=${encodeURIComponent(`Vaga aberta! Se conhece alguém interessado, é só clicar no link e se candidatar:\n\n${linkPublico}`)}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold"
            >
              <Mail className="h-3.5 w-3.5" /> Compartilhar por e-mail
            </a>
          </div>
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-bold">Identidade visual</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Link personalizado (slug)" hint="só letras, números e hifens">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">vagasagora.com.br/c/</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm" />
            </div>
          </Field>
          <Field label="Nome da empresa">
            <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
          </Field>
          <Field label="URL do logo (.png, .jpg)">
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..."
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
          </Field>
          <Field label="Cor primária">
            <input type="color" value={cor} onChange={(e) => setCor(e.target.value)}
              className="h-10 w-20 rounded-xl border border-border bg-background" />
          </Field>
        </div>
        <Field label="Texto de boas-vindas / sobre a empresa">
          <textarea value={sobre} onChange={(e) => setSobre(e.target.value)} rows={4} maxLength={2000}
            placeholder="Conte rapidamente sobre sua empresa, valores, o que oferece…"
            className="w-full rounded-xl border border-border bg-background p-3 text-sm" />
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Perguntas extras no formulário</h2>
          <button onClick={() => setCampos((c) => c.length < 8 ? [...c, { label: "", tipo: "texto", obrigatorio: false }] : c)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-bold">
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>
        {campos.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma pergunta extra. Adicione até 8 (ex: CNH, turno, experiência).</p>}
        {campos.map((c, i) => (
          <div key={i} className="grid items-center gap-2 lg:grid-cols-[1fr_140px_120px_40px]">
            <input value={c.label} onChange={(e) => setCampos((arr) => arr.map((x, ix) => ix === i ? { ...x, label: e.target.value } : x))}
              placeholder="Pergunta (ex: Tem CNH?)"
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm" />
            <select value={c.tipo}
              onChange={(e) => setCampos((arr) => arr.map((x, ix) => ix === i ? { ...x, tipo: e.target.value as CampoExtra["tipo"] } : x))}
              className="h-10 rounded-xl border border-border bg-background px-2 text-sm">
              <option value="texto">Texto</option>
              <option value="numero">Número</option>
              <option value="sim_nao">Sim/Não</option>
            </select>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={c.obrigatorio}
                onChange={(e) => setCampos((arr) => arr.map((x, ix) => ix === i ? { ...x, obrigatorio: e.target.checked } : x))} />
              Obrigatório
            </label>
            <button onClick={() => setCampos((arr) => arr.filter((_, ix) => ix !== i))}
              className="rounded-lg border border-destructive/30 p-2 text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <div>
          <h2 className="font-bold">Alcance geográfico</h2>
          <p className="text-xs text-muted-foreground">
            Define até onde suas vagas aparecem quando alguém busca "perto de mim". Vagas fora desse raio não aparecem pra quem tá longe — só candidatos que realmente conseguem chegar até você.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Endereço (rua, número, bairro)">
            <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Ex: Av. Paulista, 1000"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
          </Field>
          <Field label="Cidade">
            <input value={enderecoCidade} onChange={(e) => setEnderecoCidade(e.target.value)} placeholder="Ex: São Paulo"
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={handleGeocodificar} disabled={geocodificando}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold disabled:opacity-50">
            <MapPin className="h-3.5 w-3.5" /> {geocodificando ? "Localizando…" : "Localizar endereço"}
          </button>
          {coords && (
            <span className="text-xs font-semibold text-primary">✓ Localização encontrada</span>
          )}
        </div>
        <Field label="Raio padrão de alcance (km)" hint="Aplicado a todas as vagas. Cada vaga pode ter seu próprio raio ao cadastrar.">
          <input type="number" min={1} max={500} value={raioKm} onChange={(e) => setRaioKm(e.target.value)}
            className="h-10 w-32 rounded-xl border border-border bg-background px-3 text-sm" />
        </Field>
      </section>

      <button onClick={handleSalvar} disabled={salvando || !slug || !companyName}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-primary-foreground disabled:opacity-50">
        <Save className="h-4 w-4" /> {salvando ? "Salvando…" : "Salvar página"}
      </button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-muted-foreground">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <div className="mt-1">{children}</div>
    </div>
  );
}
