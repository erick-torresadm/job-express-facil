import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Flame, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TrendItem = {
  profissao: string;
  profissao_slug: string;
  cidade: string;
  count: number;
  score: number;
};

/**
 * Menu dinâmico que ordena profissões/cidades por RELEVÂNCIA:
 * - Quantidade de vagas ativas (peso 1)
 * - Recência (vagas criadas nos últimos 7 dias têm peso 2x)
 * - Urgência (vagas marcadas urgente têm peso 1.5x)
 *
 * Atualiza sozinho a cada 5 minutos e roda um carrossel visual a cada 4s
 * destacando o item mais "quente" no momento.
 */
export function TrendingMenu() {
  const [items, setItems] = useState<TrendItem[]>([]);
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("vagas")
        .select("profissao, profissao_slug, cidade, created_at, urgente, ativa")
        .eq("ativa", true)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!active || !data) return;

      const map = new Map<string, TrendItem>();
      for (const v of data) {
        const key = `${v.profissao_slug}|${v.cidade}`;
        const recente = v.created_at && v.created_at > seteDiasAtras ? 2 : 1;
        const urg = v.urgente ? 1.5 : 1;
        const peso = recente * urg;
        const cur = map.get(key);
        if (cur) {
          cur.count += 1;
          cur.score += peso;
        } else {
          map.set(key, {
            profissao: v.profissao,
            profissao_slug: v.profissao_slug,
            cidade: v.cidade,
            count: 1,
            score: peso,
          });
        }
      }

      const ranked = Array.from(map.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);

      setItems(ranked);
    };

    load();
    const refresh = setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      setHighlight((h) => (h + 1) % items.length);
    }, 4000);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-[68px] z-20 px-3 md:top-[76px] md:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto rounded-full border border-border/40 bg-background/85 px-3 py-2 shadow-soft backdrop-blur-xl scrollbar-none">
        <div className="flex shrink-0 items-center gap-1.5 pr-2 text-xs font-bold uppercase tracking-wider text-accent">
          <TrendingUp className="h-3.5 w-3.5" />
          Em alta agora
        </div>
        <div className="flex items-center gap-1.5">
          {items.map((it, i) => {
            const slug = `${it.profissao_slug}-em-${it.cidade.toLowerCase().replace(/\s+/g, "-")}`;
            const isHot = i === highlight;
            return (
              <Link
                key={slug}
                to="/vagas/$slug"
                params={{ slug }}
                className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  isHot
                    ? "bg-gradient-to-r from-accent to-primary text-primary-foreground shadow-pop scale-[1.04]"
                    : "bg-secondary/70 text-foreground hover:bg-secondary"
                }`}
                title={`${it.count} vagas • ${it.profissao} em ${it.cidade}`}
              >
                {isHot && <Flame className="h-3.5 w-3.5" />}
                <span className="capitalize">{it.profissao}</span>
                <span className="opacity-70">• {it.cidade}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${isHot ? "bg-white/20" : "bg-background/80"}`}>
                  {it.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
