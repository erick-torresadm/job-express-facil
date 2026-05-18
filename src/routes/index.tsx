import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Mic, Camera, MapPin, Volume2, Square, Sparkles, Check,
  Briefcase, Building2, ArrowLeft, Zap, FileDown,
} from "lucide-react";
import { PROFISSOES } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vaga Já — Achei seu emprego no bairro em 3 toques" },
      { name: "description", content: "Cadastre seu currículo em 1 minuto por áudio ou foto e receba vagas de pedreiro, doméstica, motorista, porteiro e ajudante perto de você. Grátis." },
      { property: "og:title", content: "Vaga Já — Emprego perto de você, sem complicação" },
      { property: "og:description", content: "Gravou áudio, achou vaga. Cadastro em 3 toques pra trabalhador de verdade." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Vaga Já",
        url: "/",
        potentialAction: {
          "@type": "SearchAction",
          target: "/vagas/{search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    }],
  }),
  component: CandidatoFlow,
});

type Step = "profissao" | "local" | "curriculo" | "perfil";

function CandidatoFlow() {
  const [step, setStep] = useState<Step>("profissao");
  const [profissao, setProfissao] = useState<string | null>(null);
  const [local, setLocal] = useState<{ bairro: string; cidade: string } | null>(null);
  const [audio, setAudio] = useState<{ duration: number } | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <Progress step={step} />
        {step === "profissao" && (
          <StepProfissao onPick={(p) => { setProfissao(p); setStep("local"); }} />
        )}
        {step === "local" && (
          <StepLocal onBack={() => setStep("profissao")} onDone={(l) => { setLocal(l); setStep("curriculo"); }} />
        )}
        {step === "curriculo" && (
          <StepCurriculo onBack={() => setStep("local")} onDone={(a) => { setAudio(a); setStep("perfil"); }} />
        )}
        {step === "perfil" && profissao && local && (
          <StepPerfil profissao={profissao} local={local} audioDur={audio?.duration ?? 47} />
        )}
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground shadow-pop">
            <Briefcase className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <p className="text-base font-extrabold">Vaga Já</p>
            <p className="text-[11px] text-muted-foreground">Emprego perto de você</p>
          </div>
        </Link>
        <Link to="/empresa" className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
          <Building2 className="h-3.5 w-3.5" /> Sou empresa
        </Link>
      </div>
    </header>
  );
}

