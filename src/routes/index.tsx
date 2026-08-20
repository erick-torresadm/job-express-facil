import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useScroll, useTransform, type Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  MapPin, Mic, Video, Zap, ShieldCheck, Clock, Building2, HardHat,
  ArrowRight, Star, Check, CheckCheck, Sparkles, MessageCircle, TrendingUp, Users,
  Briefcase, Award, Rocket, Target, ShoppingBag, Headphones, BarChart3, Package,
  Code2, Stethoscope, GraduationCap,
} from "lucide-react";
import { AdSlot } from "@/components/AdSlot";
import { InstallPWA } from "@/components/InstallPWA";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VagasAgora — Vagas CLT em empresas que estão contratando hoje" },
      { name: "description", content: "A nova forma de encontrar emprego no Brasil. Crie seu perfil em 1 minuto e seja chamado por empresas para vagas CLT, PJ e estágio na sua região." },
      { property: "og:title", content: "VagasAgora — Sua próxima vaga começa aqui" },
      { property: "og:description", content: "Milhares de empresas contratando em todo o Brasil. Perfil em 1 minuto, entrevistas no WhatsApp." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Landing,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

function Landing() {
  return (
    <div className="bg-background overflow-x-hidden">
      <Hero />
      <Marquee />
      <Como />
      <Stats />
      <Profissoes />
      <LiveActivity />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <AdSlot placement="home_meio" format="banner" />
      </div>
      <ParaQuem />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <AdSlot placement="home_inferior" format="banner" />
      </div>
      <Depoimentos />
      <InstallPWA />
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

      <motion.div style={{ y }} className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pb-20 sm:pt-12 md:pb-32 md:pt-24">
        <div className="grid items-center gap-10 md:gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="text-center md:text-left"
          >
            <motion.span
              variants={fadeUp}
              className="mt-14 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold backdrop-blur-md sm:mt-4 sm:text-xs md:mt-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.85_0.18_140)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.85_0.18_140)]" />
              </span>
              <span className="hidden xs:inline">12.847 vagas ativas · atualizado agora</span>
              <span className="xs:hidden">12.847 vagas ativas agora</span>
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="mt-5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] xs:text-[2.4rem] sm:text-6xl md:text-[4.5rem]"
            >
              Sua próxima vaga{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-white via-white to-[oklch(0.78_0.14_220)] bg-clip-text text-transparent">
                  começa aqui.
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

            <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base md:mx-0 md:mt-6 md:text-lg">
              Conectamos profissionais a vagas <strong className="font-bold text-white">CLT, PJ e estágio</strong> em
              milhares de empresas. Crie seu perfil em 1 minuto e seja chamado direto no WhatsApp —
              sem PDF, sem fila, sem burocracia.
              <span className="mt-2 block font-bold text-white">100% grátis pra candidatos. Você nunca paga nada pra se candidatar.</span>
            </motion.p>

            <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Link
                to="/cadastro"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white px-6 py-3.5 text-[15px] font-bold text-primary shadow-pop transition active:scale-[0.98] sm:px-7 sm:py-4 sm:text-base"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative">Encontrar vagas</span>
                <ArrowRight className="relative h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-6 py-3.5 text-[15px] font-bold text-white backdrop-blur-md transition hover:bg-white/10 active:scale-[0.98] sm:px-7 sm:py-4 sm:text-base"
              >
                <Building2 className="h-5 w-5" /> Contratar talentos
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-7 flex items-center justify-center gap-4 md:justify-start">
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
              <div className="text-left text-xs text-white/70">
                <div className="flex items-center gap-1 text-white">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[oklch(0.85_0.18_85)] text-[oklch(0.85_0.18_85)]" />
                  ))}
                  <span className="ml-1 font-bold">4.9</span>
                </div>
                <p>+340 mil profissionais e 8.200 empresas</p>
              </div>
            </motion.div>
          </motion.div>


          {/* Phone with floating notifications */}
          <div className="flex flex-col items-center">
            <PhoneMockup />
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-4 max-w-xs text-center text-[10px] leading-relaxed text-muted-foreground/70"
            >
              * Ilustração meramente demonstrativa. Nomes, marcas e mensagens exibidos são fictícios
              e servem apenas para fins de demonstração da interface. Qualquer semelhança com
              empresas reais é mera coincidência.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* bottom gradient fade */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function PhoneMockup() {
  const [chipIdx, setChipIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setChipIdx((i) => (i + 1) % WHATS_POOL.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);
  const chip = WHATS_POOL[chipIdx];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
      className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px]"
    >
      {/* Floating chip — top */}
      <motion.div
        className="absolute -left-6 top-12 z-10 rounded-2xl border border-white/20 bg-white/95 px-4 py-2.5 text-foreground shadow-pop backdrop-blur"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold text-white"
            style={{ background: chip.color }}
          >
            {chip.initials}
          </div>
          <div className="min-w-[140px]">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Nova mensagem</p>
            <AnimatePresence mode="wait">
              <motion.p
                key={chipIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="truncate text-xs font-bold"
              >
                {chip.company} chamou
              </motion.p>
            </AnimatePresence>
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
            <p className="text-xs font-bold">94% fit · CLT</p>
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

          <WhatsappFeed />

        </div>
      </div>
    </motion.div>
  );
}

type WhatsMsg = {
  id: number;
  company: string;
  role: string;
  msg: string;
  time: string;
  initials: string;
  color: string;
};

const WHATS_POOL: Omit<WhatsMsg, "id" | "time">[] = [
  { company: "Rede Varejo Plus", role: "Vendedor CLT", msg: "Olá Ana! Seu perfil bateu com nossa vaga. Topa uma entrevista amanhã?", initials: "RV", color: "oklch(0.6 0.2 25)" },
  { company: "Banco Cooperativo BR", role: "Assistente Administrativo", msg: "Boa tarde! Vimos seu currículo. Vaga CLT + benefícios completos", initials: "BC", color: "oklch(0.6 0.18 60)" },
  { company: "AutoMobi Frotas", role: "Atendente de Loja", msg: "Tem disponibilidade pra entrevista terça? Plano de carreira estruturado", initials: "AM", color: "oklch(0.62 0.18 145)" },
  { company: "Entrega Já Brasil", role: "Analista de Operações Jr", msg: "Oi! Adoramos seu perfil. Home office + auxílio. Bora conversar?", initials: "EJ", color: "oklch(0.6 0.2 15)" },
  { company: "Indústria Boa Mesa", role: "Auxiliar de Logística", msg: "Vaga efetiva na unidade do interior. PLR + vale-alimentação", initials: "BM", color: "oklch(0.5 0.18 30)" },
  { company: "Cosmética Verde", role: "Consultora de Vendas", msg: "Olá! Seleção aberta na sua região. Carreira sólida + comissão", initials: "CV", color: "oklch(0.6 0.16 150)" },
  { company: "Moda Urbana SA", role: "Operador de Caixa", msg: "Boa tarde! Vaga CLT, escala 6x1, treinamento pago", initials: "MU", color: "oklch(0.62 0.16 290)" },
  { company: "Hospital Vida Nova", role: "Recepcionista", msg: "Vaga noturna, CLT + plano de saúde completo", initials: "VN", color: "oklch(0.65 0.13 200)" },
  { company: "Energia Brasil SA", role: "Auxiliar Administrativo", msg: "Processo seletivo aberto. Estabilidade + benefícios completos", initials: "EB", color: "oklch(0.55 0.18 145)" },
  { company: "Seguros Confiança", role: "Atendente SAC", msg: "Oi! Vaga híbrida, CLT + bônus por performance", initials: "SC", color: "oklch(0.5 0.2 15)" },
  { company: "SuperMega Atacado", role: "Repositor", msg: "Vaga efetiva 44h, vale-refeição + cesta básica", initials: "SM", color: "oklch(0.55 0.2 250)" },
  { company: "Farmácia Popular+", role: "Atendente de Farmácia", msg: "Boa tarde! CLT, escala fixa, plano de saúde", initials: "FP", color: "oklch(0.62 0.18 145)" },
  { company: "Fintech Crescer", role: "Estágio em Produto", msg: "Olá! Estágio remoto, R$ 2.500 + VR + VA", initials: "FC", color: "oklch(0.55 0.2 320)" },
  { company: "Marketplace Onda", role: "Analista de Customer Exp", msg: "Vaga efetiva, modelo híbrido, stock options", initials: "MO", color: "oklch(0.7 0.16 75)" },
  { company: "PayTech Brasil", role: "Executivo Comercial", msg: "Olá! Carteira pronta, comissão sem teto + carro", initials: "PT", color: "oklch(0.6 0.18 145)" },
  { company: "Capital Invest", role: "Analista Jr", msg: "Processo aberto. Centro empresarial, plano de carreira agressivo", initials: "CI", color: "oklch(0.4 0.05 260)" },
  { company: "Telecom Connect", role: "Consultor de Vendas", msg: "Boa tarde! CLT + comissão média R$ 4.200", initials: "TC", color: "oklch(0.55 0.2 320)" },
  { company: "Beleza & Cia", role: "Vendedor de Cosméticos", msg: "Vaga em shopping perto de você, CLT + bonificação", initials: "BC", color: "oklch(0.65 0.18 350)" },
  { company: "Aero Linhas SA", role: "Agente de Aeroporto", msg: "Vaga em aeroporto regional, CLT, passagens com desconto", initials: "AL", color: "oklch(0.5 0.18 15)" },
  { company: "AgroFood Nacional", role: "Auxiliar de Produção", msg: "Vaga efetiva, transporte fretado + refeição no local", initials: "AF", color: "oklch(0.55 0.2 25)" },
  { company: "Coop Crédito Sul", role: "Caixa Bancário", msg: "Olá! Vaga CLT cooperativa, PLR + previdência", initials: "CS", color: "oklch(0.55 0.18 145)" },
  { company: "Atende+ Contact", role: "Operador de Telemarketing", msg: "Home office, 6h/dia, comissão + bonificação", initials: "A+", color: "oklch(0.55 0.2 290)" },
  { company: "Florestal Brasil", role: "Técnico em Segurança", msg: "Vaga industrial, regime 12x36, alojamento incluso", initials: "FB", color: "oklch(0.55 0.16 150)" },
  { company: "Veste Bem Lojas", role: "Assistente de Loja", msg: "Boa tarde! Vaga CLT + plano de carreira no varejo", initials: "VB", color: "oklch(0.55 0.2 15)" },
  { company: "Banco Digital Pro", role: "Especialista de Atendimento", msg: "Olá! Vaga 100% remota, CLT + RSU + benefícios", initials: "BD", color: "oklch(0.55 0.2 320)" },
];

function WhatsappFeed() {
  const initial = WHATS_POOL.slice(0, 2).map((m, i) => ({
    id: i + 1,
    time: `09:${38 + i * 2}`,
    ...m,
  }));
  const [messages, setMessages] = useState<WhatsMsg[]>(initial);
  const [typing, setTyping] = useState(false);
  const counter = useRef(initial.length + 1);
  const poolIdx = useRef(initial.length);
  const totalChamadas = useRef(7); // already received "hoje"

  useEffect(() => {
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setTyping(true);
      setTimeout(() => {
        if (cancelled) return;
        setTyping(false);
        const next = WHATS_POOL[poolIdx.current % WHATS_POOL.length];
        poolIdx.current += 1;
        const id = counter.current++;
        totalChamadas.current += 1;
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        setMessages((prev) => [...prev, { id, time, ...next }].slice(-6));
      }, 1100);
    };
    const interval = setInterval(tick, 2800);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);


  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3 text-[oklch(0.55_0.15_150)]" />
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Recrutadores online</span>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.65_0.18_145)] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.65_0.18_145)]" />
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-end gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: -18, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="rounded-2xl rounded-tl-sm border border-border bg-card p-2.5 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white shadow-inner"
                  style={{ background: m.color }}
                >
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-bold text-foreground">{m.company}</p>
                    <span className="shrink-0 text-[9px] text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-[oklch(0.55_0.15_150)]">{m.role}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-foreground/80">{m.msg}</p>
                  <div className="mt-1 flex items-center justify-end">
                    <CheckCheck className="h-3 w-3 text-[oklch(0.6_0.18_230)]" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {typing && (
            <motion.div
              key="typing"
              layout
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25 }}
              className="flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1.5"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-foreground/50"
                  animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              <span className="text-[9px] font-semibold text-muted-foreground">nova mensagem…</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="mt-1 flex items-center gap-2 rounded-2xl bg-[oklch(0.85_0.15_140)]/15 p-2.5 ring-1 ring-[oklch(0.65_0.18_145)]/40"
        animate={{ boxShadow: ["0 0 0 0 oklch(0.65 0.18 145 / 0.4)", "0 0 0 8px oklch(0.65 0.18 145 / 0)"] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <Check className="h-3.5 w-3.5 text-[oklch(0.4_0.15_140)]" />
        <p className="text-[11px] font-bold text-[oklch(0.4_0.15_140)]">{totalChamadas.current} recrutadores te chamaram hoje</p>
      </motion.div>
    </div>
  );
}

