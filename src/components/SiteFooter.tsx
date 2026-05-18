import { Link } from "@tanstack/react-router";
import { Briefcase, Instagram, MessageCircle, Mail } from "lucide-react";

const profissoes = [
  { slug: "pedreiro-em-sao-paulo", label: "Pedreiro em São Paulo" },
  { slug: "domestica-em-sao-paulo", label: "Doméstica em São Paulo" },
  { slug: "motorista-em-sao-paulo", label: "Motorista em São Paulo" },
  { slug: "porteiro-em-sao-paulo", label: "Porteiro em São Paulo" },
  { slug: "ajudante-em-sao-paulo", label: "Ajudante em São Paulo" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground shadow-pop">
                <Briefcase className="h-5 w-5" />
              </div>
              <p className="text-base font-extrabold">VagasAgora</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Vagas de verdade, perto de você. Grátis pro trabalhador.
            </p>
            <div className="mt-4 flex gap-2">
              <a href="https://wa.me/5511000000000" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="https://instagram.com" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="mailto:oi@vagasagora.com.br" aria-label="E-mail" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Navegar</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-accent">Início</Link></li>
              <li><Link to="/como-funciona" className="hover:text-accent">Como funciona</Link></li>
              <li><Link to="/para-empresas" className="hover:text-accent">Para empresas</Link></li>
              <li><Link to="/contato" className="hover:text-accent">Contato</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Vagas populares</p>
            <ul className="space-y-2 text-sm">
              {profissoes.map((p) => (
                <li key={p.slug}>
                  <Link to="/vagas/$slug" params={{ slug: p.slug }} className="hover:text-accent">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase text-muted-foreground">Empresas</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/empresa" className="hover:text-accent">Painel do RH</Link></li>
              <li><Link to="/empresa/nova-vaga" className="hover:text-accent">Publicar vaga</Link></li>
              <li><Link to="/para-empresas" className="hover:text-accent">Planos e preços</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {year} VagasAgora. Feito no Brasil 🇧🇷</p>
          <div className="flex gap-4">
            <Link to="/contato" className="hover:text-accent">Termos</Link>
            <Link to="/contato" className="hover:text-accent">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
