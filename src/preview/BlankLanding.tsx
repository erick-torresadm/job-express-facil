import { Link } from "@tanstack/react-router";
import { CONTENT as C } from "./_shared";

// BLANK UI — minimalismo radical, mono type, bordas finas, muito espaço em branco.
export default function BlankLanding() {
  return (
    <div className="min-h-screen bg-white font-mono text-neutral-900 antialiased">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.2em]">
        <span>{C.brand.toLowerCase()}</span>
        <nav className="flex gap-6 text-neutral-500">
          <a href="#">vagas</a><a href="#">empresas</a><a href="#">blog</a>
        </nav>
        <Link to="/auth" className="border border-neutral-900 px-3 py-1.5 hover:bg-neutral-900 hover:text-white">entrar</Link>
      </header>

      <section className="mx-auto max-w-5xl border-t border-neutral-200 px-6 py-24">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">— {C.tagline}</p>
        <h1 className="mt-8 font-sans text-6xl font-light leading-[1.05] tracking-tight md:text-8xl">
          {C.headline.split(" ").slice(0, 3).join(" ")}
          <br />
          <span className="italic text-neutral-400">{C.headline.split(" ").slice(3).join(" ")}</span>
        </h1>
        <p className="mt-10 max-w-xl text-sm leading-relaxed text-neutral-600">{C.sub}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/cadastro" className="border border-neutral-900 bg-neutral-900 px-6 py-3 text-xs uppercase tracking-widest text-white hover:bg-white hover:text-neutral-900">{C.ctaPrimary} →</Link>
          <Link to="/empresa" className="border border-neutral-900 px-6 py-3 text-xs uppercase tracking-widest hover:bg-neutral-900 hover:text-white">{C.ctaSecondary}</Link>
        </div>
      </section>

      <section className="border-y border-neutral-200">
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
          {C.stats.map((s) => (
            <div key={s.l} className="border-r border-neutral-200 px-6 py-10 last:border-r-0">
              <div className="font-sans text-4xl font-light">{s.n}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-neutral-500">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 flex items-baseline justify-between">
          <h2 className="font-sans text-3xl font-light">Como funciona</h2>
          <span className="text-xs uppercase tracking-widest text-neutral-500">01 — 03</span>
        </div>
        <ol className="divide-y divide-neutral-200 border-y border-neutral-200">
          {C.passos.map((p, i) => (
            <li key={p.t} className="grid grid-cols-[60px_1fr] gap-6 py-8 md:grid-cols-[80px_240px_1fr]">
              <span className="text-xs uppercase tracking-widest text-neutral-400">0{i + 1}</span>
              <h3 className="font-sans text-xl font-light">{p.t}</h3>
              <p className="text-sm text-neutral-600">{p.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-8 font-sans text-3xl font-light">Profissões em alta</h2>
        <div className="flex flex-wrap gap-2">
          {C.profissoes.map((p) => (
            <span key={p} className="border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-600">{p}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="mb-8 font-sans text-3xl font-light">Depoimentos</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {C.depoimentos.map((d) => (
            <blockquote key={d.n} className="border-t border-neutral-900 pt-6">
              <p className="font-sans text-base font-light leading-relaxed">"{d.t}"</p>
              <footer className="mt-4 text-xs uppercase tracking-widest text-neutral-500">— {d.n} · {d.c}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-8">
        <p className="mx-auto max-w-5xl text-xs uppercase tracking-widest text-neutral-500">© {C.brand.toLowerCase()} — 2026</p>
      </footer>
    </div>
  );
}
