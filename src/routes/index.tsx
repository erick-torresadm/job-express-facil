import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import {
  MapPin, Mic, Video, Zap, ShieldCheck, Clock, Building2, HardHat,
  ArrowRight, Star, Check, Sparkles, MessageCircle, TrendingUp, Users,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vaga Já — Emprego perto de você, em 3 toques" },
      { name: "description", content: "Cadastre-se em 1 minuto por áudio ou vídeo. Vagas para pedreiro, doméstica, motorista, porteiro e mais — perto da sua casa." },
      { property: "og:title", content: "Vaga Já — Emprego perto de você" },
      { property: "og:description", content: "Cadastro em 1 minuto. Achou vaga no bairro." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function Landing() {
  return (
    <div className="bg-background overflow-x-hidden">
      <Hero />
      <Marquee />
      <Como />
      <Profissoes />
      <ParaQuem />
      <Depoimentos />
      <CTA />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary text-primary-foreground">
      {/* Animated background blobs */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.18_0.08_260)]" />
        <motion.div
          className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "oklch(0.58 0.18 240)" }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.7 0.18 200)" }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 0.6) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </motion.div>

      <motion.div style={{ y }} className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 md:pb-32 md:pt-24">
        <div className="grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold backdrop-blur-md"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.85_0.18_140)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.85_0.18_140)]" />
              </span>
              847 vagas abertas agora · São Paulo
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-5 text-[2.5rem] font-extrabold leading-[1.02] tracking-[-0.03em] sm:text-6xl md:text-[4.5rem]"
            >
              O emprego que cabe na{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-white via-white to-[oklch(0.78_0.14_220)] bg-clip-text text-transparent">
                  sua rua.
                </span>
                <motion.svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                >
                  <motion.path
                    d="M2 8 Q 100 -2 198 6"
                    stroke="oklch(0.78 0.14 220)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  />
                </motion.svg>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Grava 1 minuto de áudio ou vídeo, nossa IA monta seu currículo,
              e as empresas chamam você no <strong className="font-bold text-white">WhatsApp</strong>.
              Sem PDF, sem fila, sem letra miúda.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/cadastro"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-7 py-4 text-base font-bold text-primary shadow-pop transition active:scale-[0.98]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Quero uma vaga</span>
                <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-7 py-4 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/10 active:scale-[0.98]"
              >
                <Building2 className="h-5 w-5" /> Sou empresa
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {["oklch(0.72_0.15_30)", "oklch(0.72_0.15_140)", "oklch(0.72_0.15_200)", "oklch(0.72_0.15_300)"].map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200 }}
                    className="h-9 w-9 rounded-full ring-2 ring-primary"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div className="text-xs text-white/70">
                <div className="flex items-center gap-1 text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[oklch(0.85_0.18_85)] text-[oklch(0.85_0.18_85)]" />
                  ))}
                  <span className="ml-1 font-bold">4.9</span>
                </div>
                <p>+12 mil trabalhadores cadastrados</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Phone with floating notifications */}
          <PhoneMockup />
        </div>
      </motion.div>

      {/* bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function PhoneMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto hidden w-full max-w-[320px] sm:block"
    >
      {/* Floating chip — top */}
      <motion.div
        className="absolute -left-6 top-12 z-10 rounded-2xl border border-white/20 bg-white/95 px-4 py-2.5 text-foreground shadow-pop backdrop-blur"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#25D366]/15 text-[#25D366]">
            <MessageCircle className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">WhatsApp</p>
            <p className="text-xs font-bold">Construtora Vale chamou!</p>
          </div>
        </div>
      </motion.div>

      {/* Floating chip — bottom */}
      <motion.div
        className="absolute -right-4 bottom-16 z-10 rounded-2xl border border-white/20 bg-white/95 px-4 py-2.5 text-foreground shadow-pop backdrop-blur"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Match</p>
            <p className="text-xs font-bold">3 vagas a 1,2 km</p>
          </div>
        </div>
      </motion.div>

      <div className="aspect-[9/19] rounded-[2.75rem] border-[10px] border-[oklch(0.12_0.04_260)] bg-card shadow-2xl">
        <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[2rem] bg-gradient-to-b from-background to-secondary/40 p-4">
          {/* status bar */}
          <div className="flex items-center justify-between px-2 text-[10px] font-bold text-foreground">
            <span>09:41</span>
            <div className="flex gap-1 opacity-60">
              <div className="h-2 w-3 rounded-sm bg-foreground" />
              <div className="h-2 w-3 rounded-sm bg-foreground" />
              <div className="h-2 w-5 rounded-sm bg-foreground" />
            </div>
          </div>

          {/* Recording card */}
          <motion.div
            className="rounded-2xl bg-primary p-3 text-primary-foreground"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">
                <Mic className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold">Gravando…</p>
                <p className="text-[10px] opacity-70">00:42 / 01:00</p>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
            </div>
            {/* waveform */}
            <div className="mt-3 flex h-8 items-end gap-0.5">
              {Array.from({ length: 28 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-full bg-white/60"
                  animate={{ height: ["20%", `${30 + Math.random() * 70}%`, "20%"] }}
                  transition={{ duration: 0.8 + Math.random() * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
                />
              ))}
            </div>
          </motion.div>

          {[
            { t: "Pedreiro — Tatuapé", s: "R$ 180/dia · 1,2 km", c: "oklch(0.7 0.15 30)" },
            { t: "Ajudante — Mooca", s: "R$ 120/dia · 2,8 km", c: "oklch(0.7 0.15 140)" },
          ].map((j, i) => (
            <motion.div
              key={j.t}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 + i * 0.15, duration: 0.5 }}
            >
              <div className="h-10 w-10 shrink-0 rounded-xl" style={{ background: j.c }} />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{j.t}</p>
                <p className="text-[11px] text-muted-foreground">{j.s}</p>
              </div>
              <Check className="h-4 w-4 text-accent" />
            </motion.div>
          ))}

          <div className="mt-auto rounded-2xl bg-[oklch(0.85_0.15_140)]/15 p-3 ring-1 ring-[oklch(0.7_0.15_140)]/30">
            <p className="text-xs font-bold text-[oklch(0.4_0.15_140)]">✓ 2 empresas chamaram hoje</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Marquee() {
  const items = ["Pedreiro", "Doméstica", "Motorista", "Porteiro", "Ajudante", "Cozinheiro", "Entregador", "Jardineiro", "Babá", "Garçom", "Vendedor", "Operador"];
  return (
    <section className="relative overflow-hidden border-y border-border bg-card py-5">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((p, i) => (
          <span key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {p}
          </span>
        ))}
      </motion.div>
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
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Como funciona</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">
          Três toques. <span className="text-muted-foreground">A vaga chegou.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">Sem currículo em Word. Sem upload de PDF. Sem complicação.</p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        className="mt-14 grid gap-5 md:grid-cols-4"
      >
        {steps.map((s, i) => (
          <motion.div
            key={s.t}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 transition-all duration-500 group-hover:scale-150 group-hover:bg-accent/10" />
            <div className="relative mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-pop">
              {s.icon}
            </div>
            <p className="relative text-[10px] font-bold tracking-widest text-accent">PASSO {String(i + 1).padStart(2, "0")}</p>
            <h3 className="relative mt-1 text-lg font-extrabold tracking-tight">{s.t}</h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

function Profissoes() {
  const list = [
    { e: "🧱", n: "Pedreiro", v: "248 vagas" },
    { e: "🧹", n: "Doméstica", v: "192 vagas" },
    { e: "🚗", n: "Motorista", v: "156 vagas" },
    { e: "🛡️", n: "Porteiro", v: "98 vagas" },
    { e: "🔧", n: "Ajudante", v: "311 vagas" },
    { e: "🍳", n: "Cozinheiro", v: "87 vagas" },
    { e: "📦", n: "Entregador", v: "204 vagas" },
    { e: "🌿", n: "Jardineiro", v: "64 vagas" },
  ];
  return (
    <section className="bg-secondary/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Vagas perto de você</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">Pra quem faz o Brasil girar.</h2>
          </div>
          <Link to="/cadastro" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-accent">
            Ver todas as vagas <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {list.map((p) => (
            <motion.div key={p.n} variants={fadeUp}>
              <Link
                to="/cadastro"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-pop"
              >
                <span className="text-3xl transition group-hover:scale-110">{p.e}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-bold">{p.n}</p>
                  <p className="text-xs text-muted-foreground">{p.v}</p>
                </div>
                <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100 text-accent" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ParaQuem() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.15 } } }}
        className="grid gap-6 md:grid-cols-2"
      >
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft md:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-pop">
            <HardHat className="h-7 w-7" />
          </div>
          <h3 className="relative text-3xl font-extrabold tracking-[-0.02em]">Sou trabalhador</h3>
          <p className="relative mt-3 text-muted-foreground">Cadastro grátis, sem precisar saber escrever bem. Vagas no seu bairro caem no seu WhatsApp.</p>
          <ul className="relative mt-6 space-y-2.5 text-sm">
            {["Cadastro por áudio ou vídeo", "Sem ficar na fila", "Empresa chama direto", "100% grátis pra começar"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/cadastro" className="btn-touch mt-7 inline-flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground shadow-pop">
            Criar meu perfil <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-pop md:p-10"
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, oklch(0.7 0.18 200 / 0.5), transparent 50%)",
            }}
          />
          <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="relative text-3xl font-extrabold tracking-[-0.02em]">Sou empresa</h3>
          <p className="relative mt-3 text-white/80">Encontre pedreiro, ajudante, doméstica, motorista no seu raio. Filtros por bairro, experiência e disponibilidade.</p>
          <ul className="relative mt-6 space-y-2.5 text-sm">
            {["Publique vaga em 30 segundos", "Receba candidatos qualificados", "Áudio e vídeo do candidato", "Cobramos só quando contrata"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.85_0.18_140)]/20 text-[oklch(0.85_0.18_140)]">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/auth" className="btn-touch mt-7 inline-flex w-full items-center justify-center gap-2 bg-white text-primary shadow-pop">
            Publicar vaga <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Depoimentos() {
  const dep = [
    { n: "José Almeida", p: "Pedreiro · São Paulo", t: "Cadastrei pelo áudio porque escrevo pouco. Em 2 dias me chamaram pra obra perto de casa.", c: "oklch(0.7 0.15 30)" },
    { n: "Maria Ribeiro", p: "Doméstica · Rio", t: "Achei dois trabalhos no meu bairro. Não precisei pegar ônibus pra entrevista.", c: "oklch(0.7 0.15 320)" },
    { n: "Construtora Vale", p: "RH · Belo Horizonte", t: "Em uma semana contratamos 4 ajudantes. Muito melhor que jornal e Facebook.", c: "oklch(0.7 0.15 200)" },
  ];
  return (
    <section className="bg-primary py-20 text-primary-foreground md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.78_0.14_220)]">Histórias reais</p>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.02em] md:text-5xl">Gente que já achou.</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {dep.map((d) => (
            <motion.figure
              key={d.n}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <div className="flex gap-0.5 text-[oklch(0.85_0.18_85)]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm leading-relaxed text-white/90">"{d.t}"</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full ring-2 ring-white/20" style={{ background: d.c }} />
                <div className="text-xs">
                  <p className="font-bold text-white">{d.n}</p>
                  <p className="text-white/60">{d.p}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-10 text-center shadow-soft md:p-16"
      >
        {/* Decorative orbs */}
        <motion.div
          aria-hidden
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.7 0.15 245)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.7 0.18 200)" }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="relative">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Sem letra miúda
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-[-0.02em] md:text-6xl">
            Cadastra em 1 minuto.<br />
            <span className="text-accent">Pode ser hoje.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Trabalhador ou empresa, é só escolher abaixo.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/cadastro"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-pop transition active:scale-[0.98]"
            >
              <HardHat className="h-5 w-5" /> Sou trabalhador
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background px-8 py-4 text-base font-bold text-foreground transition hover:border-accent active:scale-[0.98]"
            >
              <Building2 className="h-5 w-5" /> Sou empresa
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Leva menos de 60 segundos
          </p>
        </div>
      </motion.div>
    </section>
  );
}
