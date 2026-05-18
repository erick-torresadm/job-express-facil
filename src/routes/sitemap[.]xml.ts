import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://vagasagora.com.br";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/como-funciona", "/para-empresas", "/contato", "/blog", "/auth", "/cadastro", "/categorias", "/planos"];

        // Vagas: profissão × cidade
        const vagaPaths = PROFISSOES.flatMap((p) =>
          CIDADES.map((c) => `/vagas/${p.slug}-em-${c.toLowerCase().replace(/\s+/g, "-")}`)
        );

        // Profissionais anonimizados: profissão × cidade
        const profissionaisPaths = PROFISSOES.flatMap((p) =>
          CIDADES.map((c) => `/profissionais/${p.slug}-em-${c.toLowerCase().replace(/\s+/g, "-")}`)
        );

        let blogPaths: string[] = [];
        try {
          const { data } = await supabaseAdmin
            .from("posts")
            .select("slug")
            .eq("publicado", true);
          blogPaths = (data ?? []).map((p) => `/blog/${p.slug}`);
        } catch {}

        const urls = [...staticPaths, ...vagaPaths, ...profissionaisPaths, ...blogPaths]
          .map((path) => `  <url><loc>${BASE_URL}${path}</loc><changefreq>daily</changefreq></url>`)
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
