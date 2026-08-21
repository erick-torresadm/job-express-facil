import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
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
          "/", "/vagas", "/vagas/clt", "/vagas/pj", "/vagas/estagio",
          "/como-funciona", "/para-empresas", "/contato",
          "/blog", "/categorias", "/planos", "/termos", "/privacidade",
          "/freelas",
        ];

        // Só entram no sitemap combinações profissão×cidade com conteúdo real
        // (vaga ativa ou profissional cadastrado). Antes gerávamos o produto
        // cartesiano cego (profissões × cidades, milhares de URLs vazias) —
        // isso inflava o site com páginas finas/duplicadas e o Google passou
        // a ignorar nossa tag canônica em ~470 delas (Search Console).
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
          const { data: profissionais } = await supabaseAdmin
            .from("curriculos")
            .select("profissao, cidade, updated_at")
            .not("cidade", "is", null)
            .limit(5000);
          const seen = new Set<string>();
          for (const p of profissionais ?? []) {
            if (!p.profissao || !p.cidade) continue;
            const slug = p.profissao.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
            const path = `/profissionais/${slug}-em-${slugifyCidade(p.cidade)}`;
            if (seen.has(path)) continue;
            seen.add(path);
            dynamic.push({ path, lastmod: p.updated_at?.split("T")[0] });
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

        // Páginas de captação das empresas (/c/{slug}) — toda vaga nova
        // publicada aparece automaticamente ali, então precisam ser
        // encontráveis pelo Google como qualquer outra página do site.
        try {
          const { data: empresas } = await supabaseAdmin
            .from("profiles")
            .select("slug_publico, updated_at")
            .not("slug_publico", "is", null);
          for (const e of empresas ?? []) {
            if (!e.slug_publico) continue;
            dynamic.push({ path: `/c/${e.slug_publico}`, lastmod: e.updated_at?.split("T")[0] });
          }
        } catch {}

        // Perfis públicos de freelancers (/freelas/p/{handle}) — conteúdo
        // criado pelos próprios usuários, também precisa ser indexável.
        try {
          const { data: freelas } = await supabaseAdmin
            .from("freelancers")
            .select("handle, updated_at")
            .eq("ativo", true)
            .not("handle", "is", null)
            .limit(5000);
          for (const f of freelas ?? []) {
            if (!f.handle) continue;
            dynamic.push({ path: `/freelas/p/${f.handle}`, lastmod: f.updated_at?.split("T")[0] });
          }
        } catch {}

        const map = new Map<string, Entry>();
        for (const p of staticPaths) map.set(p, { path: p, lastmod: today });
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
