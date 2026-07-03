import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CONTENT as C } from "./_shared";

// ANIMMASTER / ANIMATA — muitos gradientes animados, cards com hover 3D, movimento constante.
export default function AnimMasterLanding() {
  return (
    <div className="min-h-screen bg-[#0F0F14] text-white">
      {/* Animated gradient header */}
      <header className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 opacity-70"
          animate={{
            background: [
              "linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)",
              "linear-gradient(135deg, #3A86FF 0%, #FF006E 50%, #FFBE0B 100%)",
              "linear-gradient(135deg, #FFBE0B 0%, #3A86FF 50%, #8338EC 100%)",
              "linear-gradient(135deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-xl font-black tracking-tight">✦ {C.brand}</div>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#">Vagas</a><a href="#">Empresas</a><a href="#">Blog</a>
          </nav>
          <Link to="/auth" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black">Entrar</Link>
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur"
          >
            ⚡ {C.tagline}
          </motion.span>

          <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            {C.headline.split(" ").map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="mr-3 inline-block"
              >
                {w}
              </motion.span>
            ))}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">{C.sub}</p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/cadastro" className="inline-block rounded-full bg-white px-7 py-3.5 font-bold text-black">
                {C.ctaPrimary} →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/empresa" className="inline-block rounded-full border-2 border-white px-7 py-3.5 font-bold">
                {C.ctaSecondary}
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Stats with animated gradient borders */}
      <section className="mx-auto -mt-12 max-w-6xl px-6">
        <div className="grid gap-4 md:grid-cols-4">
          {C.stats.map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8, rotateX: 4 }}
              className="relative rounded-2xl bg-[#1A1A24] p-6"
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-60"
                style={{
                  background: `conic-gradient(from ${i * 90}deg, #FF006E, #8338EC, #3A86FF, #FF006E)`,
                  padding: 1.5,
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative text-4xl font-black">{s.n}</div>
              <div className="relative mt-1 text-xs uppercase tracking-widest text-white/50">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-4xl font-black">
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Simples assim
          </span>
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <motion.div
              key={p.t}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl bg-[#1A1A24] p-8"
            >
              <motion.div
                className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-2xl"
                style={{ background: ["#FF006E", "#8338EC", "#3A86FF"][i] }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              />
              <div className="relative">
                <div className="text-6xl font-black text-white/10">0{i + 1}</div>
                <h3 className="mt-2 text-2xl font-black">{p.t}</h3>
                <p className="mt-2 text-white/60">{p.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap justify-center gap-2">
          {C.profissoes.map((p, i) => (
            <motion.span
              key={p}
              whileHover={{ scale: 1.1, rotate: (i % 2 ? 2 : -2) }}
              className="cursor-pointer rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-4 py-2 text-sm font-medium ring-1 ring-white/10"
            >
              {p}
            </motion.span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d, i) => (
            <motion.div
              key={d.n}
              whileHover={{ y: -6, rotateZ: (i - 1) * 1 }}
              className="rounded-3xl bg-gradient-to-br from-[#1A1A24] to-[#2A1A34] p-6"
            >
              <div className="mb-3 flex text-yellow-400">{"★★★★★"}</div>
              <p className="text-white/90">"{d.t}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500" />
                <div>
                  <div className="text-sm font-bold">{d.n}</div>
                  <div className="text-xs text-white/50">{d.c}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl overflow-hidden px-6 py-20">
        <motion.div
          className="absolute inset-6 rounded-3xl opacity-70"
          animate={{
            background: [
              "linear-gradient(135deg, #FF006E, #8338EC)",
              "linear-gradient(135deg, #8338EC, #3A86FF)",
              "linear-gradient(135deg, #3A86FF, #FF006E)",
              "linear-gradient(135deg, #FF006E, #8338EC)",
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative rounded-3xl bg-black/40 p-12 text-center backdrop-blur">
          <h2 className="text-4xl font-black">Vem pra dentro 🚀</h2>
          <p className="mt-3 text-white/80">Perfil em 1 minuto. Empresas te chamam no WhatsApp.</p>
          <Link to="/cadastro" className="mt-6 inline-block rounded-full bg-white px-8 py-4 font-bold text-black">
            {C.ctaPrimary} →
          </Link>
        </div>
      </section>
    </div>
  );
}
