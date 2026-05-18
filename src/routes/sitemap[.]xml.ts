import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PROFISSOES, CIDADES } from "@/lib/mock-data";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = ["/", "/empresa"];
        // Programmatic SEO: profissão × cidade combinations
        const dynamicPaths = PROFISSOES.flatMap((p) =>
          CIDADES.map((c) => `/vagas/${p.slug}-em-${c.toLowerCase().replace(/\s+/g, "-")}`)
        );

        const urls = [...staticPaths, ...dynamicPaths]
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