function Counter({ to, suffix = "", duration = 2 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const value = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const n = Math.round(v);
        setDisplay(n.toLocaleString("pt-BR"));
      },
    });
    return () => controls.stop();
  }, [inView, to, duration, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

function Stats() {
  const stats = [
    { icon: <Users className="h-5 w-5" />, n: 340000, suffix: "+", l: "Profissionais ativos", s: "atualizado em tempo real" },
    { icon: <Building2 className="h-5 w-5" />, n: 8200, suffix: "+", l: "Empresas contratando", s: "do varejo ao financeiro" },
    { icon: <Briefcase className="h-5 w-5" />, n: 12847, suffix: "", l: "Vagas abertas agora", s: "CLT, PJ e estágio" },
    { icon: <Rocket className="h-5 w-5" />, n: 94, suffix: "%", l: "Match assertivo", s: "IA proprietária treinada com 4M perfis" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background py-14 sm:py-20 md:py-28">
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.2 0.05 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.2 0.05 260) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "48px 48px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Os números</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
            A maior rede de empregos <span className="text-muted-foreground">da nova economia.</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.l}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 20 } }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <motion.div
                aria-hidden
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="relative mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-pop">
                {s.icon}
              </div>
              <p className="relative text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl md:text-5xl">
                <Counter to={s.n} suffix={s.suffix} />
              </p>
              <p className="relative mt-2 text-sm font-bold">{s.l}</p>
              <p className="relative mt-1 text-xs text-muted-foreground">{s.s}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

