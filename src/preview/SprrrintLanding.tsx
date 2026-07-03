import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CONTENT as C } from "./_shared";

// SKIPER · EDITORIAL CINEMA — serif display, aurora quente âmbar/rosa, ritmo de revista.
export default function SprrrintLanding() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={ref} className="relative min-h-screen overflow-hidden bg-[#0B0908] text-[#F5EEE3]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-[#FF7A45]/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-[600px] w-[600px] rounded-full bg-[#FFB86B]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-[#E64980]/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F5EEE3] text-sm text-black" style={{ fontFamily: "'Outfit', serif" }}>V</span>
          <span className="tracking-tight" style={{ fontFamily: "'Outfit', serif" }}>{C.brand}</span>
        </div>
        <nav className="hidden gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 backdrop-blur md:flex">
          {["Vagas", "Empresas", "Blog", "Preços"].map((n) => (
            <a key={n} href="#" className="rounded-full px-4 py-1.5 text-sm text-[#F5EEE3]/70 transition hover:bg-white/10 hover:text-[#F5EEE3]">{n}</a>
          ))}
        </nav>
        <Link to="/auth" className="rounded-full bg-[#F5EEE3] px-5 py-2 text-sm font-semibold text-black transition hover:bg-white">Entrar</Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
          <span className="h-1 w-6 bg-[#FF7A45]" /> Edição 001 · {C.tagline}
        </motion.div>

        <motion.h1
          style={{ y }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.8 } }}
          className="mx-auto mt-8 max-w-5xl text-6xl font-light leading-[0.98] tracking-[-0.04em] md:text-[110px]"
          style={{ fontFamily: "'Outfit', 'Georgia', serif" }}
        >
          A vaga certa,<br />
          <em className="bg-gradient-to-r from-[#FF7A45] via-[#FFB86B] to-[#E64980] bg-clip-text text-transparent">no seu tempo.</em>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }} className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-[#F5EEE3]/70">
          {C.sub}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/cadastro" className="group inline-flex items-center gap-2 rounded-full bg-[#F5EEE3] px-7 py-3.5 font-semibold text-black shadow-[0_20px_60px_-15px_rgba(255,122,69,0.5)] transition hover:scale-[1.03]">
            {C.ctaPrimary} <span className="transition group-hover:translate-x-1">→</span>
          </Link>
          <Link to="/empresa" className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold backdrop-blur transition hover:bg-white/10">
            {C.ctaSecondary}
          </Link>
        </motion.div>

        {/* Editorial magazine strip */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
          className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-2xl md:grid-cols-4"
        >
          {C.stats.map((s) => (
            <div key={s.l} className="bg-[#0B0908]/70 p-6 text-left backdrop-blur-xl">
              <div className="text-4xl font-light tracking-tight" style={{ fontFamily: "'Outfit', serif" }}>{s.n}</div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#F5EEE3]/50">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14 flex items-baseline justify-between gap-6 border-b border-white/10 pb-6">
          <span className="text-xs uppercase tracking-[0.3em] text-[#F5EEE3]/50">§ Como funciona</span>
          <span className="text-xs uppercase tracking-[0.3em] text-[#F5EEE3]/50">01 — 03</span>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <motion.article
              key={p.t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-5xl font-light text-[#FF7A45]" style={{ fontFamily: "'Outfit', serif" }}>0{i + 1}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#F5EEE3]/40">passo</span>
              </div>
              <h3 className="mt-5 text-2xl font-light tracking-tight" style={{ fontFamily: "'Outfit', serif" }}>{p.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F5EEE3]/70">{p.d}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-light tracking-tight md:text-5xl" style={{ fontFamily: "'Outfit', serif" }}>
          Profissões <em className="text-[#FF7A45]">em alta</em>
        </h2>
        <div className="mt-10 flex flex-wrap gap-2">
          {C.profissoes.map((p) => (
            <span key={p} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#F5EEE3]/80 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#FF7A45]/50 hover:text-[#FF7A45]">
              {p}
            </span>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d, i) => (
            <motion.div key={d.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
              <div className="text-6xl leading-none text-[#FF7A45]" style={{ fontFamily: "'Outfit', serif" }}>"</div>
              <p className="-mt-3 text-lg leading-relaxed" style={{ fontFamily: "'Outfit', serif" }}>{d.t}</p>
              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF7A45] to-[#E64980]" />
                <div>
                  <div className="text-sm font-semibold">{d.n}</div>
                  <div className="text-xs text-[#F5EEE3]/50">{d.c}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-24">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-[#FF7A45]/25 via-[#E64980]/20 to-[#FFB86B]/25 p-14 text-center backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-[#F5EEE3]/60">Última página</p>
          <h2 className="mt-4 text-5xl font-light leading-tight tracking-[-0.02em] md:text-6xl" style={{ fontFamily: "'Outfit', serif" }}>
            Sua próxima<br /><em className="text-[#FFB86B]">história começa aqui.</em>
          </h2>
          <Link to="/cadastro" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F5EEE3] px-8 py-4 font-semibold text-black">
            {C.ctaPrimary} →
          </Link>
        </div>
      </section>
    </div>
  );
}
