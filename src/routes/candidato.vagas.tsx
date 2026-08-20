import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { VagaCard, type VagaCardData } from "@/components/VagaCard";
import { Loader } from "@/components/candidato/panels";

export const Route = createFileRoute("/candidato/vagas")({
  head: () => ({ meta: [{ title: "Vagas pra você — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: VagasParaVoce,
});

function VagasParaVoce() {
  const { user } = useAuth();
  const [vagas, setVagas] = useState<VagaCardData[] | null>(null);
  const [q, setQ] = useState("");
  const [cidade, setCidade] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [candidaturasIds, setCandidaturasIds] = useState<Set<string>>(new Set());
  const [salvasIds, setSalvasIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: cands }, { data: favs }] = await Promise.all([
        supabase.from("candidaturas").select("vaga_id").eq("candidato_id", user.id),
        supabase.from("favoritos").select("vaga_id").eq("user_id", user.id),
      ]);
      setCandidaturasIds(new Set((cands ?? []).map((c) => c.vaga_id as string)));
      setSalvasIds(new Set((favs ?? []).map((f) => f.vaga_id as string)));
    })();
  }, [user]);

  useEffect(() => {
    (async () => {
      setVagas(null);
      let query = supabase.from("vagas")
        .select("id,titulo,empresa_nome,bairro,cidade,salario,profissao_slug,urgente,created_at")
        .eq("ativa", true)
        .lt("risco_fraude", 70)
        .order("urgente", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(60);
      if (q.trim()) query = query.or(`titulo.ilike.%${q}%,empresa_nome.ilike.%${q}%,profissao.ilike.%${q}%`);
      if (cidade.trim()) query = query.ilike("cidade", `%${cidade}%`);
      if (urgente) query = query.eq("urgente", true);
      const { data } = await query;
      setVagas((data ?? []) as VagaCardData[]);
    })();
  }, [q, cidade, urgente]);

  const activeFilters = [
    q && { k: "q", label: `"${q}"`, clear: () => setQ("") },
    cidade && { k: "cidade", label: cidade, clear: () => setCidade("") },
    urgente && { k: "urg", label: "Urgente", clear: () => setUrgente(false) },
  ].filter(Boolean) as { k: string; label: string; clear: () => void }[];

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="rounded-2xl border border-border bg-card p-3 shadow-soft sm:p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por profissão ou empresa"
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm" />
          </label>
          <input value={cidade} onChange={(e) => setCidade(e.target.value)}
            placeholder="Cidade"
            className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm" />
          <button onClick={() => setUrgente((u) => !u)}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-bold transition ${
              urgente ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
            }`}>
            <Filter className="h-3.5 w-3.5" /> Urgente
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeFilters.map((f) => (
              <button key={f.k} onClick={f.clear}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
                {f.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {vagas === null ? <Loader /> : vagas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm font-bold">Nenhuma vaga encontrada</p>
          <p className="mt-1 text-xs text-muted-foreground">Tente remover filtros ou crie um alerta para ser avisado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vagas.map((v) => (
            <VagaCard key={v.id} vaga={{
              ...v,
              jaCandidatou: candidaturasIds.has(v.id),
              jaSalva: salvasIds.has(v.id),
            }} userId={user.id} />
          ))}
        </div>
      )}
    </div>
  );
}