function Progress({ step }: { step: Step }) {
  const order: Step[] = ["profissao", "local", "curriculo", "perfil"];
  const idx = order.indexOf(step);
  return (
    <div className="mb-6 flex gap-1.5">
      {order.map((s, i) => (
        <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function Narrator({ text }: { text: string }) {
  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "pt-BR"; u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };
  return (
    <button onClick={speak} aria-label="Ouvir instruções"
      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
      <Volume2 className="h-3.5 w-3.5" /> Ouvir
    </button>
  );
}

function StepProfissao({ onPick }: { onPick: (id: string) => void }) {
  const instr = "Toque na profissão que você trabalha.";
  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">O que você faz?</h1>
        <Narrator text={instr} />
      </div>
      <p className="mb-5 text-sm text-muted-foreground">Toque na sua área de trabalho.</p>
      <div className="grid grid-cols-2 gap-3">
        {PROFISSOES.map((p) => (
          <button key={p.id} onClick={() => onPick(p.nome)}
            className="btn-touch flex flex-col items-center justify-center gap-2 border-2 border-border bg-card p-4 text-card-foreground hover:border-accent hover:bg-accent/5">
            <span className="text-4xl">{p.emoji}</span>
            <span className="text-center text-base leading-tight">{p.nome}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function StepLocal({ onBack, onDone }: { onBack: () => void; onDone: (l: { bairro: string; cidade: string }) => void }) {
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState(false);
  const [cep, setCep] = useState("");

  const useGps = () => {
    setLoading(true);
    setTimeout(() => {
      onDone({ bairro: "Tatuapé", cidade: "São Paulo" });
    }, 1200);
  };

  return (
    <section>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Onde você mora?</h1>
        <Narrator text="Toque no botão verde para encontrar vagas perto de você." />
      </div>
      <p className="mb-5 text-sm text-muted-foreground">Vamos buscar vagas no seu bairro.</p>

      <button onClick={useGps} disabled={loading}
        className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-accent px-6 text-accent-foreground disabled:opacity-70">
        <MapPin className="h-6 w-6" />
        {loading ? "Procurando seu bairro…" : "Encontrar vagas perto de mim"}
      </button>

      {!manual ? (
        <button onClick={() => setManual(true)} className="mt-4 w-full text-sm text-muted-foreground underline">
          Não quero usar localização — digitar CEP
        </button>
      ) : (
        <div className="mt-5 space-y-3">
          <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="Digite seu CEP ou cidade"
            className="h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg outline-none focus:border-primary" />
          <button onClick={() => onDone({ bairro: "Centro", cidade: "São Paulo" })}
            disabled={cep.length < 3}
            className="btn-touch w-full bg-primary text-primary-foreground disabled:opacity-50">
            Continuar
          </button>
        </div>
      )}
    </section>
  );
}

function StepCurriculo({ onBack, onDone }: { onBack: () => void; onDone: (a: { duration: number }) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const start = () => {
    setRecording(true); setSeconds(0);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s >= 60) { stop(); return 60; }
        return s + 1;
      });
    }, 1000);
  };
  const stop = () => {
    setRecording(false); setDone(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const send = () => onDone({ duration: seconds || 47 });

  const instr = "Aperte no microfone verde e fale por 1 minuto contando onde você já trabalhou.";

  return (
    <section>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Conte sobre você</h1>
        <Narrator text={instr} />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">Grave um áudio falando suas experiências, ou tire foto de um currículo de papel.</p>

      <div className="rounded-3xl border-2 border-border bg-card p-6 text-center shadow-soft">
        <p className="mb-4 text-sm font-medium">Aperte e fale por até 1 minuto</p>
        <button onClick={recording ? stop : start}
          className={`mx-auto grid h-28 w-28 place-items-center rounded-full transition-all ${
            recording ? "bg-destructive text-destructive-foreground animate-pulse shadow-pop" : "bg-accent text-accent-foreground shadow-pop active:scale-95"
          }`} aria-label={recording ? "Parar gravação" : "Gravar áudio"}>
          {recording ? <Square className="h-10 w-10" fill="currentColor" /> : <Mic className="h-12 w-12" />}
        </button>
        <p className="mt-4 font-mono text-2xl font-bold tabular-nums">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
        </p>
        {done && (
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent">
            <Check className="h-4 w-4" /> Áudio gravado
          </p>
        )}
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OU <div className="h-px flex-1 bg-border" />
      </div>

      <button className="btn-touch flex w-full items-center justify-center gap-3 border-2 border-border bg-card">
        <Camera className="h-6 w-6" />
        Tirar foto do meu currículo de papel
      </button>

      {done && (
        <button onClick={send}
          className="btn-touch shadow-pop mt-6 flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground">
          <Sparkles className="h-5 w-5" /> Processar com IA
        </button>
      )}
    </section>
  );
}

function StepPerfil({ profissao, local, audioDur }: { profissao: string; local: { bairro: string; cidade: string }; audioDur: number }) {
  return (
    <section>
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-accent to-accent/70 p-6 text-accent-foreground shadow-pop">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/30 px-3 py-1 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" /> IA processou seu áudio
        </div>
        <h1 className="text-2xl font-extrabold">Pronto, José!</h1>
        <p className="text-sm opacity-90">Áudio de {audioDur}s transformado em currículo.</p>
      </div>

      <div className="space-y-3 rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
        <Field label="Nome" value="José Almeida da Silva" />
        <Field label="Telefone" value="(11) 98765-4321" />
        <Field label="Onde mora" value={`${local.bairro}, ${local.cidade}`} />
        <Field label="Profissão" value={profissao} />
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Experiências</p>
          <ul className="space-y-1 text-sm">
            <li>• 12 anos como pedreiro de acabamento</li>
            <li>• Trabalhou na Construtora MRV (5 anos)</li>
            <li>• Sabe assentar piso, reboco e pintura</li>
          </ul>
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-lg font-extrabold">Turbine seu perfil 🚀</h2>

      <div className="space-y-3">
        <Upsell
          icon={<FileDown className="h-7 w-7" />}
          title="Currículo profissional em PDF"
          desc="Baixe e mande no WhatsApp ou imprima pra entregar de porta em porta."
          price="R$ 9,90"
          cta="Gerar PDF no Pix"
          variant="primary"
        />
        <Upsell
          icon={<Zap className="h-7 w-7" />}
          title="Furar fila"
          desc="Seu perfil aparece no TOPO das buscas das empresas por 7 dias."
          price="R$ 4,90"
          cta="Furar fila agora"
          variant="accent"
          badge="MAIS VENDIDO"
        />
      </div>

      <Link to="/vagas/$slug" params={{ slug: "pedreiro-em-sao-paulo" }}
        className="btn-touch mt-6 flex w-full items-center justify-center bg-secondary text-secondary-foreground">
        Ver vagas pra mim →
      </Link>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  );
}

function Upsell({ icon, title, desc, price, cta, variant, badge }: {
  icon: React.ReactNode; title: string; desc: string; price: string; cta: string;
  variant: "primary" | "accent"; badge?: string;
}) {
  const bg = variant === "accent" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground";
  return (
    <div className="relative rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
      {badge && (
        <span className="absolute -top-2 right-4 rounded-full bg-warning px-3 py-1 text-[10px] font-extrabold text-warning-foreground">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${bg}`}>{icon}</div>
        <div className="flex-1">
          <h3 className="font-extrabold">{title}</h3>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-2xl font-extrabold">{price}</p>
        <button className={`rounded-full px-5 py-3 text-sm font-bold ${bg} shadow-pop active:scale-95`}>{cta}</button>
      </div>
    </div>
  );
}
