import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Mic, Camera, MapPin, Volume2, Square, Check, Video,
  Briefcase, Building2, ArrowLeft, Zap, FileDown, Send, SkipForward, Loader2,
} from "lucide-react";
import { PROFISSOES } from "@/lib/mock-data";
import { analisarCandidato, type PerfilGerado } from "@/lib/ai.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vaga Já — Achei seu emprego no bairro em 3 toques" },
      { name: "description", content: "Cadastre seu currículo em 1 minuto por áudio, vídeo ou foto e receba vagas de pedreiro, doméstica, motorista, porteiro e ajudante perto de você. Grátis." },
      { property: "og:title", content: "Vaga Já — Emprego perto de você, sem complicação" },
      { property: "og:description", content: "Gravou áudio ou vídeo, achou vaga. Cadastro em 3 toques pra trabalhador de verdade." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: CandidatoFlow,
});

type Step = "profissao" | "local" | "curriculo" | "contato" | "perfil";
type Midia = { tipo: "audio" | "video"; duracao: number } | null;
type Contato = { nome: string; email: string; whatsapp: string };

function CandidatoFlow() {
  const [step, setStep] = useState<Step>("profissao");
  const [profissao, setProfissao] = useState<string | null>(null);
  const [local, setLocal] = useState<{ bairro: string; cidade: string } | null>(null);
  const [midia, setMidia] = useState<Midia>(null);
  const [contato, setContato] = useState<Contato | null>(null);

  return (
    <div className="bg-background">
      <main className="mx-auto max-w-md px-4 pb-24 pt-4">
        <Progress step={step} />
        {step === "profissao" && (
          <StepProfissao onPick={(p) => { setProfissao(p); setStep("local"); }} />
        )}
        {step === "local" && (
          <StepLocal onBack={() => setStep("profissao")} onDone={(l) => { setLocal(l); setStep("curriculo"); }} />
        )}
        {step === "curriculo" && (
          <StepCurriculo
            onBack={() => setStep("local")}
            onDone={(m) => { setMidia(m); setStep("contato"); }}
          />
        )}
        {step === "contato" && (
          <StepContato onBack={() => setStep("curriculo")} onDone={(c) => { setContato(c); setStep("perfil"); }} />
        )}
        {step === "perfil" && profissao && local && contato && (
          <StepPerfil profissao={profissao} local={local} midia={midia} contato={contato} />
        )}
      </main>
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  const order: Step[] = ["profissao", "local", "curriculo", "contato", "perfil"];
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
    setTimeout(() => onDone({ bairro: "Tatuapé", cidade: "São Paulo" }), 1200);
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

function StepCurriculo({ onBack, onDone }: { onBack: () => void; onDone: (m: Midia) => void }) {
  const [modo, setModo] = useState<"escolher" | "audio" | "video">("escolher");

  if (modo === "audio") return <GravadorAudio onBack={() => setModo("escolher")} onDone={(d) => onDone({ tipo: "audio", duracao: d })} />;
  if (modo === "video") return <GravadorVideo onBack={() => setModo("escolher")} onDone={(d) => onDone({ tipo: "video", duracao: d })} />;

  return (
    <section>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Conte sobre você</h1>
        <Narrator text="Você pode gravar um áudio, um vídeo de até 1 minuto, ou pular esta etapa." />
      </div>
      <p className="mb-6 text-sm text-muted-foreground">Escolha como quer contar suas experiências. Tudo é opcional.</p>

      <div className="space-y-3">
        <button onClick={() => setModo("audio")}
          className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-accent text-accent-foreground">
          <Mic className="h-6 w-6" /> Gravar áudio
        </button>
        <button onClick={() => setModo("video")}
          className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-primary text-primary-foreground">
          <Video className="h-6 w-6" /> Gravar vídeo (até 1 min)
        </button>
        <button className="btn-touch flex w-full items-center justify-center gap-3 border-2 border-border bg-card">
          <Camera className="h-6 w-6" /> Tirar foto do meu currículo
        </button>
        <button onClick={() => onDone(null)}
          className="btn-touch flex w-full items-center justify-center gap-2 text-muted-foreground">
          <SkipForward className="h-5 w-5" /> Pular esta etapa
        </button>
      </div>
    </section>
  );
}

function GravadorAudio({ onBack, onDone }: { onBack: () => void; onDone: (s: number) => void }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      mr.start();
      setRecording(true); setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => { if (s >= 60) { stop(); return 60; } return s + 1; });
      }, 1000);
    } catch (e) {
      const err = e as { name?: string };
      setError(err.name === "NotAllowedError" ? "Permita o microfone nas configurações do navegador." : "Não foi possível acessar o microfone.");
    }
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false); setDone(true);
  };

  return (
    <section>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <h1 className="mb-1 text-2xl font-extrabold">Gravar áudio</h1>
      <p className="mb-6 text-sm text-muted-foreground">Aperte e fale por até 1 minuto sobre suas experiências.</p>

      <div className="rounded-3xl border-2 border-border bg-card p-6 text-center shadow-soft">
        <button onClick={recording ? stop : start}
          className={`mx-auto grid h-28 w-28 place-items-center rounded-full transition-all ${
            recording ? "bg-destructive text-destructive-foreground animate-pulse shadow-pop" : "bg-accent text-accent-foreground shadow-pop active:scale-95"
          }`} aria-label={recording ? "Parar gravação" : "Gravar áudio"}>
          {recording ? <Square className="h-10 w-10" fill="currentColor" /> : <Mic className="h-12 w-12" />}
        </button>
        <p className="mt-4 font-mono text-2xl font-bold tabular-nums">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
        </p>
        {done && <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent"><Check className="h-4 w-4" /> Áudio gravado</p>}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      {done && (
        <button onClick={() => onDone(seconds)}
          className="btn-touch shadow-pop mt-6 flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground">
          <Send className="h-5 w-5" /> Usar este áudio
        </button>
      )}
    </section>
  );
}

