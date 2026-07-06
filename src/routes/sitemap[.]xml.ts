import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://vagasagora.com.br";

function slugifyCidade(c: string) {
  return c.toLowerCase().replace(/\s+/g, "-");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().split("T")[0];

        const staticPaths = [
          "/", "/como-funciona", "/para-empresas", "/contato",
          "/blog", "/categorias", "/planos", "/termos", "/privacidade",
        ];

        // Vagas facetadas (profissão × cidade)
        const vagaPaths = PROFISSOES.flatMap((p) =>
          CIDADES.map((c) => `/vagas/${p.slug}-em-${slugifyCidade(c)}`)
        );
        const profissionaisPaths = PROFISSOES.flatMap((p) =>
          CIDADES.map((c) => `/profissionais/${p.slug}-em-${slugifyCidade(c)}`)
        );

        // Vagas reais ativas → para JobPosting indexável
        type Entry = { path: string; lastmod?: string };
        const dynamic: Entry[] = [];

        try {
          const { data: vagas } = await supabaseAdmin
            .from("vagas")
            .select("profissao_slug, cidade, updated_at")
            .eq("ativa", true)
            .order("updated_at", { ascending: false })
            .limit(5000);
          for (const v of vagas ?? []) {
            dynamic.push({
              path: `/vagas/${v.profissao_slug}-em-${slugifyCidade(v.cidade)}`,
              lastmod: v.updated_at?.split("T")[0],
            });
          }
        } catch {}

        try {
          const { data: posts } = await supabaseAdmin
            .from("posts")
            .select("slug, updated_at")
            .eq("publicado", true);
          for (const p of posts ?? []) {
            dynamic.push({ path: `/blog/${p.slug}`, lastmod: p.updated_at?.split("T")[0] });
          }
        } catch {}

        // Dedup por path (vagas reais sobrescrevem facetadas com lastmod)
        const map = new Map<string, Entry>();
        for (const p of staticPaths) map.set(p, { path: p, lastmod: today });
        for (const p of vagaPaths) map.set(p, { path: p });
        for (const p of profissionaisPaths) map.set(p, { path: p });
        for (const e of dynamic) map.set(e.path, e);

        const urls = Array.from(map.values())
          .map((e) =>
            [
              `  <url>`,
              `    <loc>${BASE_URL}${e.path}</loc>`,
              e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
              `    <changefreq>daily</changefreq>`,
              `  </url>`,
            ].filter(Boolean).join("\n"),
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
