import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — VagasAgora" },
      { name: "description", content: "Termos e condições de uso da plataforma VagasAgora para candidatos e empresas." },
      { property: "og:title", content: "Termos de Uso — VagasAgora" },
      { property: "og:description", content: "Termos e condições de uso da plataforma VagasAgora." },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-extrabold">VagasAgora</Link>
          <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-accent">Privacidade</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <article className="prose prose-sm max-w-none rounded-3xl bg-card p-8 shadow-soft sm:prose-base">
          <h1 className="text-3xl font-extrabold">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 18 de maio de 2026</p>

          <h2>1. Aceitação</h2>
          <p>
            Ao acessar ou usar a plataforma <strong>VagasAgora</strong> (site, aplicativo e serviços relacionados),
            você concorda integralmente com estes Termos de Uso e com a nossa{" "}
            <Link to="/privacidade" className="text-accent underline">Política de Privacidade</Link>.
            Se você não concorda, não utilize a plataforma.
          </p>

          <h2>2. O que é a VagasAgora</h2>
          <p>
            A VagasAgora é uma plataforma digital que conecta candidatos e empresas para fins de recrutamento.
            Atuamos como intermediário tecnológico — não somos empregadores, agência de emprego, nem responsáveis
            pela contratação, salário ou condições de trabalho oferecidos pelas empresas anunciantes.
          </p>

          <h2>3. Cadastro</h2>
          <ul>
            <li>Você precisa ter ao menos 16 anos para se cadastrar como candidato e 18 anos para representar uma empresa.</li>
            <li>As informações fornecidas devem ser verdadeiras, atualizadas e completas.</li>
            <li>Você é responsável pela guarda das suas credenciais de acesso.</li>
            <li>Podemos suspender ou encerrar contas que violem estes Termos, a lei ou direitos de terceiros.</li>
          </ul>

          <h2>4. Uso por candidatos</h2>
          <p>O uso da plataforma como candidato é <strong>gratuito</strong>. Ao se candidatar a uma vaga, você autoriza a empresa anunciante a visualizar seu currículo e dados de contato.</p>

          <h2>5. Uso por empresas</h2>
          <ul>
            <li>Empresas podem publicar vagas reais, com informações verdadeiras e que respeitem a legislação trabalhista brasileira.</li>
            <li>É proibido cobrar valores do candidato em qualquer etapa do processo seletivo.</li>
            <li>É proibido discriminação por raça, gênero, orientação sexual, idade, religião, deficiência ou qualquer outro critério vedado por lei.</li>
            <li>Os planos pagos seguem o ciclo (mensal ou anual) contratado, com renovação automática até o cancelamento.</li>
            <li>O cancelamento pode ser solicitado a qualquer momento e produz efeitos no fim do ciclo já pago, sem reembolso proporcional, salvo exigência legal.</li>
          </ul>

          <h2>6. Conteúdo proibido</h2>
          <p>É expressamente proibido publicar vagas, currículos ou mensagens com conteúdo:</p>
          <ul>
            <li>Falso, fraudulento ou enganoso (incluindo pirâmides, MMN com promessas irreais e ofertas que exijam pagamento prévio do candidato);</li>
            <li>Discriminatório, ofensivo, violento ou de assédio;</li>
            <li>Que viole direitos autorais, marcas ou propriedade intelectual de terceiros;</li>
            <li>Que viole a LGPD ou qualquer outra legislação aplicável.</li>
          </ul>

          <h2>7. Moderação</h2>
          <p>
            Reservamo-nos o direito de revisar, editar, despublicar ou remover qualquer vaga, currículo ou conteúdo
            que viole estes Termos, sem aviso prévio, e de suspender contas reincidentes.
          </p>

          <h2>8. Limitação de responsabilidade</h2>
          <p>
            A VagasAgora não garante a veracidade absoluta das informações publicadas por candidatos ou empresas.
            Não nos responsabilizamos por: (i) o resultado de processos seletivos; (ii) eventual relação trabalhista
            ou contratual firmada entre as partes; (iii) prejuízos decorrentes de informações falsas prestadas por terceiros
            na plataforma. Recomendamos sempre conferir a legitimidade da empresa antes de aceitar qualquer proposta.
          </p>

          <h2>9. Propriedade intelectual</h2>
          <p>
            Marca, logotipo, layout, código-fonte e demais elementos da plataforma são de propriedade exclusiva da VagasAgora.
            É vedada a reprodução, raspagem (scraping) ou uso não autorizado.
          </p>

          <h2>10. Pagamentos</h2>
          <p>
            Os pagamentos de planos são processados por gateway terceiro (Asaas). Não armazenamos dados completos
            de cartão de crédito. Em caso de inadimplência, a assinatura pode ser suspensa após o vencimento.
          </p>

          <h2>11. Alterações</h2>
          <p>
            Podemos atualizar estes Termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail
            ou aviso na plataforma. O uso continuado após a publicação significa aceitação das mudanças.
          </p>

          <h2>12. Lei aplicável e foro</h2>
          <p>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca
            de São Paulo/SP para dirimir qualquer controvérsia, salvo competência de outro foro por imposição legal
            (como o foro do consumidor).
          </p>

          <h2>13. Contato</h2>
          <p>
            Dúvidas sobre estes Termos: <a href="mailto:oi@vagasagora.com.br" className="text-accent">oi@vagasagora.com.br</a>
          </p>
        </article>
      </main>
    </div>
  );
}
