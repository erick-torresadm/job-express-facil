import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CONTENT as C } from "./_shared";

// SKIPER UI — glass, gradientes suaves, cards flutuantes, micro-interações elegantes.
export default function SkiperLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A18] text-white">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute right-0 top-40 h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 text-sm">V</span>
          {C.brand}
        </div>
        <nav className="hidden gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur md:flex">
          {["Vagas", "Empresas", "Blog", "Preços"].map((n) => (
            <a key={n} href="#" className="rounded-full px-4 py-1.5 text-sm text-white/80 transition hover:bg-white/10">{n}</a>
          ))}
        </nav>
        <Link to="/auth" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-white/90">
          Entrar
        </Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs backdrop-blur"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> {C.tagline}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="mx-auto mt-8 max-w-4xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-5xl font-semibold leading-[1.05] tracking-tight text-transparent md:text-7xl"
        >
          {C.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="mx-auto mt-6 max-w-xl text-lg text-white/60"
        >
          {C.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <Link to="/cadastro" className="group relative inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black shadow-[0_0_40px_rgba(255,255,255,0.3)] transition hover:scale-105">
            {C.ctaPrimary} <span className="transition group-hover:translate-x-1">→</span>
          </Link>
          <Link to="/empresa" className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-semibold backdrop-blur transition hover:bg-white/10">
            {C.ctaSecondary}
          </Link>
        </motion.div>

        {/* Floating glass card mock */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          className="relative mx-auto mt-20 max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {C.stats.map((s) => (
              <div key={s.l} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-4 text-left">
                <div className="text-3xl font-semibold">{s.n}</div>
                <div className="mt-1 text-xs text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-4xl font-semibold tracking-tight">Simples, rápido, sem burocracia</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 text-sm font-bold">
                {i + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-white/60">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-4xl font-semibold tracking-tight">Profissões em alta</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {C.profissoes.map((p) => (
            <span key={p} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:border-white/30 hover:bg-white/10">
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d) => (
            <div key={d.n} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8 backdrop-blur-xl">
              <p className="text-lg leading-relaxed text-white/90">"{d.t}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
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
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 p-12 text-center backdrop-blur-xl">
          <h2 className="text-4xl font-semibold tracking-tight">Comece agora, é grátis</h2>
          <p className="mt-3 text-white/60">Cadastro em 1 minuto. Sem cartão, sem enrolação.</p>
          <Link to="/cadastro" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black">
            {C.ctaPrimary} →
          </Link>
        </div>
      </section>
    </div>
  );
}
