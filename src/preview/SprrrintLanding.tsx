import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { CONTENT as C } from "./_shared";

// SPRRRINT — display type gigante, kinetic type, blocos pretos ousados, splits contrastantes.
export default function SprrrintLanding() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <div className="min-h-screen bg-black font-sans text-white" ref={ref}>
      <header className="flex items-center justify-between border-b border-white/20 px-6 py-4">
        <span className="text-xs uppercase tracking-[0.3em]">◉ {C.brand}</span>
        <span className="text-xs uppercase tracking-[0.3em] text-white/50">BR — 2026</span>
        <Link to="/auth" className="text-xs uppercase tracking-[0.3em] hover:text-lime-300">Entrar ↗</Link>
      </header>

      <section className="relative overflow-hidden px-6 pt-16">
        <motion.h1
          style={{ x }}
          className="whitespace-nowrap text-[22vw] font-black leading-[0.85] tracking-tighter"
        >
          VAGA<span className="text-lime-300">*</span>AGORA
        </motion.h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">// {C.tagline}</p>
            <p className="mt-4 text-2xl font-light leading-tight md:text-3xl">{C.headline}.</p>
          </div>
          <p className="text-base leading-relaxed text-white/70">{C.sub}</p>
        </div>
        <div className="mt-12 flex flex-wrap gap-3 pb-16">
          <Link to="/cadastro" className="group relative overflow-hidden bg-lime-300 px-8 py-5 text-sm font-bold uppercase tracking-widest text-black">
            <span className="relative z-10">{C.ctaPrimary} →</span>
          </Link>
          <Link to="/empresa" className="border border-white/40 px-8 py-5 text-sm font-bold uppercase tracking-widest hover:border-white">
            {C.ctaSecondary}
          </Link>
        </div>
      </section>

      <section className="border-y border-white/20 py-2">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap text-6xl font-black uppercase"
        >
          {[...C.profissoes, ...C.profissoes].map((p, i) => (
            <span key={i} className="mx-8">
              {p} <span className="text-lime-300">✱</span>
            </span>
          ))}
        </motion.div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4">
        {C.stats.map((s, i) => (
          <div key={s.l} className={`border-b border-r border-white/20 p-10 ${i % 2 ? "bg-white text-black" : ""}`}>
            <div className="text-6xl font-black leading-none tracking-tighter">{s.n}</div>
            <div className={`mt-3 text-xs uppercase tracking-[0.3em] ${i % 2 ? "text-black/60" : "text-white/50"}`}>{s.l}</div>
          </div>
        ))}
      </section>

      <section className="px-6 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">§ 01 — Como funciona</p>
        <div className="mt-8 space-y-2">
          {C.passos.map((p, i) => (
            <motion.div
              key={p.t}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-baseline gap-6 border-b border-white/20 py-6 hover:border-lime-300"
            >
              <span className="text-xs text-white/40">0{i + 1}</span>
              <h3 className="text-5xl font-black tracking-tighter transition group-hover:translate-x-4 group-hover:text-lime-300 md:text-7xl">{p.t.toUpperCase()}</h3>
              <p className="ml-auto hidden max-w-xs text-sm text-white/60 md:block">{p.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3">
        {C.depoimentos.map((d, i) => (
          <div key={d.n} className={`border-t border-white/20 p-10 md:border-r ${i === 1 ? "bg-lime-300 text-black" : ""}`}>
            <div className="text-4xl">"</div>
            <p className="mt-4 text-xl font-medium leading-snug">{d.t}</p>
            <div className="mt-8 text-xs uppercase tracking-[0.3em] opacity-70">{d.n} · {d.c}</div>
          </div>
        ))}
      </section>

      <section className="border-t border-white/20 px-6 py-32 text-center">
        <h2 className="text-[15vw] font-black leading-[0.85] tracking-tighter">
          BORA?<span className="text-lime-300">_</span>
        </h2>
        <Link to="/cadastro" className="mt-8 inline-block bg-lime-300 px-10 py-6 text-sm font-bold uppercase tracking-widest text-black">
          Criar perfil grátis →
        </Link>
      </section>
    </div>
  );
}
