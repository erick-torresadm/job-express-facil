import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — VagasAgora" },
      { name: "description", content: "Saiba como a VagasAgora coleta, usa e protege seus dados pessoais de acordo com a LGPD." },
      { property: "og:title", content: "Política de Privacidade — VagasAgora" },
      { property: "og:description", content: "Como tratamos seus dados na VagasAgora — em conformidade com a LGPD." },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-secondary">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-extrabold">VagasAgora</Link>
          <Link to="/termos" className="text-sm text-muted-foreground hover:text-accent">Termos</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <article className="prose prose-sm max-w-none rounded-3xl bg-card p-8 shadow-soft sm:prose-base">
          <h1 className="text-3xl font-extrabold">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: 18 de maio de 2026</p>

          <p>
            A <strong>VagasAgora</strong> respeita a sua privacidade e está comprometida com a proteção dos seus dados pessoais,
            em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)</strong>.
          </p>

          <h2>1. Controlador dos dados</h2>
          <p>
            A VagasAgora é a controladora dos dados pessoais coletados na plataforma. Contato do Encarregado (DPO):{" "}
            <a href="mailto:privacidade@vagasagora.com.br" className="text-accent">privacidade@vagasagora.com.br</a>.
          </p>

          <h2>2. Dados que coletamos</h2>
          <h3>Quando você se cadastra como candidato:</h3>
          <ul>
            <li>Nome completo, e-mail, WhatsApp;</li>
            <li>Currículo: profissão, experiências, habilidades, idiomas, CNH, pretensão salarial, disponibilidade;</li>
            <li>Localização aproximada (cidade, bairro, endereço opcional);</li>
            <li>Áudio/vídeo do currículo, se você optar por gravar;</li>
            <li>Foto de perfil, se enviada.</li>
          </ul>
          <h3>Quando você se cadastra como empresa:</h3>
          <ul>
            <li>Razão social, nome fantasia, CNPJ ou CPF do responsável;</li>
            <li>E-mail, telefone, endereço comercial;</li>
            <li>Dados de pagamento (processados pelo Asaas — não armazenamos número completo de cartão);</li>
            <li>Documentos enviados para verificação (RG, contrato social, comprovante).</li>
          </ul>
          <h3>Dados automáticos:</h3>
          <ul>
            <li>Endereço IP, tipo de dispositivo, navegador;</li>
            <li>Cookies e identificadores de sessão;</li>
            <li>Páginas acessadas, vagas visualizadas, candidaturas enviadas.</li>
          </ul>

          <h2>3. Base legal (LGPD)</h2>
          <ul>
            <li><strong>Execução de contrato</strong> — para prestar o serviço de conexão entre candidato e empresa;</li>
            <li><strong>Consentimento</strong> — para envio de comunicações de marketing e cookies não essenciais;</li>
            <li><strong>Legítimo interesse</strong> — para melhorar a plataforma e prevenir fraudes;</li>
            <li><strong>Cumprimento de obrigação legal</strong> — para atender autoridades fiscais e judiciais.</li>
          </ul>

          <h2>4. Como usamos seus dados</h2>
          <ul>
            <li>Conectar candidatos a vagas compatíveis;</li>
            <li>Permitir que empresas visualizem currículos de quem se candidatou;</li>
            <li>Enviar notificações sobre vagas, candidaturas e mensagens da plataforma;</li>
            <li>Processar pagamentos de planos pagos;</li>
            <li>Detectar e prevenir fraudes (uso de IA para análise de risco em vagas);</li>
            <li>Cumprir obrigações legais e responder a solicitações de autoridades.</li>
          </ul>

          <h2>5. Compartilhamento</h2>
          <p>Seus dados podem ser compartilhados com:</p>
          <ul>
            <li><strong>Empresas anunciantes</strong>, apenas quando você se candidatar a uma vaga ou autorizar a revelação do currículo;</li>
            <li><strong>Processadores de pagamento</strong> (Asaas) para cobrança de planos;</li>
            <li><strong>Infraestrutura de nuvem</strong> (Supabase, Cloudflare) que hospeda a plataforma;</li>
            <li><strong>Provedores de IA</strong> (Google, OpenAI) para gerar transcrições, análises de fraude e match — apenas dados estritamente necessários, sem identificadores diretos quando possível;</li>
            <li><strong>Autoridades públicas</strong>, mediante ordem judicial ou requisição legal.</li>
          </ul>
          <p>Não vendemos seus dados pessoais a terceiros.</p>

          <h2>6. Retenção</h2>
          <ul>
            <li>Currículos e perfis: mantidos enquanto a conta estiver ativa;</li>
            <li>Após exclusão da conta: dados anonimizados ou removidos em até 90 dias, exceto quando a lei exigir retenção (ex.: dados fiscais por 5 anos);</li>
            <li>Logs de acesso: 6 meses (Marco Civil da Internet).</li>
          </ul>

          <h2>7. Seus direitos (LGPD)</h2>
          <p>Você pode, a qualquer momento, solicitar:</p>
          <ul>
            <li>Confirmação da existência de tratamento dos seus dados;</li>
            <li>Acesso aos dados;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>Portabilidade dos dados;</li>
            <li>Revogação do consentimento;</li>
            <li>Informação sobre com quem compartilhamos seus dados.</li>
          </ul>
          <p>
            Para exercer seus direitos: <a href="mailto:privacidade@vagasagora.com.br" className="text-accent">privacidade@vagasagora.com.br</a>.
            Responderemos em até 15 dias úteis.
          </p>

          <h2>8. Cookies</h2>
          <p>
            Usamos cookies essenciais (sessão e segurança) e, mediante seu consentimento, cookies analíticos
            para entender o uso da plataforma. Você pode gerenciar suas preferências no banner de cookies
            ou nas configurações do navegador.
          </p>

          <h2>9. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo criptografia em trânsito (HTTPS),
            controle de acesso por papéis (RLS), e monitoramento de incidentes. Em caso de incidente de segurança que possa
            causar risco aos titulares, notificaremos a ANPD e os afetados nos prazos legais.
          </p>

          <h2>10. Transferência internacional</h2>
          <p>
            Alguns provedores (nuvem, IA) podem processar dados fora do Brasil. Garantimos que essas transferências
            ocorrem com proteção adequada, conforme exigido pela LGPD.
          </p>

          <h2>11. Crianças e adolescentes</h2>
          <p>
            A plataforma não é destinada a menores de 16 anos. Caso identifiquemos cadastro de menor sem autorização
            dos responsáveis, a conta será removida.
          </p>

          <h2>12. Alterações</h2>
          <p>
            Esta Política pode ser atualizada. Alterações relevantes serão comunicadas por e-mail ou aviso na plataforma.
          </p>

          <h2>13. Contato</h2>
          <p>
            <strong>Encarregado de Proteção de Dados (DPO):</strong><br />
            E-mail: <a href="mailto:privacidade@vagasagora.com.br" className="text-accent">privacidade@vagasagora.com.br</a><br />
            Em caso de não resolução, você pode contatar a ANPD (Autoridade Nacional de Proteção de Dados): {" "}
            <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-accent">gov.br/anpd</a>
          </p>
        </article>
      </main>
    </div>
  );
}
