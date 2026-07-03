import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CONTENT as C } from "./_shared";

// SKIPER · AURORA LIGHT — versão clara, aurora suave em tons pastel, glass sobre off-white.
export default function BlankLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFAF7] text-neutral-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[520px] w-[520px] rounded-full bg-[#FFD9E8] opacity-70 blur-3xl" />
        <div className="absolute right-0 top-32 h-[600px] w-[600px] rounded-full bg-[#D9E7FF] opacity-70 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-[#E4D9FF] opacity-60 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-neutral-900 text-sm text-white">V</span>
          <span className="tracking-tight">{C.brand}</span>
        </div>
        <nav className="hidden gap-1 rounded-full border border-neutral-200 bg-white/60 px-2 py-1.5 backdrop-blur md:flex">
          {["Vagas", "Empresas", "Blog", "Preços"].map((n) => (
            <a key={n} href="#" className="rounded-full px-4 py-1.5 text-sm text-neutral-700 transition hover:bg-neutral-900 hover:text-white">{n}</a>
          ))}
        </nav>
        <Link to="/auth" className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800">Entrar</Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 px-4 py-1.5 text-xs backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {C.tagline}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="mx-auto mt-8 max-w-4xl text-5xl font-medium leading-[1.02] tracking-[-0.03em] md:text-7xl"
          style={{ fontFamily: "'Outfit', system-ui" }}
        >
          Vagas <em className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text not-italic text-transparent">CLT</em> em empresas que estão contratando <span className="italic text-neutral-500">hoje.</span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="mx-auto mt-6 max-w-xl text-lg text-neutral-600">
          {C.sub}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/cadastro" className="group inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-semibold text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] transition hover:scale-[1.03]">
            {C.ctaPrimary} <span className="transition group-hover:translate-x-1">→</span>
          </Link>
          <Link to="/empresa" className="rounded-full border border-neutral-300 bg-white/70 px-7 py-3.5 font-semibold backdrop-blur transition hover:bg-white">
            {C.ctaSecondary}
          </Link>
        </motion.div>

        {/* Floating glass stat card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
          className="relative mx-auto mt-20 max-w-4xl rounded-[28px] border border-white/60 bg-white/50 p-6 shadow-[0_30px_80px_-30px_rgba(80,60,120,0.25)] backdrop-blur-2xl"
        >
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {C.stats.map((s) => (
              <div key={s.l} className="rounded-2xl border border-neutral-200/60 bg-white/70 p-5 text-left">
                <div className="text-3xl font-semibold tracking-tight">{s.n}</div>
                <div className="mt-1 text-xs uppercase tracking-widest text-neutral-500">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-medium tracking-[-0.02em] md:text-5xl" style={{ fontFamily: "'Outfit', system-ui" }}>
            Sem burocracia. <span className="italic text-neutral-500">Nunca.</span>
          </h2>
          <p className="mt-3 text-neutral-600">Três passos, um minuto, entrevista já no WhatsApp.</p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-neutral-200/70 bg-white/70 p-8 backdrop-blur-xl"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-indigo-500 text-sm font-bold text-white">{i + 1}</div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight">{p.t}</h3>
              <p className="mt-2 text-sm text-neutral-600">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-medium tracking-tight md:text-4xl" style={{ fontFamily: "'Outfit', system-ui" }}>Profissões em alta agora</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {C.profissoes.map((p) => (
            <span key={p} className="rounded-full border border-neutral-200 bg-white/60 px-4 py-2 text-sm text-neutral-700 backdrop-blur transition hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-white">
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d) => (
            <div key={d.n} className="rounded-3xl border border-neutral-200/70 bg-white/70 p-8 backdrop-blur-xl">
              <div className="text-4xl leading-none text-rose-400">"</div>
              <p className="mt-2 text-neutral-800">{d.t}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-400 to-indigo-500" />
                <div>
                  <div className="text-sm font-semibold">{d.n}</div>
                  <div className="text-xs text-neutral-500">{d.c}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-24">
        <div className="rounded-[32px] border border-white/60 bg-gradient-to-br from-rose-200/60 via-fuchsia-200/60 to-indigo-200/60 p-12 text-center backdrop-blur-xl">
          <h2 className="text-4xl font-medium tracking-[-0.02em] md:text-5xl" style={{ fontFamily: "'Outfit', system-ui" }}>Comece agora, é grátis</h2>
          <p className="mt-3 text-neutral-700">Cadastro em 1 minuto. Sem cartão, sem enrolação.</p>
          <Link to="/cadastro" className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3.5 font-semibold text-white">
            {C.ctaPrimary} →
          </Link>
        </div>
      </section>
    </div>
  );
}
