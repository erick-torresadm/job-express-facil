import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import BlankLanding from "@/preview/BlankLanding";
import LukachoLanding from "@/preview/LukachoLanding";
import SprrrintLanding from "@/preview/SprrrintLanding";
import SkiperLanding from "@/preview/SkiperLanding";
import AnimMasterLanding from "@/preview/AnimMasterLanding";

const MAP: Record<string, { title: string; Comp: () => React.ReactElement }> = {
  blank: { title: "Blank UI", Comp: BlankLanding },
  lukacho: { title: "Lukacho UI", Comp: LukachoLanding },
  sprrrint: { title: "Sprrrint", Comp: SprrrintLanding },
  skiper: { title: "Skiper UI", Comp: SkiperLanding },
  animmaster: { title: "AnimMaster", Comp: AnimMasterLanding },
};

export const Route = createFileRoute("/preview/$style")({
  loader: ({ params }) => {
    if (!MAP[params.style]) throw notFound();
    return { style: params.style };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `Preview: ${MAP[loaderData.style].title}` : "Preview" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StylePage,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <div className="p-10 text-center">
      <p>Estilo não encontrado.</p>
      <Link to="/preview" className="text-primary underline">Voltar</Link>
    </div>
  );
}

function StylePage() {
  const { style } = Route.useLoaderData();
  const { Comp, title } = MAP[style];
  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur">
        <Link to="/preview" className="text-sm text-muted-foreground hover:text-foreground">← Todos os estilos</Link>
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Preview · {title}</span>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Original →</Link>
      </div>
      <Comp />
    </div>
  );
}