type Hire = { id: number; name: string; role: string; company: string; city: string; color: string };

const HIRE_POOL: Omit<Hire, "id">[] = [
  { name: "Camila R.", role: "Analista de Marketing", company: "Rede Varejo Plus", city: "São Paulo", color: "oklch(0.7 0.15 30)" },
  { name: "Lucas M.", role: "Vendedor Sênior", company: "Moda Urbana SA", city: "Porto Alegre", color: "oklch(0.62 0.16 290)" },
  { name: "Patricia S.", role: "Auxiliar Administrativo", company: "Banco Cooperativo BR", city: "Rio de Janeiro", color: "oklch(0.6 0.18 60)" },
  { name: "Diego A.", role: "Atendente SAC", company: "Seguros Confiança", city: "Belo Horizonte", color: "oklch(0.5 0.2 15)" },
  { name: "Júlia P.", role: "Estágio em Produto", company: "Fintech Crescer", city: "São Paulo", color: "oklch(0.55 0.2 320)" },
  { name: "André C.", role: "Operador de Caixa", company: "SuperMega Atacado", city: "Campinas", color: "oklch(0.55 0.2 250)" },
  { name: "Marcela O.", role: "Recepcionista", company: "Hospital Vida Nova", city: "São Paulo", color: "oklch(0.65 0.13 200)" },
  { name: "Bruno L.", role: "Auxiliar de Logística", company: "Indústria Boa Mesa", city: "Interior SP", color: "oklch(0.5 0.18 30)" },
  { name: "Letícia F.", role: "Consultora", company: "Cosmética Verde", city: "Cajamar", color: "oklch(0.6 0.16 150)" },
  { name: "Felipe T.", role: "Executivo Comercial", company: "PayTech Brasil", city: "São Paulo", color: "oklch(0.6 0.18 145)" },
];

