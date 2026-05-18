import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin, Mic, Video, Zap, ShieldCheck, Clock, Building2, HardHat,
  ArrowRight, Star, Check, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vaga Já — Emprego perto de você, em 3 toques" },
      { name: "description", content: "Achou seu próximo emprego no bairro. Cadastre-se em 1 minuto por áudio ou vídeo. Vagas para pedreiro, doméstica, motorista, porteiro e mais." },
      { property: "og:title", content: "Vaga Já — Emprego perto de você" },
      { property: "og:description", content: "Cadastro em 1 minuto. Achou vaga no bairro." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="bg-background">
      <Hero />
      <Stats />
      <Como />
      <Profissoes />
      <ParaQuem />
      <Depoimentos />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[oklch(0.22_0.1_255)] text-primary-foreground">
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, oklch(0.6 0.18 240 / 0.4), transparent 40%), radial-gradient(circle at 80% 90%, oklch(0.7 0.18 200 / 0.3), transparent 40%)" }} />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 md:pb-28 md:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur ring-1 ring-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Novo no Brasil
            </span>
            <h1 className="mt-4 text-[2.25rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Achei meu emprego<br />
              <span className="bg-gradient-to-r from-white to-[oklch(0.85_0.12_220)] bg-clip-text text-transparent">no bairro.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
              Grava áudio ou vídeo de 1 minuto e a Vaga Já monta seu currículo. As empresas chamam você no WhatsApp.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-bold text-primary shadow-pop transition hover:translate-y-[-1px] active:scale-[0.98]">
                Quero uma vaga
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-base font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]">
                <Building2 className="h-5 w-5" /> Sou empresa
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs text-white/70">
              <div className="flex -space-x-2">
                {["oklch(0.7_0.15_30)","oklch(0.7_0.15_140)","oklch(0.7_0.15_200)","oklch(0.7_0.15_300)"].map((c,i)=>(
                  <div key={i} className="h-7 w-7 rounded-full ring-2 ring-primary" style={{ background: c }} />
                ))}
              </div>
              <span>+12 mil trabalhadores cadastrados</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto hidden w-full max-w-[300px] sm:block animate-float">
            <div className="aspect-[9/19] rounded-[2.5rem] border-[10px] border-[oklch(0.15_0.04_255)] bg-card shadow-2xl">
              <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[1.75rem] p-4">
                <div className="rounded-2xl bg-accent/15 p-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <Mic className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Gravando…</p>
                      <p className="text-[10px] text-muted-foreground">00:42 / 01:00</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-secondary p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Vaga perto</p>
                  <p className="text-sm font-bold text-foreground">Pedreiro — Tatuapé</p>
                  <p className="text-xs text-muted-foreground">R$ 180/dia · 1,2 km</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary p-3">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Vaga perto</p>
                  <p className="text-sm font-bold text-foreground">Ajudante — Mooca</p>
                  <p className="text-xs text-muted-foreground">R$ 120/dia · 2,8 km</p>
                </div>
                <div className="mt-auto rounded-2xl bg-accent p-3 text-accent-foreground">
                  <p className="text-xs font-bold">Empresa chamou no WhatsApp ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { n: "12k+", l: "Trabalhadores" },
    { n: "1.8k", l: "Vagas/mês" },
    { n: "< 1min", l: "Pra cadastrar" },
    { n: "94%", l: "Aprovam" },
  ];
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
        {items.map((s) => (
          <div key={s.l} className="text-center">
            <p className="text-2xl font-extrabold text-primary md:text-3xl">{s.n}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Como() {
  const steps = [
    { icon: <HardHat className="h-6 w-6" />, t: "Diga sua profissão", d: "Toque na sua área: pedreiro, doméstica, motorista…" },
    { icon: <MapPin className="h-6 w-6" />, t: "Onde você mora", d: "GPS ou CEP. Achamos vagas no seu bairro." },
    { icon: <Mic className="h-6 w-6" />, t: "Conte sobre você", d: "Áudio ou vídeo de até 1 minuto. Sem digitar." },
    { icon: <Zap className="h-6 w-6" />, t: "Empresa chama você", d: "Aprovação direto no seu WhatsApp." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-accent">Como funciona</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Três toques e a vaga chegou.</h2>
        <p className="mt-3 text-muted-foreground">Sem currículo em Word. Sem upload de PDF. Sem complicação.</p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.t} className="relative rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-pop">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              {s.icon}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground">PASSO {i + 1}</p>
            <h3 className="mt-1 text-lg font-bold">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Profissoes() {
  const list = [
    { e: "🧱", n: "Pedreiro" }, { e: "🧹", n: "Doméstica" }, { e: "🚗", n: "Motorista" },
    { e: "🛡️", n: "Porteiro" }, { e: "🔧", n: "Ajudante" }, { e: "🍳", n: "Cozinheiro" },
    { e: "📦", n: "Entregador" }, { e: "🌿", n: "Jardineiro" },
  ];
  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Vagas perto de você</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Pra quem faz o Brasil girar.</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {list.map((p) => (
            <Link key={p.n} to="/cadastro"
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-accent hover:shadow-soft">
              <span className="text-3xl">{p.e}</span>
              <div>
                <p className="font-bold">{p.n}</p>
                <p className="text-xs text-muted-foreground">Ver vagas →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ParaQuem() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <HardHat className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-extrabold">Sou trabalhador</h3>
          <p className="mt-2 text-muted-foreground">Cadastro grátis, sem precisar saber escrever bem. Vagas no seu bairro caem no seu WhatsApp.</p>
          <ul className="mt-5 space-y-2 text-sm">
            {["Cadastro por áudio ou vídeo", "Sem ficar na fila", "Empresa chama direto", "100% grátis pra começar"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> {t}</li>
            ))}
          </ul>
          <Link to="/cadastro" className="btn-touch mt-6 inline-flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground shadow-pop">
            Criar meu perfil
          </Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border bg-primary p-8 text-primary-foreground shadow-soft">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-extrabold">Sou empresa</h3>
          <p className="mt-2 text-white/80">Encontre pedreiro, ajudante, doméstica, motorista no seu raio. Filtros por bairro, experiência e disponibilidade.</p>
          <ul className="mt-5 space-y-2 text-sm">
            {["Publique vaga em 30 segundos", "Receba candidatos qualificados", "Áudio e vídeo do candidato", "Cobramos só quando contrata"].map((t) => (
              <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-[oklch(0.85_0.15_140)]" /> {t}</li>
            ))}
          </ul>
          <Link to="/auth" className="btn-touch mt-6 inline-flex w-full items-center justify-center gap-2 bg-white text-primary shadow-pop">
            Publicar vaga
          </Link>
        </div>
      </div>
    </section>
  );
}

function Depoimentos() {
  const dep = [
    { n: "José A.", p: "Pedreiro · SP", t: "Cadastrei pelo áudio porque escrevo pouco. Em 2 dias me chamaram pra obra." },
    { n: "Maria R.", p: "Doméstica · RJ", t: "Achei dois trabalhos no meu bairro. Não precisei pegar ônibus." },
    { n: "Construtora Vale", p: "Empresa", t: "Em uma semana contratamos 4 ajudantes. Muito melhor que jornal." },
  ];
  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Histórias reais</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">Gente que já achou.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {dep.map((d) => (
            <figure key={d.n} className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex gap-0.5 text-warning">
                {[...Array(5)].map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-foreground">"{d.t}"</blockquote>
              <figcaption className="mt-4 text-xs">
                <p className="font-bold">{d.n}</p>
                <p className="text-muted-foreground">{d.p}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.25_0.13_255)] p-10 text-center text-primary-foreground shadow-pop md:p-16">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur ring-1 ring-white/20">
          <ShieldCheck className="h-3.5 w-3.5" /> Sem letra miúda
        </div>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold tracking-tight md:text-5xl">
          Cadastra em 1 minuto. Pode ser hoje.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-white/80">Trabalhador ou empresa, é só escolher abaixo.</p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/cadastro" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-pop">
            <HardHat className="h-5 w-5" /> Sou trabalhador
          </Link>
          <Link to="/auth" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur">
            <Building2 className="h-5 w-5" /> Sou empresa
          </Link>
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-white/70">
          <Clock className="h-3.5 w-3.5" /> Leva menos de 60 segundos
        </p>
      </div>
    </section>
  );
}
