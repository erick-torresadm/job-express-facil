import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Flame, Trash2, Eye, EyeOff, PlusSquare, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/empresa/minhas-vagas")({
  head: () => ({ meta: [{ title: "Minhas vagas — Vaga Já" }, { name: "robots", content: "noindex" }] }),
  component: MinhasVagas,
});

type Vaga = {
  id: string;
  titulo: string;
  empresa_nome: string;
  salario: string;
  horario: string;
  bairro: string;
  cidade: string;
  urgente: boolean;
  ativa: boolean;
  created_at: string;
};

function MinhasVagas() {
  const { user, loading: authLoading } = useAuth();
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("vagas")
      .select("id,titulo,empresa_nome,salario,horario,bairro,cidade,urgente,ativa,created_at")
      .eq("empresa_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message);
        setVagas((data ?? []) as Vaga[]);
        setLoading(false);
      });
  }, [user]);

  const toggleAtiva = async (v: Vaga) => {
    const novo = !v.ativa;
    setVagas((prev) => prev.map((x) => (x.id === v.id ? { ...x, ativa: novo } : x)));
    await supabase.from("vagas").update({ ativa: novo }).eq("id", v.id);
  };

  const excluir = async (id: string) => {
    if (!confirm("Excluir esta vaga?")) return;
    setVagas((prev) => prev.filter((v) => v.id !== id));
    await supabase.from("vagas").delete().eq("id", id);
    toast.success("Vaga removida");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/empresa" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Minhas vagas</h1>
          <p className="text-sm text-muted-foreground">{vagas.length} vaga(s) publicada(s)</p>
        </div>
        <Link to="/empresa/nova-vaga" className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
          <PlusSquare className="h-4 w-4" /> Nova vaga
        </Link>
      </div>

      {authLoading || loading ? (
        <div className="mt-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : vagas.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Você ainda não publicou nenhuma vaga.</p>
          <Link to="/empresa/nova-vaga" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            Publicar a primeira vaga
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {vagas.map((v) => (
            <li key={v.id} className={`rounded-2xl border border-border bg-card p-4 shadow-soft ${!v.ativa ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold leading-tight">{v.titulo}</h3>
                    {v.urgente && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-extrabold uppercase text-destructive-foreground">
                        <Flame className="h-3 w-3" /> Urgente
                      </span>
                    )}
                    {!v.ativa && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase">Pausada</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.salario} • {v.horario} • {v.bairro}, {v.cidade}
                  </p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">
                    Publicada em {new Date(v.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button onClick={() => toggleAtiva(v)} title={v.ativa ? "Pausar" : "Ativar"}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-secondary">
                    {v.ativa ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => excluir(v.id)} title="Excluir"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