function LiveActivity() {
  const [feed, setFeed] = useState<Hire[]>(() =>
    HIRE_POOL.slice(0, 4).map((h, i) => ({ id: i + 1, ...h }))
  );
  const counter = useRef(5);
  const idx = useRef(4);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = HIRE_POOL[idx.current % HIRE_POOL.length];
      idx.current += 1;
      setFeed((prev) => [{ id: counter.current++, ...next }, ...prev].slice(0, 5));
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-primary py-14 text-primary-foreground sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
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
              Ao vivo
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl"
            >
              Pessoas sendo contratadas <br />
              <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_220)] bg-clip-text text-transparent">
                neste exato momento.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-5 max-w-md text-base text-white/75">
              Não é número de relatório. É gente real, fechando contrato agora, com empresas reais.
              Você pode ser o próximo.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 grid grid-cols-3 gap-3">
              {[
                { i: <Target className="h-4 w-4" />, n: "9 dias", l: "tempo médio até contratação" },
                { i: <Award className="h-4 w-4" />, n: "4.9★", l: "avaliação dos profissionais" },
                { i: <TrendingUp className="h-4 w-4" />, n: "+217%", l: "crescimento em 2025" },
              ].map((k) => (
                <div key={k.l} className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
                  <div className="text-[oklch(0.85_0.18_140)]">{k.i}</div>
                  <p className="mt-2 text-lg font-extrabold leading-none">{k.n}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-white/60">{k.l}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-pop backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[oklch(0.85_0.18_140)]/20 text-[oklch(0.85_0.18_140)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Contratações de hoje</p>
                  <p className="text-[10px] text-white/60">atualizando ao vivo</p>
                </div>
              </div>
              <span className="rounded-full bg-[oklch(0.85_0.18_140)]/15 px-2.5 py-1 text-[10px] font-bold text-[oklch(0.85_0.18_140)]">
                <Counter to={1247} duration={1.8} /> hoje
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {feed.map((h) => (
                  <motion.div
                    key={h.id}
                    layout
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -30, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 280, damping: 26 }}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-3"
                  >
                    <div
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                      style={{ background: h.color }}
                    >
                      {h.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {h.name} <span className="font-normal text-white/60">foi contratado(a) como</span>
                      </p>
                      <p className="truncate text-xs text-white/80">
                        {h.role} · <span className="text-[oklch(0.85_0.18_140)]">{h.company}</span>
                      </p>
                      <p className="text-[10px] text-white/50">{h.city}</p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.15, type: "spring", stiffness: 400 }}
                      className="grid h-7 w-7 place-items-center rounded-full bg-[oklch(0.85_0.18_140)]/20 text-[oklch(0.85_0.18_140)]"
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


function Marquee() {
  const items = [
    "Varejo & Atacado",
    "Construção Civil",
    "Saúde & Hospitais",
    "Logística & Entregas",
    "Indústria & Produção",
    "Alimentação & Restaurantes",
    "Bancos & Fintechs",
    "Tecnologia & TI",
    "Educação & Cursos",
    "Telecom & Atendimento",
    "Beleza & Estética",
    "Transporte & Mobilidade",
    "Hotelaria & Turismo",
    "Agro & Cooperativas",
  ];
  return (
    <section className="relative overflow-hidden border-y border-border bg-card py-5">
      <div className="mb-3 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Setores que já contratam pela plataforma
        </p>
      </div>
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
    { icon: <HardHat className="h-6 w-6" />, t: "Conte sua trajetória", d: "Áudio, vídeo ou texto. Em 60 segundos sua história vira um perfil profissional." },
    { icon: <Sparkles className="h-6 w-6" />, t: "IA monta seu currículo", d: "Estruturamos experiência, skills e palavras-chave que os recrutadores buscam." },
    { icon: <MapPin className="h-6 w-6" />, t: "Match com vagas reais", d: "Cruzamos seu perfil com milhares de oportunidades CLT, PJ e estágio." },
    { icon: <Zap className="h-6 w-6" />, t: "Recrutador te chama", d: "Convite de entrevista direto no WhatsApp. Sem espera, sem ansiedade." },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 md:py-28">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Como funciona</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          Do perfil à entrevista <span className="text-muted-foreground">em 48 horas.</span>
        </h2>
        <p className="mt-4 text-muted-foreground">Esqueça PDFs, anexos e cartas de apresentação. A gente cuida do processo, você foca na vaga.</p>
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
    { icon: Briefcase, n: "Administrativo", v: "1.842 vagas" },
    { icon: ShoppingBag, n: "Vendas & Varejo", v: "2.310 vagas" },
    { icon: Headphones, n: "Atendimento", v: "1.207 vagas" },
    { icon: BarChart3, n: "Financeiro", v: "684 vagas" },
    { icon: Package, n: "Logística", v: "1.495 vagas" },
    { icon: Code2, n: "Tecnologia", v: "923 vagas" },
    { icon: Stethoscope, n: "Saúde", v: "812 vagas" },
    { icon: GraduationCap, n: "Estágio & Trainee", v: "476 vagas" },
  ];
  return (
    <section className="bg-secondary/40 py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Áreas em alta</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">Empresas contratando agora.</h2>
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
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent transition group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground">
                  <p.icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
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
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 md:py-28">
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-pop">
            <HardHat className="h-7 w-7" />
          </div>
          <h3 className="relative text-3xl font-extrabold tracking-[-0.02em]">Para profissionais</h3>
          <p className="relative mt-3 text-muted-foreground">Acelere sua carreira. Apareça para os recrutadores das maiores empresas do país e receba convites diretos no WhatsApp. <strong className="text-foreground">Você nunca paga nada pra se candidatar.</strong></p>
          <ul className="relative mt-6 space-y-2.5 text-sm">
            {["Perfil inteligente em 60 segundos", "Match com vagas CLT, PJ e estágio", "Acompanhamento de cada candidatura", "Sempre grátis — candidato não paga nada"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/cadastro" className="btn-touch relative z-10 mt-7 inline-flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground shadow-pop">
            Criar meu perfil <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-pop md:p-10"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, oklch(0.7 0.18 200 / 0.5), transparent 50%)",
            }}
          />
          <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
            <Building2 className="h-7 w-7" />
          </div>
          <h3 className="relative text-3xl font-extrabold tracking-[-0.02em]">Para empresas</h3>
          <p className="relative mt-3 text-white/80">Reduza o tempo de contratação em até 70%. Triagem com IA, candidatos qualificados e integração com seu ATS.</p>
          <ul className="relative mt-6 space-y-2.5 text-sm">
            {["Publicação em 30 segundos", "Triagem inteligente por IA", "Vídeo-apresentação do candidato", "Modelo CPC: pague só por contratação"].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[oklch(0.85_0.18_140)]/20 text-[oklch(0.85_0.18_140)]">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link to="/para-empresas" className="btn-touch relative z-10 mt-7 inline-flex w-full items-center justify-center gap-2 bg-white text-primary shadow-pop">
            Falar com o time comercial <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Depoimentos() {
  const dep = [
    { n: "Ana Carolina Souza", p: "Analista Administrativo · São Paulo", t: "Em uma semana fui chamada por 4 empresas. Hoje estou CLT em uma rede do varejo — nunca imaginei que seria tão rápido.", c: "oklch(0.7 0.15 30)" },
    { n: "Rafael Mendes", p: "Vendedor · Belo Horizonte", t: "O perfil em vídeo mudou o jogo. Os recrutadores já chegavam na conversa sabendo quem eu era.", c: "oklch(0.7 0.15 320)" },
    { n: "Beatriz Oliveira", p: "Head de RH · Rede de varejo nacional", t: "Reduzimos o tempo médio de contratação de 32 para 9 dias. A qualidade dos candidatos é absurda.", c: "oklch(0.7 0.15 200)" },
  ];
  return (
    <section className="bg-primary py-14 text-primary-foreground sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.78_0.14_220)]">Quem já está dentro</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">Carreiras que decolaram aqui.</h2>
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
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
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
            <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Cadastro verificado · LGPD
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-6xl">
            Sua próxima oportunidade<br />
            <span className="text-accent">já está aberta.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Junte-se a 340 mil profissionais que estão a um WhatsApp da próxima vaga.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/cadastro"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-pop transition active:scale-[0.98]"
            >
              <HardHat className="h-5 w-5" /> Quero ser contratado
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-border bg-background px-8 py-4 text-base font-bold text-foreground transition hover:border-accent active:scale-[0.98]"
            >
              <Building2 className="h-5 w-5" /> Quero contratar
            </Link>
          </div>
          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Perfil completo em menos de 60 segundos
          </p>
        </div>
      </motion.div>
    </section>
  );
}
