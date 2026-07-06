import { useEffect, useState } from "react";
import { Heart, Share2, Send, Check, Copy, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { VagaPublica } from "@/lib/vagas.functions";
import { notifyAdminsCandidatura } from "@/lib/admin-notify.functions";

export function VagaActions({ vaga, empresaId }: { vaga: VagaPublica; empresaId?: string }) {
  const { user, role } = useAuth();
  const [fav, setFav] = useState(false);
  const [candidatado, setCandidatado] = useState(false);
  const [showApply, setShowApply] = useState(false);

  // Bloqueia para empresas — só candidatos interagem
  const isCandidato = !user || role === "candidato";

  useEffect(() => {
    if (!user) return;
    supabase.from("favoritos").select("id").eq("user_id", user.id).eq("vaga_id", vaga.id).maybeSingle()
      .then(({ data }) => setFav(!!data));
    supabase.from("candidaturas").select("id").eq("candidato_id", user.id).eq("vaga_id", vaga.id).maybeSingle()
      .then(({ data }) => setCandidatado(!!data));
  }, [user, vaga.id]);

  const toggleFav = async () => {
    if (!user) {
      toast.info("Entre para salvar vagas");
      return;
    }
    if (!isCandidato) return;
    if (fav) {
      await supabase.from("favoritos").delete().eq("user_id", user.id).eq("vaga_id", vaga.id);
      setFav(false);
    } else {
      await supabase.from("favoritos").insert({ user_id: user.id, vaga_id: vaga.id });
      setFav(true);
      toast.success("Vaga salva");
    }
  };

  const compartilhar = async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/vagas/${vaga.profissao_slug}-em-${vaga.cidade.toLowerCase().replace(/\s+/g, "-")}`
      : "";
    const texto = `${vaga.titulo} • ${vaga.empresa_nome} • ${vaga.salario} • ${vaga.bairro}, ${vaga.cidade}\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: vaga.titulo, text: texto, url }); return; } catch { /* cancelado */ }
    }
    await navigator.clipboard.writeText(texto);
    toast.success("Link copiado");
  };

  if (!isCandidato) return null;

  return (
    <div className="mt-3 flex gap-2">
      <button onClick={() => (user ? setShowApply(true) : null)}
        disabled={candidatado}
        data-sound={candidatado ? "none" : "pop"}
        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-bold transition ${
          candidatado ? "bg-accent/20 text-accent" : "bg-accent text-accent-foreground hover:opacity-90"
        }`}>
        {candidatado ? <><Check className="h-4 w-4" /> Candidatura enviada</> : <><Send className="h-4 w-4" /> Candidatar-me</>}
      </button>
      {!user && (
        <Link to="/auth" className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-bold">
          Entrar
        </Link>
      )}
      <button onClick={toggleFav} title={fav ? "Remover" : "Salvar"}
        data-sound={fav ? "pop" : "like"}
        className={`grid h-10 w-10 place-items-center rounded-xl border border-border ${fav ? "bg-destructive/10 text-destructive" : "bg-card"}`}>
        <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
      </button>
      <button onClick={compartilhar} title="Compartilhar"
        className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card">
        <Share2 className="h-4 w-4" />
      </button>

      {showApply && user && (
        <ApplyModal vaga={vaga} empresaId={empresaId} userId={user.id}
          onClose={() => setShowApply(false)}
          onDone={() => { setCandidatado(true); setShowApply(false); }} />
      )}
    </div>
  );
}

function ApplyModal({ vaga, empresaId, userId, onClose, onDone }: {
  vaga: VagaPublica; empresaId?: string; userId: string;
  onClose: () => void; onDone: () => void;
}) {
  const [respostas, setRespostas] = useState<string[]>(() => vaga.perguntas_triagem.map(() => ""));
  const [loading, setLoading] = useState(false);
  const [semCV, setSemCV] = useState(false);

  const enviar = async () => {
    setLoading(true);
    try {
      const { data: cv } = await supabase.from("curriculos").select("id").eq("user_id", userId).maybeSingle();
      if (!cv) { setSemCV(true); setLoading(false); return; }

      // Limite diário anti-spam: 20/dia grátis, 35/dia se verificado
      const { data: prof } = await supabase.from("profiles").select("verificada").eq("id", userId).maybeSingle();
      const limite = prof?.verificada ? 35 : 20;
      const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0);
      const { count: usadasHoje } = await supabase
        .from("candidaturas")
        .select("id", { count: "exact", head: true })
        .eq("candidato_id", userId)
        .gte("created_at", inicioDia.toISOString());
      if ((usadasHoje ?? 0) >= limite) {
        toast.error(
          prof?.verificada
            ? `Você atingiu o limite de ${limite} candidaturas hoje. Tente amanhã!`
            : `Você atingiu o limite de ${limite} candidaturas hoje. Verifique sua conta pra liberar 35/dia.`
        );
        setLoading(false);
        return;
      }

      // pega empresa_id da vaga
      let empId = empresaId;
      if (!empId) {
        const { data: v } = await supabase.from("vagas").select("empresa_id").eq("id", vaga.id).maybeSingle();
        empId = v?.empresa_id;
      }
      if (!empId) throw new Error("Vaga sem empresa");

      const payload = vaga.perguntas_triagem.map((p, i) => ({ pergunta: p, resposta: respostas[i] ?? "" }));
      const { error } = await supabase.from("candidaturas").insert({
        vaga_id: vaga.id, candidato_id: userId, curriculo_id: cv.id, empresa_id: empId, respostas: payload,
      });
      if (error) throw error;
      toast.success(`Candidatura enviada! (${(usadasHoje ?? 0) + 1}/${limite} hoje)`);
      notifyAdminsCandidatura({
        data: { vagaTitulo: vaga.titulo, candidato: cv.nome ?? null },
      }).catch(() => null);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-pop" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-extrabold">Candidatar-se</h3>
        <p className="text-xs text-muted-foreground">{vaga.titulo} • {vaga.empresa_nome}</p>

        {semCV ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm">Você precisa de um currículo para se candidatar.</p>
            <Link to="/cadastro" className="block rounded-xl bg-accent px-4 py-3 text-center text-sm font-bold text-accent-foreground">
              🎤 Criar currículo em 1 minuto
            </Link>
          </div>
        ) : (
          <>
            {vaga.perguntas_triagem.length > 0 ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold uppercase text-muted-foreground">Pré-triagem rápida</p>
                {vaga.perguntas_triagem.map((p, i) => (
                  <div key={i}>
                    <label className="text-sm font-semibold">{p}</label>
                    <textarea value={respostas[i] ?? ""} onChange={(e) => {
                      const v = [...respostas]; v[i] = e.target.value; setRespostas(v);
                    }} rows={2}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2 text-sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">A empresa receberá seu currículo completo e poderá te chamar pelo WhatsApp.</p>
            )}
            <div className="mt-5 flex gap-2">
              <button onClick={onClose} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-bold">Cancelar</button>
              <button onClick={enviar} disabled={loading} className="flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground disabled:opacity-50">
                {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Enviar candidatura"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CopiarLinkVaga({ slug }: { slug: string }) {
  return (
    <button onClick={async () => {
      const url = `${window.location.origin}/vagas/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado");
    }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-bold">
      <Copy className="h-3.5 w-3.5" /> Copiar link
    </button>
  );
}
