import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, type Variants } from "motion/react";
import { useRef } from "react";
import {
  Building2, Check, Sparkles, ShieldCheck, Brain, MapPin, Video, Filter,
  Bell, BarChart3, Lock, Clock, Users, Zap, ArrowRight, Star,
  TrendingDown, AlertTriangle, ThumbsUp, Flame,
} from "lucide-react";

export const Route = createFileRoute("/para-empresas")({
  head: () => ({
    meta: [
      { title: "Para empresas — Como funciona o VagasAgora | Contrate em 48h" },
      { name: "description", content: "A plataforma de recrutamento que conecta sua empresa aos melhores talentos da sua região em até 48h. IA, vídeo-currículo e WhatsApp direto. Planos a partir de R$ 99/mês." },
      { property: "og:title", content: "VagasAgora para empresas — Contrate em 48h" },
      { property: "og:description", content: "Acesso ilimitado a candidatos qualificados, triagem por IA, e match geolocalizado. Comece com 10 contatos grátis." },
    ],
    links: [{ rel: "canonical", href: "/para-empresas" }],
  }),
  component: ParaEmpresas,
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

function ParaEmpresas() {
  return (
    <div className="bg-background overflow-x-hidden">
      <Hero />
      <Problema />
      <ComoFunciona />
      <Diferenciais />
      <Comparativo />
      <Planos />
      <Resultados />
      <FAQ />
      <CTAFinal />
    </div>
  );
}

/* ============ HERO ============ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary text-primary-foreground">
      <motion.div aria-hidden className="absolute inset-0" style={{ opacity }}>
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

      <motion.div style={{ y }} className="relative mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:pb-24 sm:pt-20 md:pb-32 md:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold backdrop-blur-md sm:text-xs"
        >
          <Building2 className="h-3.5 w-3.5" />
          A plataforma de recrutamento da nova economia
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="mt-5 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] xs:text-[2.4rem] sm:text-6xl md:text-[4.25rem]"
        >
          Contrate em <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_220)] bg-clip-text text-transparent">48 horas</span>,
          <br className="hidden sm:block" />
          não em 48 dias.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:mt-7 sm:text-lg"
        >
          Acesse milhares de profissionais qualificados perto da sua operação, com vídeo,
          áudio e match feito por IA. Pague uma <strong className="font-bold text-white">mensalidade fixa</strong>{" "}
          e contrate quanto quiser — sem taxa por candidato, sem comissão escondida.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            to="/planos"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-[15px] font-bold text-primary shadow-pop transition active:scale-[0.98] sm:w-auto sm:text-base"
          >
            Ver planos
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </Link>
          <Link
            to="/empresa"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-7 py-4 text-[15px] font-bold text-white backdrop-blur-md transition hover:bg-white/10 sm:w-auto sm:text-base"
          >
            Testar grátis · 10 contatos
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 grid grid-cols-3 gap-4 sm:gap-8"
        >
          {[
            { v: "12.847", l: "candidatos ativos" },
            { v: "9 dias", l: "tempo médio até contratar" },
            { v: "93%", l: "comparecem na entrevista" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">{s.v}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/60 sm:text-xs">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

/* ============ PROBLEMA ============ */
function Problema() {
  const dores = [
    { i: <Clock className="h-5 w-5" />, t: "Triagem manual leva semanas", d: "Times de RH passam 60% do tempo lendo currículos repetitivos." },
    { i: <AlertTriangle className="h-5 w-5" />, t: "Currículo mente, vídeo não", d: "70% dos candidatos exageram experiência. Sem entrevista, é loteria." },
    { i: <TrendingDown className="h-5 w-5" />, t: "Taxa de no-show altíssima", d: "Em vagas operacionais, até 50% dos candidatos não aparecem." },
    { i: <Lock className="h-5 w-5" />, t: "Pagar por contato é injusto", d: "Cada candidato 'liberado' vira custo, mesmo quando não serve." },
  ];

  return (
    <section className="bg-secondary/40 py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp} className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">O problema</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
            Contratar virou um pesadelo <span className="text-muted-foreground">e ninguém arrumou.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Você posta uma vaga, recebe 400 currículos, dos quais 380 não têm nada a ver. Soa familiar?
          </p>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {dores.map((d) => (
            <motion.div
              key={d.t} variants={fadeUp}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                {d.i}
              </div>
              <h3 className="text-base font-extrabold">{d.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============ COMO FUNCIONA ============ */
function ComoFunciona() {
  const passos = [
    {
      n: "01", i: <Building2 className="h-6 w-6" />,
      t: "Crie sua conta e publique a vaga",
      d: "Cadastro em 2 minutos. Descreva a vaga ou cole de outro site — nossa IA estrutura tudo, sugere salário, e gera perguntas de triagem automáticas.",
    },
    {
      n: "02", i: <Brain className="h-6 w-6" />,
      t: "IA cruza com nossa base de talentos",
      d: "Em segundos, identificamos os melhores candidatos por profissão, bairro, experiência, disponibilidade e perfil comportamental do vídeo.",
    },
    {
      n: "03", i: <Video className="h-6 w-6" />,
      t: "Veja vídeo, ouça áudio, leia a história",
      d: "Cada candidato entrega um perfil completo com apresentação em vídeo de 60s. Você decide a entrevista antes mesmo de falar.",
    },
    {
      n: "04", i: <Zap className="h-6 w-6" />,
      t: "Chame direto no WhatsApp",
      d: "Um clique e você conversa com o candidato no WhatsApp dele. Sem fila, sem agenda, sem perder o melhor talento para o concorrente.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 md:py-28">
      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp} className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Como funciona</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          Da vaga ao contrato <span className="text-muted-foreground">em 4 passos.</span>
        </h2>
      </motion.div>

      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="mt-14 grid gap-5 md:grid-cols-2"
      >
        {passos.map((p) => (
          <motion.div
            key={p.n} variants={fadeUp}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-7 shadow-soft transition-all"
          >
            <span className="absolute -right-2 -top-2 text-[6rem] font-extrabold leading-none text-secondary/40 sm:text-[7rem]">
              {p.n}
            </span>
            <div className="relative">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-pop">
                {p.i}
              </div>
              <h3 className="mt-5 text-xl font-extrabold tracking-tight">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ============ DIFERENCIAIS ============ */
function Diferenciais() {
  const items = [
    { i: <Brain className="h-5 w-5" />, t: "Match por IA", d: "Modelo treinado com 4M de perfis brasileiros. Acerta mais que humanos." },
    { i: <MapPin className="h-5 w-5" />, t: "Geolocalização real", d: "Filtra candidatos no raio que você definir — do bairro à cidade inteira." },
    { i: <Video className="h-5 w-5" />, t: "Vídeo-currículo padrão", d: "Toda candidatura vem com 60s de vídeo. Você economiza a primeira entrevista." },
    { i: <ShieldCheck className="h-5 w-5" />, t: "Anti-fraude integrada", d: "IA detecta currículos inflados, salários impossíveis e perfis falsos." },
    { i: <Filter className="h-5 w-5" />, t: "Perguntas personalizadas", d: "Crie filtros eliminatórios automáticos: CNH, disponibilidade, idioma." },
    { i: <Bell className="h-5 w-5" />, t: "Notificação em tempo real", d: "Receba alerta no WhatsApp quando um candidato 5-estrelas se cadastrar." },
    { i: <BarChart3 className="h-5 w-5" />, t: "Dashboard de funil", d: "Veja onde candidatos desistem e otimize sua descrição de vaga." },
    { i: <Sparkles className="h-5 w-5" />, t: "Página da empresa", d: "Branding completo com logo, cor e história — atraia melhor talento." },
  ];

  return (
    <section className="bg-primary py-14 text-primary-foreground sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp} className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[oklch(0.85_0.18_140)]">O que vem com sua assinatura</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
            Tudo o que falta nos outros <br />
            <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_220)] bg-clip-text text-transparent">vem de fábrica aqui.</span>
          </h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map((i) => (
            <motion.div
              key={i.t} variants={fadeUp}
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.85_0.18_140)]/15 text-[oklch(0.85_0.18_140)]">
                {i.i}
              </div>
              <h3 className="mt-4 text-base font-extrabold">{i.t}</h3>
              <p className="mt-1.5 text-sm text-white/70">{i.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============ COMPARATIVO ============ */
function Comparativo() {
  const linhas = [
    { f: "Modelo de cobrança", o: "Por contato (R$ 19 cada)", n: "Mensalidade fixa, contatos ilimitados no Full" },
    { f: "Vídeo-currículo", o: "Raro ou opcional", n: "Padrão em 100% dos perfis" },
    { f: "Match por IA", o: "Filtros básicos", n: "IA treinada com 4M perfis brasileiros" },
    { f: "Geolocalização", o: "Cidade apenas", n: "Bairro + raio customizável" },
    { f: "Anti-fraude", o: "Manual", n: "Automática, em cada perfil" },
    { f: "Página da empresa", o: "Genérica", n: "Personalizada com sua marca" },
    { f: "Suporte", o: "E-mail (3-5 dias)", n: "WhatsApp · resposta em até 2h" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20 md:py-28">
      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp} className="text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Comparativo</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          Por que migrar dos portais antigos?
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }}
        className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
      >
        <div className="grid grid-cols-[1.2fr_1fr_1.2fr] gap-px bg-border text-xs sm:text-sm">
          <div className="bg-card p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:p-4 sm:text-xs">Recurso</div>
          <div className="bg-card p-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground sm:p-4 sm:text-xs">Outros portais</div>
          <div className="bg-primary p-3 text-[10px] font-bold uppercase tracking-wider text-primary-foreground sm:p-4 sm:text-xs">VagasAgora</div>
          {linhas.map((l, idx) => (
            <FragmentRow key={idx} {...l} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function FragmentRow({ f, o, n }: { f: string; o: string; n: string }) {
  return (
    <>
      <div className="bg-card p-3 text-sm font-bold sm:p-4">{f}</div>
      <div className="bg-card p-3 text-sm text-muted-foreground sm:p-4">{o}</div>
      <div className="bg-card p-3 text-sm font-semibold text-foreground sm:p-4">
        <span className="inline-flex items-start gap-1.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {n}
        </span>
      </div>
    </>
  );
}

/* ============ PLANOS (preview) ============ */
function Planos() {
  return (
    <section className="bg-secondary/40 py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp} className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Planos</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
            Uma mensalidade. <span className="text-muted-foreground">Contratações ilimitadas.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Comece com <strong className="text-foreground">10 contatos grátis</strong>. Depois, escolha o plano que faz sentido pro tamanho do seu time.
          </p>
        </motion.div>

        {/* Banner de escassez / oferta de lançamento */}
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-2xl border-2 border-accent/40 bg-gradient-to-r from-accent/10 via-primary/5 to-accent/10 px-4 py-3 text-center text-xs font-bold text-foreground sm:text-sm"
        >
          <span className="inline-flex items-center gap-1.5 text-accent">
            <Flame className="h-4 w-4" /> Oferta de lançamento
          </span>
          <span className="hidden sm:inline opacity-40">•</span>
          <span>
            Restam apenas <span className="rounded bg-accent/20 px-2 py-0.5 text-accent">7 vagas</span> nesse preço
          </span>
          <span className="hidden sm:inline opacity-40">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Reajuste em breve
          </span>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {[
            {
              nome: "Free", preco: "R$ 0", sub: "para experimentar",
              items: ["10 contatos liberados", "1 vaga ativa", "Suporte por e-mail"],
              destaque: false,
            },
            {
              nome: "Básico", preco: "R$ 99", sub: "por mês · ou R$ 950/ano",
              items: ["100 contatos/mês", "5 vagas ativas", "Página personalizada", "Notificações em tempo real"],
              destaque: true, badge: "MAIS POPULAR",
            },
            {
              nome: "Full", preco: "R$ 299", sub: "por mês · ou R$ 2.870/ano",
              items: ["Contatos ilimitados", "Vagas ilimitadas", "Match automático por IA", "Anti-fraude + salário sugerido", "Suporte prioritário"],
              destaque: false,
            },
          ].map((p) => (
            <motion.div
              key={p.nome} variants={fadeUp} whileHover={{ y: -4 }}
              className={`relative rounded-3xl border-2 p-6 shadow-soft transition-all sm:p-7 ${
                p.destaque
                  ? "border-primary bg-primary text-primary-foreground shadow-pop"
                  : "border-border bg-card"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-extrabold uppercase text-accent-foreground">
                  {p.badge}
                </span>
              )}
              <h3 className="text-lg font-extrabold">{p.nome}</h3>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">{p.preco}</span>
              </div>
              <p className={`text-xs ${p.destaque ? "opacity-80" : "text-muted-foreground"}`}>{p.sub}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${p.destaque ? "" : "text-accent"}`} />
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                to="/planos"
                className={`mt-6 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl px-5 py-3 text-sm font-bold transition active:scale-[0.98] ${
                  p.destaque
                    ? "bg-white text-primary shadow-pop"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                Assinar {p.nome} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fadeUp}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Pagando anual você economiza <strong className="text-accent">20%</strong>. Pix, cartão ou boleto. Sem fidelidade.
        </motion.p>
      </div>
    </section>
  );
}

/* ============ RESULTADOS ============ */
function Resultados() {
  const cases = [
    {
      e: "Construtora Lima", c: "Construção civil · SP",
      r: "De 32 para 9 dias no tempo médio de contratação. Reduzimos 70% o custo por vaga preenchida.",
      n: "Beatriz Oliveira", p: "Head de RH",
      color: "oklch(0.7 0.15 30)",
    },
    {
      e: "Rede MaisCasa", c: "Varejo · 14 unidades",
      r: "Saímos de 4 portais pagos para apenas a VagasAgora. Custo por contratação caiu 60%.",
      n: "Rafael Mendes", p: "Diretor de Operações",
      color: "oklch(0.7 0.15 320)",
    },
    {
      e: "Clínica Albert+", c: "Saúde · Multi-unidade",
      r: "O vídeo-currículo eliminou nossa primeira entrevista. Economizamos 1.200 horas/ano em triagem.",
      n: "Camila Souza", p: "Gerente de Pessoas",
      color: "oklch(0.7 0.15 200)",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 md:py-28">
      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        variants={fadeUp} className="mx-auto max-w-2xl text-center"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Resultados</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          Empresas que pararam de perder talento.
        </h2>
      </motion.div>

      <motion.div
        initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        className="mt-12 grid gap-5 md:grid-cols-3"
      >
        {cases.map((c) => (
          <motion.figure
            key={c.e} variants={fadeUp} whileHover={{ y: -4 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="flex gap-0.5 text-[oklch(0.85_0.18_85)]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-4 text-base font-bold leading-snug">{c.e}</p>
            <p className="text-xs text-muted-foreground">{c.c}</p>
            <blockquote className="mt-4 text-sm leading-relaxed text-foreground/85">"{c.r}"</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full ring-2 ring-border" style={{ background: c.color }} />
              <div className="text-xs">
                <p className="font-bold">{c.n}</p>
                <p className="text-muted-foreground">{c.p}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}

/* ============ FAQ ============ */
function FAQ() {
  const faq = [
    {
      q: "Eu preciso pagar pra começar?",
      a: "Não. Você cria conta grátis, recebe 10 contatos liberados pra testar e só assina quando quiser escalar. Sem cartão de crédito no cadastro.",
    },
    {
      q: "Como funciona a cobrança da mensalidade?",
      a: "Você assina o plano Básico (R$ 99/mês) ou Full (R$ 299/mês) pelo Asaas. Pode pagar via cartão, Pix ou boleto. No anual, 20% de desconto.",
    },
    {
      q: "E se eu não contratar ninguém num mês?",
      a: "A mensalidade continua, mas você pode pausar a qualquer momento — sem multa, sem burocracia. Diferente do modelo 'por contato', você não 'perde dinheiro' por mês parado.",
    },
    {
      q: "Os candidatos são reais?",
      a: "Sim. Cada perfil passa por validação (WhatsApp + verificação cruzada de dados) e nossa IA anti-fraude marca perfis suspeitos antes de você ver.",
    },
    {
      q: "Posso publicar quantas vagas quiser?",
      a: "No Básico, até 5 vagas ativas. No Full, ilimitado. Você pode pausar e ativar vagas sem custo extra.",
    },
    {
      q: "Tenho integração com meu ATS ou Excel?",
      a: "Sim. Exportamos candidatos em CSV. Para volume (100+ contratações/mês), temos API e integração customizada — fale com o time comercial.",
    },
    {
      q: "É seguro do ponto de vista da LGPD?",
      a: "Sim. Somos compliant com a LGPD, o candidato dá consentimento explícito, e você só vê os dados de quem optou por se candidatar à sua vaga.",
    },
    {
      q: "Posso cancelar quando quiser?",
      a: "Quando quiser. Sem multa de fidelidade, sem letras miúdas. Cancela em 1 clique no painel.",
    },
  ];

  return (
    <section className="bg-secondary/40 py-14 sm:py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp} className="text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Perguntas frequentes</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-5xl">
            Tire suas dúvidas.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="mt-10 space-y-3"
        >
          {faq.map((f) => (
            <motion.details
              key={f.q} variants={fadeUp}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition-all open:shadow-pop"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-bold sm:text-base">
                {f.q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition group-open:rotate-45">
                  <span className="text-lg leading-none">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============ CTA FINAL ============ */
function CTAFinal() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        className="relative overflow-hidden rounded-[2rem] bg-primary p-8 text-center text-primary-foreground shadow-pop sm:p-12 md:p-16"
      >
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
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <ThumbsUp className="h-3.5 w-3.5 text-[oklch(0.85_0.18_140)]" /> 10 contatos grátis · sem cartão
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl md:text-6xl">
            Pronto pra <span className="bg-gradient-to-r from-white to-[oklch(0.78_0.14_220)] bg-clip-text text-transparent">parar de perder tempo?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/80">
            Comece grátis hoje. Em 48h você tem candidatos qualificados no seu WhatsApp.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/empresa"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-primary shadow-pop transition active:scale-[0.98] sm:w-auto"
            >
              Criar conta grátis
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/planos"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-7 py-4 text-base font-bold text-white backdrop-blur-md transition hover:bg-white/10 sm:w-auto"
            >
              <Users className="h-5 w-5" /> Ver planos
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
