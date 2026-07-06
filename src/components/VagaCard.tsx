import { Link } from "@tanstack/react-router";
import { Heart, MapPin, ExternalLink, Clock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export type VagaCardData = {
  id: string;
  titulo: string;
  empresa_nome: string;
  bairro?: string | null;
  cidade?: string | null;
  salario?: string | null;
  profissao_slug?: string | null;
  urgente?: boolean | null;
  created_at?: string | null;
  jaCandidatou?: boolean;
  jaSalva?: boolean;
};

function slugCidade(cidade?: string | null) {
  return (cidade ?? "sao-paulo").toLowerCase().replace(/\s+/g, "-");
}

function isNova(created_at?: string | null) {
  if (!created_at) return false;
  return Date.now() - new Date(created_at).getTime() < 24 * 60 * 60 * 1000;
}

export function VagaCard({
  vaga,
  userId,
  onSalvaToggle,
}: {
  vaga: VagaCardData;
  userId?: string;
  onSalvaToggle?: (novoEstado: boolean) => void;
}) {
  const [salva, setSalva] = useState(!!vaga.jaSalva);
  const [busy, setBusy] = useState(false);
  const slug =
    vaga.profissao_slug && vaga.cidade
      ? `${vaga.profissao_slug}-em-${slugCidade(vaga.cidade)}`
      : null;
  const inicial = (vaga.empresa_nome || "V").slice(0, 1).toUpperCase();

  const toggleSalvar = async () => {
    if (!userId) {
      toast.info("Entre para salvar vagas");
      return;
    }
    setBusy(true);
    try {
      if (salva) {
        await supabase.from("favoritos").delete().eq("user_id", userId).eq("vaga_id", vaga.id);
        setSalva(false);
        onSalvaToggle?.(false);
      } else {
        await supabase.from("favoritos").insert({ user_id: userId, vaga_id: vaga.id });
        setSalva(true);
        onSalvaToggle?.(true);
        toast.success("Salva na sua lista");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:border-primary/40 hover:shadow-pop">
      <header className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-extrabold text-primary">
          {inicial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-tight">{vaga.titulo}</h3>
            <button
              onClick={toggleSalvar}
              disabled={busy}
              aria-label={salva ? "Remover das salvas" : "Salvar vaga"}
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
                salva
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-primary"
              }`}
            >
              <Heart className={`h-4 w-4 ${salva ? "fill-current" : ""}`} />
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {vaga.empresa_nome}
            {vaga.bairro || vaga.cidade ? (
              <>
                <span className="mx-1">·</span>
                <MapPin className="mr-0.5 inline h-3 w-3" />
                {vaga.bairro ? `${vaga.bairro}, ` : ""}
                {vaga.cidade}
              </>
            ) : null}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        {vaga.salario && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
            {vaga.salario}
          </span>
        )}
        {vaga.urgente && (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            <Clock className="h-3 w-3" /> Urgente
          </span>
        )}
        {isNova(vaga.created_at) && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
            <Sparkles className="h-3 w-3" /> Nova
          </span>
        )}
      </div>

      <footer className="mt-auto flex items-center justify-between gap-2">
        {vaga.jaCandidatou ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-accent/20 px-3 py-1.5 text-[11px] font-bold text-accent-foreground">
            ✓ Candidatura enviada
          </span>
        ) : slug ? (
          <Link
            to="/vagas/$slug"
            params={{ slug }}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
          >
            Ver e candidatar <ExternalLink className="h-3 w-3" />
          </Link>
        ) : null}
      </footer>
    </article>
  );
}
