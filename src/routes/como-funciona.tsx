import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, MapPin, Send, Briefcase } from "lucide-react";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona — Vaga Já" },
      { name: "description", content: "Em 4 passos você acha vaga perto de casa: profissão, bairro, currículo por áudio ou vídeo, e contato." },
    ],
  }),
  component: ComoFunciona,
});

const passos = [
  { icon: Briefcase, t: "1. Escolha sua profissão", d: "Pedreiro, doméstica, motorista, porteiro, ajudante — toque na sua área." },
  { icon: MapPin, t: "2. Diga onde mora", d: "Usamos GPS ou CEP pra achar vagas no seu bairro." },
  { icon: Mic, t: "3. Conte sobre você", d: "Grave áudio, vídeo ou pule. Tudo é opcional e leva 1 minuto." },
  { icon: Send, t: "4. Receba contato", d: "A empresa chama você no WhatsApp quando aprovar." },
];

function ComoFunciona() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-extrabold md:text-4xl">Como funciona</h1>
      <p className="mt-2 text-muted-foreground">Sem cadastro chato. Sem currículo no papel. Sem pagar nada.</p>

      <ol className="mt-8 space-y-4">
        {passos.map((p) => (
          <li key={p.t} className="flex gap-4 rounded-2xl border-2 border-border bg-card p-5 shadow-soft">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
              <p.icon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-extrabold">{p.t}</h2>
              <p className="text-sm text-muted-foreground">{p.d}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link to="/" className="btn-touch shadow-pop mt-8 flex items-center justify-center bg-accent text-accent-foreground">
        Começar agora
      </Link>
    </div>
  );
}
