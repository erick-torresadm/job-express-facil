import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CONTENT as C } from "./_shared";

// SKIPER · PRISM HOLOGRÁFICO — glass iridescente, borda conic animada, gradiente ciano/violeta/rosa.
export default function AnimMasterLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07070E] text-white">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-40 top-0 h-[560px] w-[560px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #00E5FF55, transparent 70%)" }}
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-0 top-40 h-[600px] w-[600px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #A855F755, transparent 70%)" }}
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[440px] w-[440px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #FF3D8155, transparent 70%)" }}
          animate={{ x: [0, 40, 0], y: [0, 40, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-rose-500 text-sm">V</span>
          <span className="tracking-tight">{C.brand}</span>
        </div>
        <nav className="hidden gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 backdrop-blur md:flex">
          {["Vagas", "Empresas", "Blog", "Preços"].map((n) => (
            <a key={n} href="#" className="rounded-full px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">{n}</a>
          ))}
        </nav>
        <Link to="/auth" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">Entrar</Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> {C.tagline}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="mx-auto mt-8 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.03em] md:text-7xl"
          style={{ fontFamily: "'Outfit', system-ui" }}
        >
          <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">Vagas CLT em empresas que estão </span>
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">contratando hoje.</span>
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="mx-auto mt-6 max-w-xl text-lg text-white/60">
          {C.sub}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }} className="mt-10 flex flex-wrap justify-center gap-3">
          <PrismButton to="/cadastro" primary>{C.ctaPrimary} →</PrismButton>
          <Link to="/empresa" className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 font-semibold backdrop-blur transition hover:bg-white/10">
            {C.ctaSecondary}
          </Link>
        </motion.div>

        {/* Prism stats card */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }} className="relative mx-auto mt-20 max-w-4xl">
          <ConicBorder>
            <div className="grid grid-cols-2 gap-4 rounded-[26px] bg-[#07070E]/80 p-6 backdrop-blur-2xl md:grid-cols-4">
              {C.stats.map((s) => (
                <div key={s.l} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-5 text-left">
                  <div className="text-3xl font-semibold">{s.n}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-white/50">{s.l}</div>
                </div>
              ))}
            </div>
          </ConicBorder>
        </motion.div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.02em] md:text-5xl" style={{ fontFamily: "'Outfit', system-ui" }}>
            Três passos. <span className="bg-gradient-to-r from-cyan-400 to-rose-400 bg-clip-text text-transparent">Um minuto.</span>
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <motion.div key={p.t} whileHover={{ y: -8 }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
              <motion.div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40 blur-2xl"
                style={{ background: ["#00E5FF", "#A855F7", "#FF3D81"][i] }}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 5, repeat: Infinity, delay: i * 0.6 }}
              />
              <div className="relative">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-rose-500 text-sm font-bold">{i + 1}</div>
                <h3 className="mt-5 text-xl font-semibold">{p.t}</h3>
                <p className="mt-2 text-sm text-white/60">{p.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight md:text-4xl" style={{ fontFamily: "'Outfit', system-ui" }}>Profissões em alta</h2>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {C.profissoes.map((p, i) => (
            <motion.span
              key={p}
              whileHover={{ scale: 1.06 }}
              className="cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:border-white/30"
              style={{ background: i % 3 === 0 ? "linear-gradient(90deg, rgba(0,229,255,0.08), rgba(168,85,247,0.08))" : undefined }}
            >
              {p}
            </motion.span>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d, i) => (
            <div key={d.n} className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8 backdrop-blur-xl">
              <div className="mb-3 flex gap-0.5">{[0,1,2,3,4].map((k) => <span key={k} className="text-cyan-400">★</span>)}</div>
              <p className="text-white/90">{d.t}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full" style={{ background: ["linear-gradient(135deg,#00E5FF,#A855F7)","linear-gradient(135deg,#A855F7,#FF3D81)","linear-gradient(135deg,#FF3D81,#00E5FF)"][i] }} />
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
        <ConicBorder>
          <div className="rounded-[26px] bg-[#07070E]/80 p-12 text-center backdrop-blur-2xl">
            <h2 className="text-4xl font-semibold tracking-[-0.02em] md:text-5xl" style={{ fontFamily: "'Outfit', system-ui" }}>
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">Comece agora, é grátis</span>
            </h2>
            <p className="mt-3 text-white/70">Cadastro em 1 minuto. Sem cartão, sem enrolação.</p>
            <div className="mt-8 flex justify-center">
              <PrismButton to="/cadastro" primary>{C.ctaPrimary} →</PrismButton>
            </div>
          </div>
        </ConicBorder>
      </section>
    </div>
  );
}

function ConicBorder({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[28px] p-[1.5px]">
      <motion.div
        className="absolute inset-0 rounded-[28px]"
        style={{ background: "conic-gradient(from 0deg, #00E5FF, #A855F7, #FF3D81, #00E5FF)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-[26px]">{children}</div>
    </div>
  );
}

function PrismButton({ to, children, primary }: { to: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Link
      to={to}
      className="group relative inline-flex overflow-hidden rounded-full p-[1.5px]"
    >
      <motion.span
        className="absolute inset-0"
        style={{ background: "conic-gradient(from 0deg, #00E5FF, #A855F7, #FF3D81, #00E5FF)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      <span className={`relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold ${primary ? "bg-white text-black" : "bg-black text-white"}`}>
        {children}
      </span>
    </Link>
  );
}
