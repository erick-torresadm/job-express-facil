export type Profissao = {
  id: string;
  nome: string;
  emoji: string;
  slug: string;
};

export const PROFISSOES: Profissao[] = [
  { id: "limpeza", nome: "Limpeza", emoji: "🧹", slug: "limpeza" },
  { id: "obras", nome: "Obras / Pedreiro", emoji: "🔨", slug: "pedreiro" },
  { id: "ajudante", nome: "Ajudante / Estoque", emoji: "📦", slug: "ajudante-de-estoque" },
  { id: "motorista", nome: "Motorista / Entregador", emoji: "🚗", slug: "motorista-entregador" },
  { id: "portaria", nome: "Recepção / Portaria", emoji: "🛎️", slug: "porteiro" },
  { id: "cozinha", nome: "Cozinha / Aux. Cozinha", emoji: "🍳", slug: "auxiliar-de-cozinha" },
  { id: "domestica", nome: "Doméstica / Diarista", emoji: "🧺", slug: "domestica" },
  { id: "vendas", nome: "Vendas / Caixa", emoji: "🛒", slug: "vendedor-caixa" },
];

export const CIDADES = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Curitiba",
  "Recife", "Fortaleza", "Porto Alegre", "Brasília", "Manaus",
  "Osasco", "Guarulhos", "Campinas", "Santo André", "São Bernardo",
];

export const BAIRROS = [
  "Centro", "Zona Leste", "Zona Sul", "Zona Norte", "Zona Oeste",
  "Tatuapé", "Mooca", "Vila Mariana", "Santana", "Pinheiros",
];

export type Candidato = {
  id: string;
  nome: string;
  idade: number;
  telefone: string;
  bairro: string;
  cidade: string;
  profissoes: string[];
  resumo: string;
  experiencias: string[];
  status: "pendente" | "aprovado" | "recusado";
  destaque?: boolean;
  cadastradoEm: string;
};

export const CANDIDATOS: Candidato[] = [
  {
    id: "c1", nome: "José Almeida da Silva", idade: 42, telefone: "(11) 98765-4321",
    bairro: "Tatuapé", cidade: "São Paulo", profissoes: ["Pedreiro", "Ajudante de Obras"],
    resumo: "12 anos de experiência em construção civil, especializado em acabamento e alvenaria. Já trabalhou em obras residenciais e comerciais.",
    experiencias: ["Construtora MRV — Pedreiro (2019–2024)", "Obra particular — Mestre de obras (2015–2019)", "Cyrela — Ajudante (2012–2015)"],
    status: "pendente", destaque: true, cadastradoEm: "Hoje, 09:32",
  },
  {
    id: "c2", nome: "Maria Aparecida Souza", idade: 38, telefone: "(11) 99123-4567",
    bairro: "Mooca", cidade: "São Paulo", profissoes: ["Doméstica", "Diarista"],
    resumo: "Experiência de 8 anos como doméstica em casa de família. Cozinha bem, organizada, com referências.",
    experiencias: ["Família particular — Diarista 3x/semana (2018–2024)", "Família — Mensalista (2014–2018)"],
    status: "aprovado", cadastradoEm: "Hoje, 08:15",
  },
  {
    id: "c3", nome: "Carlos Eduardo Mendes", idade: 29, telefone: "(11) 97654-3210",
    bairro: "Vila Mariana", cidade: "São Paulo", profissoes: ["Motorista", "Entregador"],
    resumo: "CNH B e D, 5 anos como motorista de aplicativo e 2 como entregador de farmácia.",
    experiencias: ["Drogasil — Motoboy (2022–2024)", "Uber/99 — Motorista (2018–2022)"],
    status: "pendente", cadastradoEm: "Ontem, 18:40",
  },
  {
    id: "c4", nome: "Fernanda Lima Costa", idade: 25, telefone: "(11) 98888-7777",
    bairro: "Centro", cidade: "Osasco", profissoes: ["Auxiliar de Limpeza"],
    resumo: "Primeira experiência registrada, trabalhou 1 ano em condomínio. Pontual, mora perto de metrô.",
    experiencias: ["Condomínio Edifício Sol — Aux. Limpeza (2023–2024)"],
    status: "pendente", cadastradoEm: "Ontem, 14:22",
  },
  {
    id: "c5", nome: "Roberto Pereira Santos", idade: 51, telefone: "(11) 96666-5555",
    bairro: "Santana", cidade: "São Paulo", profissoes: ["Porteiro", "Vigia"],
    resumo: "20 anos como porteiro em condomínios residenciais. Curso de portaria atualizado.",
    experiencias: ["Cond. Vila Real — Porteiro 12x36 (2014–2024)", "GR Serviços — Vigia (2004–2014)"],
    status: "aprovado", destaque: true, cadastradoEm: "2 dias atrás",
  },
  {
    id: "c6", nome: "Patrícia Oliveira", idade: 33, telefone: "(11) 95555-4444",
    bairro: "Pinheiros", cidade: "São Paulo", profissoes: ["Caixa", "Vendedora"],
    resumo: "7 anos no varejo, passou por supermercado e farmácia. Conhece sistema de PDV.",
    experiencias: ["Pague Menos — Caixa (2020–2024)", "Carrefour — Operadora (2017–2020)"],
    status: "recusado", cadastradoEm: "3 dias atrás",
  },
];

export type Vaga = {
  id: string;
  titulo: string;
  empresa: string;
  salario: string;
  horario: string;
  bairro: string;
  cidade: string;
  profissaoSlug: string;
  urgente?: boolean;
  postadaEm: string;
};

export const VAGAS: Vaga[] = [
  { id: "v1", titulo: "Pedreiro de Acabamento", empresa: "Construtora Vega", salario: "R$ 2.800 + VT + VR", horario: "Seg–Sex, 7h às 17h", bairro: "Tatuapé", cidade: "São Paulo", profissaoSlug: "pedreiro", urgente: true, postadaEm: "há 2h" },
  { id: "v2", titulo: "Auxiliar de Limpeza", empresa: "Higitec Serviços", salario: "R$ 1.620 + benefícios", horario: "12x36 diurno", bairro: "Centro", cidade: "São Paulo", profissaoSlug: "limpeza", postadaEm: "há 5h" },
  { id: "v3", titulo: "Motoboy Entregador", empresa: "Farmácia São Paulo", salario: "R$ 2.100 + comissão", horario: "Seg–Sáb, 9h às 18h", bairro: "Pinheiros", cidade: "São Paulo", profissaoSlug: "motorista-entregador", urgente: true, postadaEm: "há 1d" },
  { id: "v4", titulo: "Porteiro 12x36", empresa: "Cond. Edifício Aurora", salario: "R$ 1.950", horario: "12x36 noturno", bairro: "Santana", cidade: "São Paulo", profissaoSlug: "porteiro", postadaEm: "há 1d" },
  { id: "v5", titulo: "Ajudante de Estoque", empresa: "Magalu Logística", salario: "R$ 1.750 + cesta", horario: "Seg–Sex, 8h às 17h48", bairro: "Mooca", cidade: "São Paulo", profissaoSlug: "ajudante-de-estoque", postadaEm: "há 2d" },
  { id: "v6", titulo: "Diarista 2x semana", empresa: "Família particular", salario: "R$ 180/diária", horario: "Ter e Qui", bairro: "Vila Mariana", cidade: "São Paulo", profissaoSlug: "domestica", postadaEm: "há 3d" },
];
