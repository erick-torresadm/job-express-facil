import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type CurriculoCompletude = {
  campo: string;
  preenchido: boolean;
  pontos: number;
  dica: string;
};

export function calcularCompletudeCurriculo(cv: {
  nome?: string | null;
  profissao?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  endereco?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  resumo?: string | null;
  tem_audio?: boolean | null;
  tem_video?: boolean | null;
  experiencias?: unknown[] | null;
  habilidades?: unknown[] | null;
  disponibilidade?: string | null;
  pretensao_salarial?: string | null;
  cnh?: string | null;
  idiomas?: unknown[] | null;
}): { score: number; itens: CurriculoCompletude[] } {
  const itens: CurriculoCompletude[] = [
    { campo: "Nome", preenchido: !!cv.nome, pontos: 5, dica: "Adicione seu nome completo" },
    { campo: "Profissão", preenchido: !!cv.profissao, pontos: 10, dica: "Escolha sua profissão principal" },
    { campo: "Bairro e cidade", preenchido: !!cv.bairro && !!cv.cidade, pontos: 10, dica: "Vagas perto de você dependem disso" },
    { campo: "WhatsApp", preenchido: !!cv.whatsapp, pontos: 10, dica: "Sem WhatsApp a empresa não consegue te chamar" },
    { campo: "E-mail", preenchido: !!cv.email, pontos: 5, dica: "Para receber convites de vagas" },
    { campo: "Apresentação em vídeo", preenchido: !!cv.tem_video, pontos: 15, dica: "Vídeo aumenta em 4x a chance de ser chamado" },
    { campo: "Áudio de apresentação", preenchido: !!cv.tem_audio, pontos: 10, dica: "Recrutador entende em 30s se você serve" },
    { campo: "Resumo profissional", preenchido: !!cv.resumo && cv.resumo.length > 30, pontos: 5, dica: "Fale o que você faz em poucas palavras" },
    { campo: "Experiências", preenchido: Array.isArray(cv.experiencias) && cv.experiencias.length > 0, pontos: 10, dica: "Liste pelo menos 1 experiência" },
    { campo: "Habilidades", preenchido: Array.isArray(cv.habilidades) && cv.habilidades.length >= 3, pontos: 5, dica: "Adicione 3 ou mais habilidades" },
    { campo: "Endereço aproximado", preenchido: !!cv.endereco, pontos: 5, dica: "Empresa vê distância e custo de transporte até a vaga" },
    { campo: "Disponibilidade", preenchido: !!cv.disponibilidade, pontos: 5, dica: "Diga quando pode começar e horários" },
    { campo: "Pretensão salarial", preenchido: !!cv.pretensao_salarial, pontos: 3, dica: "Evita perder tempo com vagas fora da faixa" },
    { campo: "CNH", preenchido: !!cv.cnh, pontos: 1, dica: "Marque se tem CNH (A, B, etc) ou 'não tenho'" },
    { campo: "Idiomas", preenchido: Array.isArray(cv.idiomas) && cv.idiomas.length > 0, pontos: 1, dica: "Mesmo só português, vale registrar" },
  ];

  const total = itens.reduce((acc, i) => acc + i.pontos, 0);
  const ganho = itens.filter((i) => i.preenchido).reduce((acc, i) => acc + i.pontos, 0);
  const score = Math.round((ganho / total) * 100);
  return { score, itens };
}

export function CVProgressMeter({
  cv,
  editLink = "/cadastro",
  compact = false,
}: {
  cv: Parameters<typeof calcularCompletudeCurriculo>[0];
  editLink?: string;
  compact?: boolean;
}) {
  const { score, itens } = calcularCompletudeCurriculo(cv);
  const faltantes = itens.filter((i) => !i.preenchido).sort((a, b) => b.pontos - a.pontos);
  const top3 = faltantes.slice(0, 3);

  const cor = score >= 80 ? "text-success" : score >= 50 ? "text-accent" : "text-destructive";
  const corBar = score >= 80 ? "bg-success" : score >= 50 ? "bg-accent" : "bg-destructive";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className={`h-5 w-5 ${cor}`} />
          <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Força do currículo</p>
        </div>
        <span className={`text-3xl font-black tabular-nums ${cor}`}>{score}%</span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full transition-all duration-500 ${corBar}`} style={{ width: `${score}%` }} />
      </div>

      {score < 100 && top3.length > 0 && !compact && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Suba sua pontuação agora:
          </p>
          <ul className="space-y-2">
            {top3.map((item) => (
              <li key={item.campo} className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-background p-3">
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.campo}</p>
                  <p className="text-xs text-muted-foreground">{item.dica}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">+{item.pontos}%</span>
              </li>
            ))}
          </ul>
          <Link
            to={editLink}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Melhorar meu currículo
          </Link>
        </div>
      )}

      {score === 100 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 p-3 text-sm font-semibold text-success">
          <CheckCircle2 className="h-4 w-4" /> Currículo completo! Empresas te encontram fácil.
        </div>
      )}
    </div>
  );
}