function GravadorVideo({ onBack, onDone }: { onBack: () => void; onDone: (s: number) => void }) {
  const [stage, setStage] = useState<"idle" | "preview" | "recording" | "done">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setPreviewUrl(URL.createObjectURL(blob));
        setStage("done");
      };
      mr.start();
      setStage("recording");
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => { if (s >= 60) { stop(); return 60; } return s + 1; });
      }, 1000);
    } catch (e) {
      const err = e as { name?: string };
      setError(err.name === "NotAllowedError" ? "Permita a câmera nas configurações do navegador." : err.name === "NotFoundError" ? "Câmera não encontrada." : "Não foi possível acessar a câmera.");
      setStage("idle");
    }
  };

  const stop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  return (
    <section>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <h1 className="mb-1 text-2xl font-extrabold">Gravar vídeo</h1>
      <p className="mb-6 text-sm text-muted-foreground">Até 1 minuto contando suas experiências. Olhe para a câmera e fale natural.</p>

      <div className="overflow-hidden rounded-3xl border-2 border-border bg-black shadow-soft">
        {stage === "done" && previewUrl ? (
          <video src={previewUrl} controls playsInline className="aspect-[3/4] w-full bg-black object-cover" />
        ) : (
          <video ref={videoRef} muted playsInline className="aspect-[3/4] w-full bg-black object-cover" />
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="font-mono text-2xl font-bold tabular-nums">
          {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")} <span className="text-sm font-normal text-muted-foreground">/ 01:00</span>
        </p>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <div className="mt-5">
        {stage === "idle" && (
          <button onClick={start} className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-primary text-primary-foreground">
            <Video className="h-6 w-6" /> Começar gravação
          </button>
        )}
        {stage === "recording" && (
          <button onClick={stop} className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-destructive text-destructive-foreground">
            <Square className="h-5 w-5" fill="currentColor" /> Parar gravação
          </button>
        )}
        {stage === "done" && (
          <div className="space-y-3">
            <button onClick={() => { setStage("idle"); setSeconds(0); setPreviewUrl(null); }}
              className="btn-touch w-full border-2 border-border bg-card">
              Regravar
            </button>
            <button onClick={() => onDone(seconds)}
              className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground">
              <Send className="h-5 w-5" /> Usar este vídeo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function StepContato({ onBack, onDone }: { onBack: () => void; onDone: (c: Contato) => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const submit = () => {
    setErro(null);
    const n = nome.trim(); const e = email.trim(); const w = whatsapp.replace(/\D/g, "");
    if (n.length < 2) return setErro("Digite seu nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return setErro("Digite um e-mail válido.");
    if (w.length < 10 || w.length > 11) return setErro("Digite um WhatsApp válido com DDD.");
    onDone({ nome: n, email: e, whatsapp: w });
  };

  return (
    <section>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Como falamos com você?</h1>
        <Narrator text="Digite seu nome, e-mail e WhatsApp para a empresa entrar em contato." />
      </div>
      <p className="mb-5 text-sm text-muted-foreground">A empresa vai chamar você no WhatsApp quando aprovar.</p>

      <div className="space-y-4">
        <Campo label="Seu nome">
          <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} placeholder="Ex: José Almeida"
            className="h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg outline-none focus:border-primary" />
        </Campo>
        <Campo label="WhatsApp (com DDD)">
          <input value={whatsapp} onChange={(e) => setWhatsapp(formatPhone(e.target.value))} inputMode="tel" placeholder="(11) 98765-4321"
            className="h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg outline-none focus:border-primary" />
        </Campo>
        <Campo label="E-mail">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" maxLength={160} placeholder="seuemail@exemplo.com"
            className="h-14 w-full rounded-2xl border-2 border-border bg-card px-4 text-lg outline-none focus:border-primary" />
        </Campo>

        {erro && <p className="text-sm font-medium text-destructive">{erro}</p>}

        <button onClick={submit}
          className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground">
          <Send className="h-5 w-5" /> Finalizar cadastro
        </button>
      </div>
    </section>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StepPerfil({ profissao, local, midia, contato }: {
  profissao: string;
  local: { bairro: string; cidade: string };
  midia: Midia;
  contato: Contato;
}) {
  const [perfil, setPerfil] = useState<PerfilGerado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const p = await analisarCandidato({
          data: {
            nome: contato.nome,
            email: contato.email,
            whatsapp: contato.whatsapp,
            profissao,
            bairro: local.bairro,
            cidade: local.cidade,
            temAudio: midia?.tipo === "audio",
            temVideo: midia?.tipo === "video",
            duracaoSegundos: midia?.duracao ?? 0,
          },
        });
        if (!cancel) setPerfil(p);
      } catch (e) {
        if (!cancel) setErro(e instanceof Error ? e.message : "Erro ao gerar perfil");
      }
    })();
    return () => { cancel = true; };
  }, [contato, profissao, local, midia]);

  if (!perfil && !erro) {
    return (
      <section className="py-12 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
        <p className="mt-4 text-lg font-bold">Montando seu currículo…</p>
        <p className="text-sm text-muted-foreground">Leva uns segundos.</p>
      </section>
    );
  }

  if (erro && !perfil) {
    return (
      <section className="space-y-4">
        <div className="rounded-2xl border-2 border-destructive/30 bg-destructive/5 p-5">
          <p className="font-bold text-destructive">Não conseguimos gerar seu perfil agora</p>
          <p className="mt-1 text-sm text-muted-foreground">{erro}</p>
        </div>
        <button onClick={() => router.invalidate()}
          className="btn-touch w-full bg-primary text-primary-foreground">Tentar de novo</button>
      </section>
    );
  }

  const p = perfil!;
  const dur = midia?.duracao ?? 0;

  return (
    <section>
      <div className="mb-4 rounded-3xl bg-gradient-to-br from-accent to-accent/70 p-6 text-accent-foreground shadow-pop">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-background/30 px-3 py-1 text-xs font-bold">
          <Check className="h-3.5 w-3.5" /> Currículo pronto
        </div>
        <h1 className="text-2xl font-extrabold">Pronto, {contato.nome.split(" ")[0]}!</h1>
        <p className="text-sm opacity-90">{p.resumo}</p>
      </div>

      <div className="space-y-3 rounded-3xl border-2 border-border bg-card p-5 shadow-soft">
        <Field label="Nome" value={contato.nome} />
        <Field label="WhatsApp" value={contato.whatsapp.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")} />
        <Field label="E-mail" value={contato.email} />
        <Field label="Onde mora" value={`${local.bairro}, ${local.cidade}`} />
        <Field label="Profissão" value={profissao} />
        {midia && (
          <Field label={midia.tipo === "video" ? "Vídeo gravado" : "Áudio gravado"} value={`${dur} segundos`} />
        )}
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Experiências</p>
          <ul className="space-y-1 text-sm">
            {p.experiencias.map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-muted-foreground">Habilidades</p>
          <div className="flex flex-wrap gap-1.5">
            {p.habilidades.map((h, i) => (
              <span key={i} className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{h}</span>
            ))}
          </div>
        </div>
      </div>

      {p.dicas.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Dicas pra você</p>
          <ul className="space-y-1 text-sm">
            {p.dicas.map((d, i) => <li key={i}>💡 {d}</li>)}
          </ul>
        </div>
      )}

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
