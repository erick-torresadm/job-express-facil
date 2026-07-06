import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Send, Heart, Bell, ArrowRight, Sparkles, TrendingUp, MapPin, Gift, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { VagaCard, type VagaCardData } from "@/components/VagaCard";
import { Loader } from "@/components/candidato/panels";

export const Route = createFileRoute("/candidato/")({
  head: () => ({ meta: [{ title: "Painel — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: PainelHome,
});

type StatKey = "candidaturas" | "salvas" | "alertas";
type Stats = Record<StatKey, number>;

function PainelHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ candidaturas: 0, salvas: 0, alertas: 0 });
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState<string | null>(null);
  const [vagas, setVagas] = useState<VagaCardData[] | null>(null);
  const [ativasCand, setAtivasCand] = useState<number>(0);
  const [promoAte, setPromoAte] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<{ midia: boolean; whatsapp: boolean; cidade: boolean; sobre: boolean }>({
    midia: false, whatsapp: false, cidade: false, sobre: false,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: cv }, { count: c }, { count: f }, { count: a }, { count: ativas }] = await Promise.all([
        supabase.from("profiles").select("full_name, whatsapp, promo_pro_ate").eq("id", user.id).maybeSingle(),
        supabase.from("curriculos").select("cidade, video_url, audio_url, sobre").eq("user_id", user.id).maybeSingle(),
        supabase.from("candidaturas").select("id", { count: "exact", head: true }).eq("candidato_id", user.id),
        supabase.from("favoritos").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("alertas").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("candidaturas").select("id", { count: "exact", head: true })
          .eq("candidato_id", user.id)
          .in("status", ["enviado", "visto", "em_analise"]),
      ]);
      const profileRow = prof as { full_name?: string | null; whatsapp?: string | null; promo_pro_ate?: string | null } | null;
      const cvRow = cv as { cidade?: string | null; video_url?: string | null; audio_url?: string | null; sobre?: string | null } | null;
      setNome(profileRow?.full_name?.split(" ")[0] ?? "");
      setPromoAte(profileRow?.promo_pro_ate ?? null);
      const cid = cvRow?.cidade ?? null;
      setCidade(cid);
      setStats({ candidaturas: c ?? 0, salvas: f ?? 0, alertas: a ?? 0 });
      setAtivasCand(ativas ?? 0);
      setChecklist({
        midia: !!(cvRow?.video_url || cvRow?.audio_url),
        whatsapp: !!profileRow?.whatsapp,
        cidade: !!cid,
        sobre: !!(cvRow?.sobre && cvRow.sobre.length > 30),
      });

      let q = supabase.from("vagas")
        .select("id,titulo,empresa_nome,bairro,cidade,salario,profissao_slug,urgente,created_at")
        .eq("ativa", true)
        .lt("risco_fraude", 70)
        .order("urgente", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(6);
      if (cid) q = q.ilike("cidade", cid);
      const { data: rows } = await q;
      let recs = (rows ?? []) as VagaCardData[];
      if (recs.length === 0 && cid) {
        const { data: r2 } = await supabase.from("vagas")
          .select("id,titulo,empresa_nome,bairro,cidade,salario,profissao_slug,urgente,created_at")
          .eq("ativa", true).lt("risco_fraude", 70)
          .order("created_at", { ascending: false }).limit(6);
        recs = (r2 ?? []) as VagaCardData[];
      }
      setVagas(recs);
    })();
  }, [user]);


  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Boas-vindas */}
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 shadow-soft sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Bem-vindo{nome ? "," : ""}
        </p>
        <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
          {nome ? `Olá, ${nome} 👋` : "Olá! 👋"}
        </h2>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Aqui você acompanha suas candidaturas, salva vagas favoritas e recebe alertas quando algo novo aparece pra você
          {cidade ? ` em ${cidade}` : ""}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/candidato/vagas"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            <Sparkles className="h-4 w-4" /> Ver vagas pra você
          </Link>
          <Link to="/candidato/alertas"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold">
            <Bell className="h-4 w-4" /> Criar alerta
          </Link>
        </div>
      </section>

      {/* Métricas */}
      <section className="grid grid-cols-3 gap-3">
        <StatTile to="/candidato/candidaturas" icon={<Send className="h-4 w-4" />}
          label="Candidaturas ativas" value={ativasCand} total={stats.candidaturas} />
        <StatTile to="/candidato/salvas" icon={<Heart className="h-4 w-4" />}
          label="Vagas salvas" value={stats.salvas} />
        <StatTile to="/candidato/alertas" icon={<Bell className="h-4 w-4" />}
          label="Alertas ativos" value={stats.alertas} />
      </section>

      {/* Vagas recomendadas */}
      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <TrendingUp className="h-4 w-4 text-primary" /> Novas pra você
            </h2>
            {cidade && (
              <p className="text-xs text-muted-foreground">
                <MapPin className="mr-1 inline h-3 w-3" /> Recomendadas em {cidade}
              </p>
            )}
          </div>
          <Link to="/candidato/vagas"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
            Ver todas <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {vagas === null ? <Loader /> : vagas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma vaga aberta no momento. Crie um alerta para ser avisado.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {vagas.slice(0, 6).map((v) => (
              <VagaCard key={v.id} vaga={v} userId={user.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatTile({
  to, icon, label, value, total,
}: {
  to: "/candidato/candidaturas" | "/candidato/salvas" | "/candidato/alertas";
  icon: React.ReactNode; label: string; value: number; total?: number;
}) {
  return (
    <Link to={to}
      className="rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40 hover:shadow-pop">
      <div className="flex items-center gap-2 text-primary">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">{icon}</div>
      </div>
      <p className="mt-3 text-3xl font-black leading-none">{value}</p>
      {total != null && total !== value && (
        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          de {total} no total
        </p>
      )}
      <p className="mt-1 text-xs font-semibold text-muted-foreground">{label}</p>
    </Link>
  );
}
