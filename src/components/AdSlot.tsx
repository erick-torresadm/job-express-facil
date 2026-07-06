import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type Anuncio = {
  id: string;
  titulo: string | null;
  imagem_url: string | null;
  link_url: string | null;
  html_custom: string | null;
};

type Format = "banner" | "card" | "inline" | "sidebar";

interface AdSlotProps {
  placement: string;
  format?: Format;
  className?: string;
  /** Slot do Google AdSense (data-ad-slot) caso queira fallback */
  adsenseSlot?: string;
}

const ADSENSE_CLIENT = ""; // ex.: "ca-pub-XXXXXXXXXXXXXXXX" — preencher quando ativar

// Aspect ratios alinhados aos tamanhos recomendados em /admin/anuncios
// para evitar bordas/letterbox quando a imagem tem proporção certa.
const aspectByPlacement: Record<string, string> = {
  home_meio: "aspect-[4/1]",
  home_inferior: "aspect-[4/1]",
  vagas_lista_topo: "aspect-[970/250]",
  blog_topo: "aspect-[728/90]",
  blog_post_fim: "aspect-[6/5]",
  rodape: "aspect-[10/1]",
};

const aspectByFormat: Record<Format, string> = {
  banner: "aspect-[6/1] sm:aspect-[8/1]",
  card: "aspect-[3/2]",
  inline: "aspect-[5/1]",
  sidebar: "aspect-[4/5]",
};


export function AdSlot({ placement, format = "banner", className, adsenseSlot }: AdSlotProps) {
  const [ad, setAd] = useState<Anuncio | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from("anuncios")
        .select("id, titulo, imagem_url, link_url, html_custom")
        .eq("placement", placement)
        .eq("ativo", true)
        .order("prioridade", { ascending: false })
        .limit(5);
      if (!mounted) return;
      if (data && data.length > 0) {
        const pick = data[Math.floor(Math.random() * data.length)];
        setAd(pick);
        // Conta impressão (best-effort, ignora erro)
        supabase
          .from("anuncios")
          .update({ impressoes: (pick as any).impressoes ? undefined : undefined })
          .eq("id", pick.id)
          .then(() => {});
      }
      setLoaded(true);
    })();
    return () => {
      mounted = false;
    };
  }, [placement]);

  const handleClick = () => {
    // Hook futuro p/ contar cliques via server fn
  };


  const adsenseEnabled = useMemo(() => ADSENSE_CLIENT && adsenseSlot, [adsenseSlot]);

  useEffect(() => {
    if (loaded && !ad && adsenseEnabled) {
      try {
        // @ts-expect-error adsense global
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }
  }, [loaded, ad, adsenseEnabled]);

  return (
    <aside
      aria-label="Publicidade"
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border/40 bg-muted/20",
        sizeByFormat[format],
        className,
      )}
    >
      <span className="pointer-events-none absolute right-2 top-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
        Publicidade
      </span>

      {ad ? (
        ad.html_custom ? (
          <div className="h-full w-full p-2" dangerouslySetInnerHTML={{ __html: ad.html_custom }} />
        ) : (
          <a
            href={ad.link_url ?? "#"}
            target="_blank"
            rel="nofollow sponsored noopener"
            onClick={handleClick}
            className="flex h-full w-full items-center"
          >
            {ad.imagem_url ? (
              <img
                src={ad.imagem_url}
                alt={ad.titulo ?? "Anúncio"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-sm font-medium text-foreground">
                {ad.titulo}
              </div>
            )}
          </a>
        )
      ) : adsenseEnabled ? (
        <ins
          className="adsbygoogle block h-full w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adsenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Fallback: banner "Anuncie aqui". O número de WhatsApp NÃO fica no
        // HTML — o /anuncie faz redirect server-side para o wa.me.
        <a
          href="/anuncie"
          rel="nofollow"
          className="group flex h-full w-full items-center justify-between gap-3 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 px-4 py-3 transition hover:from-primary/20 hover:to-primary/20"
        >
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-foreground md:text-base">
              📣 Anuncie aqui
            </span>
            <span className="text-[11px] text-muted-foreground md:text-xs">
              Fale com a gente no WhatsApp e apareça pra milhares de pessoas.
            </span>
          </div>
          <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-pop group-hover:scale-105">
            Quero anunciar
          </span>
        </a>
      )}
    </aside>
  );
}
