import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { CONTENT as C } from "./_shared";

// LUKACHO UI — neo-brutalismo, cores saturadas, bordas 3px pretas, sombras hard offset.
const HARD = "shadow-[6px_6px_0_0_#000] border-[3px] border-black";

export default function LukachoLanding() {
  return (
    <div className="min-h-screen bg-[#FFF4D6] text-black">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className={`bg-white px-4 py-2 font-black uppercase ${HARD}`}>{C.brand} ✳</div>
        <nav className="hidden gap-2 md:flex">
          {["Vagas", "Empresas", "Blog"].map((n) => (
            <a key={n} href="#" className={`bg-white px-3 py-1.5 text-sm font-bold ${HARD} transition hover:-translate-y-0.5`}>{n}</a>
          ))}
        </nav>
        <Link to="/auth" className={`bg-[#FF5C8A] px-4 py-2 text-sm font-black uppercase text-white ${HARD}`}>Entrar</Link>
      </header>

      <section className="relative mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ rotate: -3, opacity: 0, y: 40 }}
          animate={{ rotate: -2, opacity: 1, y: 0 }}
          className={`inline-block bg-[#3DDC97] px-4 py-1.5 text-xs font-black uppercase ${HARD}`}
        >
          ⚡ {C.tagline}
        </motion.div>

        <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
          Vagas <span className="inline-block -rotate-1 bg-[#FFD93D] px-2">CLT</span> em<br />
          empresas <span className="inline-block rotate-1 bg-[#7C5CFF] px-2 text-white">contratando</span><br />
          <span className="underline decoration-[6px] decoration-[#FF5C8A]">hoje mesmo.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg font-medium">{C.sub}</p>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/cadastro" className={`bg-black px-6 py-4 font-black uppercase text-white ${HARD} transition hover:-translate-y-1`}>
            {C.ctaPrimary} →
          </Link>
          <Link to="/empresa" className={`bg-white px-6 py-4 font-black uppercase ${HARD} transition hover:-translate-y-1`}>
            {C.ctaSecondary}
          </Link>
        </div>

        <motion.div
          animate={{ rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`absolute right-4 top-16 hidden bg-[#FF5C8A] px-3 py-2 text-xs font-black uppercase text-white ${HARD} md:block`}
        >
          Novo! 🎉
        </motion.div>
      </section>

      <section className="border-y-[3px] border-black bg-[#7C5CFF] py-4">
        <div className="flex animate-[marquee_25s_linear_infinite] whitespace-nowrap text-2xl font-black uppercase text-white">
          {[...C.profissoes, ...C.profissoes].map((p, i) => (
            <span key={i} className="mx-6">★ {p}</span>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-16 md:grid-cols-4">
        {C.stats.map((s, i) => (
          <div key={s.l} className={`bg-white p-6 ${HARD}`} style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 1}deg)` }}>
            <div className="text-4xl font-black">{s.n}</div>
            <div className="mt-1 text-sm font-bold uppercase">{s.l}</div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-4xl font-black uppercase">Como funciona ↓</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {C.passos.map((p, i) => (
            <div key={p.t} className={`bg-[${["#FFD93D", "#3DDC97", "#FF5C8A"][i]}] p-6 ${HARD}`}
              style={{ background: ["#FFD93D", "#3DDC97", "#FF5C8A"][i] }}>
              <div className={`mb-4 inline-block bg-white px-3 py-1 text-sm font-black ${HARD}`}>0{i + 1}</div>
              <h3 className="text-2xl font-black">{p.t}</h3>
              <p className="mt-2 font-medium">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-8 text-4xl font-black uppercase">Quem já achou vaga:</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {C.depoimentos.map((d, i) => (
            <div key={d.n} className={`bg-white p-6 ${HARD}`} style={{ transform: `rotate(${(i - 1) * 1.5}deg)` }}>
              <p className="text-lg font-bold">"{d.t}"</p>
              <div className="mt-4 border-t-2 border-black pt-3 text-sm font-black uppercase">{d.n} · {d.c}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className={`bg-black p-10 text-center ${HARD}`}>
          <h3 className="text-4xl font-black uppercase text-white">Bora conseguir<br /><span className="text-[#FFD93D]">essa vaga?</span></h3>
          <Link to="/cadastro" className={`mt-6 inline-block bg-[#FFD93D] px-8 py-4 text-lg font-black uppercase ${HARD}`}>Começar agora →</Link>
        </div>
      </section>
    </div>
  );
}
