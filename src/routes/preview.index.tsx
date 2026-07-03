import { createFileRoute, Link } from "@tanstack/react-router";

const OPTIONS = [
  { slug: "blank", nome: "Blank UI", desc: "Minimalismo radical, tipografia mono, muito espaço em branco." },
  { slug: "lukacho", nome: "Lukacho UI", desc: "Neo-brutalismo, cores vibrantes, bordas grossas, sombras hard." },
  { slug: "sprrrint", nome: "Sprrrint", desc: "Tipografia display gigante, kinetic type, blocos ousados." },
  { slug: "skiper", nome: "Skiper UI", desc: "Glassmorphism, gradientes suaves, micro-interações elegantes." },
  { slug: "animmaster", nome: "AnimMaster / Animata", desc: "Cards animados, gradientes shader, movimento constante." },
];

export const Route = createFileRoute("/preview/")({
  head: () => ({ meta: [{ title: "Preview de estilos — VagasAgora" }, { name: "robots", content: "noindex" }] }),
  component: PreviewIndex,
});

function PreviewIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-bold text-foreground">Preview de estilos</h1>
      <p className="mt-3 text-muted-foreground">
        Cada rota abaixo é uma versão da landing do VagasAgora em uma linguagem visual diferente. A landing original permanece intacta em <code className="rounded bg-muted px-1.5 py-0.5">/</code>.
      </p>
      <ul className="mt-10 grid gap-4">
        {OPTIONS.map((o) => (
          <li key={o.slug}>
            <Link
              to="/preview/$style"
              params={{ style: o.slug }}
              className="block rounded-2xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-lg"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold text-foreground">{o.nome}</h2>
                <span className="text-sm text-primary">/preview/{o.slug} →</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
