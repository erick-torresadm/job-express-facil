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

const sizeByFormat: Record<Format, string> = {
  banner: "min-h-[90px] md:min-h-[120px]",
  card: "min-h-[180px]",
  inline: "min-h-[100px]",
  sidebar: "min-h-[250px]",
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
    if (!ad) return;
    supabase.rpc("noop").then(() => {}).catch(() => {});
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

  // Nada para mostrar → não ocupa espaço
  if (loaded && !ad && !adsenseEnabled) return null;

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
      ) : null}
    </aside>
  );
}
