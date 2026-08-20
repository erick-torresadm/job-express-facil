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

  const aspect = aspectByPlacement[placement] ?? aspectByFormat[format];
  const hasImage = !!ad?.imagem_url;

  // Sem anúncio real e sem AdSense configurado: não renderiza nada
  // (era um banner "Anuncie aqui" antes — removido a pedido, poluía o site).
  if (!ad && !adsenseEnabled) return null;

  return (
    <aside
      aria-label="Publicidade"
      className={cn(
        "relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg",
        // Sem borda/fundo quando há imagem — evita "moldura branca".
        hasImage ? "bg-transparent" : "border border-border/40 bg-muted/20",
        aspect,
        className,
      )}
    >
      {!hasImage && (
        <span className="pointer-events-none absolute right-2 top-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Publicidade
        </span>
      )}


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
      ) : (
        <ins
          className="adsbygoogle block h-full w-full"
          style={{ display: "block" }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={adsenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </aside>
  );
}
