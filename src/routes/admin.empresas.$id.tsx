import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Briefcase, FileText, Activity, Settings, ShieldCheck, Send, Eye, MousePointerClick,
  MapPin, Phone, Code, Calendar, Building2, Crown, Loader2, Save,
} from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/AdminShell";
import {
  getEmpresaDetail, getEmpresaVagas, getEmpresaCandidaturas, getEmpresaAtividade,
  getAssinaturaAdmin, salvarAssinaturaAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/empresas/$id")({
  head: () => ({ meta: [{ title: "Empresa — Admin" }, { name: "robots", content: "noindex" }] }),
  component: EmpresaDetail,
});

type TabType = "vagas" | "candidaturas" | "atividade" | "configuracao";

function EmpresaDetail() {
  const { id } = Route.useParams();
  const [tab, setTab] = useState<TabType>("vagas");

  const fetchDetail = useServerFn(getEmpresaDetail);
  const fetchVagas = useServerFn(getEmpresaVagas);
  const fetchCandidaturas = useServerFn(getEmpresaCandidaturas);
  const fetchAtividade = useServerFn(getEmpresaAtividade);

  const { data: empresa, isLoading: loadingDetail, isError: errorDetail, error: detailError } = useQuery({
    queryKey: ["admin-empresa-detail", id],
    queryFn: () => fetchDetail({ data: { id } }),
    retry: false,
  });

  const { data: vagas, isLoading: loadingVagas } = useQuery({
    queryKey: ["admin-empresa-vagas", id],
    queryFn: () => fetchVagas({ data: { id } }),
    enabled: tab === "vagas",
  });

  const { data: candidaturas, isLoading: loadingCandidaturas } = useQuery({
    queryKey: ["admin-empresa-candidaturas", id],
    queryFn: () => fetchCandidaturas({ data: { id } }),
    enabled: tab === "candidaturas",
  });

  const { data: atividade, isLoading: loadingAtividade } = useQuery({
    queryKey: ["admin-empresa-atividade", id],
    queryFn: () => fetchAtividade({ data: { id } }),
    enabled: tab === "atividade",
  });

  if (errorDetail) {
    return (
      <AdminShell title="Erro">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-bold text-destructive">Não foi possível carregar esta empresa.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {detailError instanceof Error ? detailError.message : "Erro desconhecido."}
          </p>
        </div>
      </AdminShell>
    );
  }

  if (loadingDetail || !empresa) {
    return (
      <AdminShell title="Carregando...">
        <div className="h-96 animate-pulse rounded-2xl border border-border bg-card" />
      </AdminShell>
    );
  }

  return (
    <AdminShell title={empresa.company_name || "Empresa"}>
      {/* Header */}
      <div className="mb-6 rounded-2xl border border-border bg-gradient-to-r from-primary/10 to-accent/10 p-6">
        <div className="flex items-start gap-4">
          {empresa.logo_url && (
            <img src={empresa.logo_url ?? ""} alt={empresa.company_name ?? ""} className="h-16 w-16 rounded-lg object-cover" />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold">{empresa.company_name}</h1>
              {empresa.verificada && <ShieldCheck className="h-5 w-5 text-accent" />}
            </div>
            {empresa.sobre && <p className="mt-2 text-sm text-muted-foreground">{empresa.sobre}</p>}
            {empresa.slug_publico && (
              <p className="mt-2 text-xs text-muted-foreground">
                Link público: <code className="bg-secondary px-2 py-1 rounded">{empresa.slug_publico}</code>
              </p>
            )}
          </div>
          {empresa.cor_primaria && (
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="h-12 w-12 rounded-lg border-2 border-border"
                style={{ backgroundColor: empresa.cor_primaria }}
              />
              <p className="text-xs font-mono text-muted-foreground">{empresa.cor_primaria}</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-border">
        {(["vagas", "candidaturas", "atividade", "configuracao"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "vagas" && <Briefcase className="h-4 w-4" />}
            {t === "candidaturas" && <Send className="h-4 w-4" />}
            {t === "atividade" && <Activity className="h-4 w-4" />}
            {t === "configuracao" && <Settings className="h-4 w-4" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "vagas" && <VagasTab vagas={vagas} isLoading={loadingVagas} />}
      {tab === "candidaturas" && <CandidaturasTab candidaturas={candidaturas} isLoading={loadingCandidaturas} />}
      {tab === "atividade" && <AtividadeTab atividade={atividade} isLoading={loadingAtividade} />}
      {tab === "configuracao" && <ConfiguracaoTab empresa={empresa} empresaId={id} />}
    </AdminShell>
  );
}

function VagasTab({ vagas, isLoading }: { vagas?: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;

  if (!vagas || vagas.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
        <p className="text-muted-foreground">Nenhuma vaga encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vagas.map((vaga) => (
        <div key={vaga.id} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground">{vaga.titulo}</h3>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
                  vaga.status ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {vaga.status ? "Ativa" : "Pausada"}
                </span>
                <span>{new Date(vaga.created_at).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-xl font-bold text-foreground">{vaga.candidaturas_total}</p>
                <p className="text-[10px] text-muted-foreground">Candidaturas</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" /> {vaga.visualizacoes ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Vistas</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-2">
                <p className="text-xl font-bold text-foreground flex items-center justify-center gap-1">
                  <MousePointerClick className="h-3 w-3" /> {vaga.cliques ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground">Cliques</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidaturasTab({ candidaturas, isLoading }: { candidaturas?: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;

  if (!candidaturas || candidaturas.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Send className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
        <p className="text-muted-foreground">Nenhuma candidatura encontrada.</p>
      </div>
    );
  }

  const statusColor = (status: string) => {
    switch (status) {
      case "enviado": return "bg-primary/10 text-primary";
      case "visto": return "bg-accent/10 text-accent";
      case "em_analise": return "bg-warning/10 text-warning";
      case "rejeitado": return "bg-destructive/10 text-destructive";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Candidato</th>
            <th className="hidden px-4 py-3 md:table-cell">Profissão</th>
            <th className="px-4 py-3">Status</th>
            <th className="hidden px-4 py-3 md:table-cell">Data</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidaturas.map((c) => (
            <tr key={c.id} className="hover:bg-secondary/40">
              <td className="px-4 py-3">
                <p className="truncate font-bold">{c.nome_candidato}</p>
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                {c.profissao_candidato}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusColor(c.status)}`}>
                  {c.status.replace("_", " ")}
                </span>
              </td>
              <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                {new Date(c.created_at).toLocaleDateString("pt-BR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AtividadeTab({ atividade, isLoading }: { atividade?: any[]; isLoading: boolean }) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />;

  if (!atividade || atividade.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <Activity className="mx-auto h-12 w-12 text-muted-foreground/30 mb-2" />
        <p className="text-muted-foreground">Nenhuma atividade encontrada.</p>
      </div>
    );
  }

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "nova_vaga": return <Briefcase className="h-4 w-4" />;
      case "candidatura": return <Send className="h-4 w-4" />;
      case "atualizacao_perfil": return <Building2 className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-2">
      {atividade.map((item, idx) => (
        <div key={idx} className="flex gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
          <div className="mt-1 grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground shrink-0">
            {getIcon(item.tipo)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{item.titulo}</p>
            {item.descricao && <p className="text-xs text-muted-foreground truncate">{item.descricao}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(item.timestamp).toLocaleDateString("pt-BR", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConfiguracaoTab({ empresa, empresaId }: { empresa: any; empresaId: string }) {
  return (
    <div className="space-y-4">
      <PlanoCard empresaId={empresaId} />

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-bold text-foreground">Informações de Contato</h3>
        <div className="space-y-3">
          <ConfigItem icon={<Phone className="h-4 w-4" />} label="WhatsApp" value={empresa.whatsapp ?? "—"} />
          <ConfigItem icon={<Code className="h-4 w-4" />} label="CNPJ" value={empresa.cnpj ?? "—"} />
          {empresa.email && <ConfigItem icon={<Send className="h-4 w-4" />} label="E-mail" value={empresa.email} />}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-bold text-foreground">Localização</h3>
        <div className="space-y-3">
          <ConfigItem icon={<MapPin className="h-4 w-4" />} label="Raio padrão (km)" value={empresa.raio_km_padrao?.toString() ?? "—"} />
          <ConfigItem icon={<MapPin className="h-4 w-4" />} label="Latitude" value={empresa.latitude?.toFixed(6) ?? "—"} />
          <ConfigItem icon={<MapPin className="h-4 w-4" />} label="Longitude" value={empresa.longitude?.toFixed(6) ?? "—"} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-4 font-bold text-foreground">Metadados</h3>
        <div className="space-y-3">
          <ConfigItem icon={<Calendar className="h-4 w-4" />} label="Data de cadastro" value={new Date(empresa.created_at).toLocaleDateString("pt-BR")} />
          <ConfigItem icon={<ShieldCheck className="h-4 w-4" />} label="Status" value={empresa.verificada ? "Verificada" : "Não verificada"} />
        </div>
      </div>
    </div>
  );
}

function PlanoCard({ empresaId }: { empresaId: string }) {
  const qc = useQueryClient();
  const fetchAssinatura = useServerFn(getAssinaturaAdmin);
  const salvar = useServerFn(salvarAssinaturaAdmin);

  const { data: assinatura, isLoading } = useQuery({
    queryKey: ["admin-assinatura", empresaId],
    queryFn: () => fetchAssinatura({ data: { id: empresaId } }),
  });

  const [plano, setPlano] = useState<"basico" | "full">("basico");
  const [ciclo, setCiclo] = useState<"mensal" | "anual">("mensal");
  const [status, setStatus] = useState<"pendente" | "ativa" | "atrasada" | "cancelada">("ativa");
  const [valor, setValor] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!assinatura) return;
    setPlano(assinatura.plano as "basico" | "full");
    setCiclo(assinatura.ciclo as "mensal" | "anual");
    setStatus(assinatura.status as typeof status);
    setValor(assinatura.valor != null ? String(assinatura.valor) : "");
    setVencimento(assinatura.proximo_vencimento ?? "");
  }, [assinatura]);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await salvar({
        data: {
          empresaId,
          plano,
          ciclo,
          status,
          valor: valor ? parseFloat(valor) : null,
          proximoVencimento: vencimento || null,
        },
      });
      toast.success("Plano atualizado! A empresa já tem os benefícios liberados.");
      qc.invalidateQueries({ queryKey: ["admin-assinatura", empresaId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar plano");
    } finally {
      setSalvando(false);
    }
  };

  if (isLoading) return <div className="h-48 animate-pulse rounded-2xl border border-border bg-card" />;

  return (
    <div className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-6">
      <h3 className="mb-1 flex items-center gap-2 font-bold text-foreground">
        <Crown className="h-4 w-4 text-accent" /> Plano / Assinatura
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Ative ou ajuste o plano manualmente pra empresas que pagaram por fora da plataforma. Assinatura "ativa" libera contatos ilimitados na hora.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Plano</span>
          <select value={plano} onChange={(e) => setPlano(e.target.value as typeof plano)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2">
            <option value="basico">Básico</option>
            <option value="full">Full</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Ciclo</span>
          <select value={ciclo} onChange={(e) => setCiclo(e.target.value as typeof ciclo)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2">
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2">
            <option value="ativa">Ativa</option>
            <option value="pendente">Pendente</option>
            <option value="atrasada">Atrasada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Valor pago (R$, opcional)</span>
          <input type="number" min={0} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)}
            placeholder="Ex: 82.40" className="w-full rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block text-xs font-bold uppercase text-muted-foreground">Próximo vencimento (opcional)</span>
          <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2" />
        </label>
      </div>
      <button onClick={handleSalvar} disabled={salvando}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-accent-foreground disabled:opacity-50">
        {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {salvando ? "Salvando…" : "Salvar plano"}
      </button>
    </div>
  );
}

function ConfigItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-secondary/30 p-3">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="truncate text-right font-mono text-sm" title={value}>{value}</p>
    </div>
  );
}
