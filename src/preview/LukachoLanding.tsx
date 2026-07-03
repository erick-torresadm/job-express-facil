import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CONTENT as C } from "./_shared";

// SKIPER · NEON NOIR — preto profundo, um único acento verde-neon, glass afiado.
export default function LukachoLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-[500px] w-[500px] rounded-full bg-[#00FF88]/15 blur-3xl" />
        <div className="absolute right-0 top-60 h-[560px] w-[560px] rounded-full bg-[#00FF88]/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)" }} />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#00FF88] text-sm text-black">V</span>
          <span className="tracking-tight">{C.brand}</span>
        </div>
        <nav className="hidden gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1.5 backdrop-blur md:flex">
          {["Vagas", "Empresas", "Blog", "Preços"].map((n) => (
            <a key={n} href="#" className="rounded-full px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">{n}</a>
          ))}
        </nav>
        <Link to="/auth" className="rounded-full bg-[#00FF88] px-5 py-2 text-sm font-semibold text-black transition hover:bg-white">Entrar</Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs backdrop-blur">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF88] opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00FF88]" /></span>
              {C.tagline}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              className="mt-8 text-5xl font-semibold leading-[1.02] tracking-[-0.03em] md:text-7xl"
              style={{ fontFamily: "'Outfit', system-ui" }}
            >
              <span className="bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">Vagas CLT em empresas contratando </span>
              <span className="text-[#00FF88]">agora.</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="mt-6 max-w-xl text-lg text-white/60">
              {C.sub}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="mt-10 flex flex-wrap gap-3">
              <Link to="/cadastro" className="group inline-flex items-center gap-2 rounded-full bg-[#00FF88] px-7 py-3.5 font-semibold text-black shadow-[0_0_50px_rgba(0,255,136,0.4)] transition hover:scale-[1.03]">
                {C.ctaPrimary} <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link to="/empresa" className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold backdrop-blur transition hover:bg-white/10">
                {C.ctaSecondary}
              </Link>
            </motion.div>
          </div>

          {/* Live-activity glass card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
            className="relative rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Ao vivo agora</span>
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00FF88]" />
            </div>
            <ul className="space-y-3">
              {[
                { n: "Marcos", a: "acabou de ser chamado", t: "há 12s", c: "#00FF88" },
                { n: "Ana", a: "aplicou em Recepcionista", t: "há 34s", c: "#88FFC5" },
                { n: "Rafa", a: "gravou currículo em áudio", t: "há 1min", c: "#00FF88" },
                { n: "Julia", a: "conseguiu vaga CLT", t: "há 2min", c: "#88FFC5" },
              ].map((r, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-black" style={{ background: r.c }}>{r.n[0]}</span>
                  <div className="flex-1 text-sm"><span className="font-semibold">{r.n}</span> <span className="text-white/60">{r.a}</span></div>
                  <span className="text-xs text-white/40">{r.t}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.02] backdrop-blur-xl">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {C.stats.map((s, i) => (
              <div key={s.l} className={`p-8 ${i > 0 ? "md:border-l border-white/5" : ""} ${i > 1 || i === 1 ? "border-t md:border-t-0 border-white/5" : ""}`}>
                <div className="text-4xl font-semibold tracking-tight">{s.n}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.02em] md:text-5xl" style={{ fontFamily: "'Outfit', system-ui" }}>Rápido. Direto. <span className="text-[#00FF88]">Certeiro.</span></h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <motion.div key={p.t} whileHover={{ y: -6 }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00FF88]/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="text-6xl font-black text-white/10">0{i + 1}</div>
                <h3 className="mt-2 text-xl font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-white/60">{p.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ fontFamily: "'Outfit', system-ui" }}>Profissões em alta</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {C.profissoes.map((p) => (
            <span key={p} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#00FF88]/60 hover:text-[#00FF88]">
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d) => (
            <div key={d.n} className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
              <div className="text-4xl leading-none text-[#00FF88]">"</div>
              <p className="mt-2 text-white/90">{d.t}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00FF88] to-emerald-600" />
                <div>
                  <div className="text-sm font-semibold">{d.n}</div>
                  <div className="text-xs text-white/50">{d.c}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-24">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-12 text-center backdrop-blur-xl">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#00FF88]/20 via-transparent to-emerald-500/20" />
          <h2 className="text-4xl font-semibold tracking-[-0.02em] md:text-5xl" style={{ fontFamily: "'Outfit', system-ui" }}>
            Sua próxima vaga <span className="text-[#00FF88]">está a 1 minuto.</span>
          </h2>
          <p className="mt-3 text-white/70">Perfil grátis. Empresas te chamam no WhatsApp.</p>
          <Link to="/cadastro" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#00FF88] px-7 py-3.5 font-semibold text-black">
            {C.ctaPrimary} →
          </Link>
        </div>
      </section>
    </div>
  );
}
