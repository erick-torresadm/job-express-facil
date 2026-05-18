export type Profissao = {
  id: string;
  nome: string;
  emoji: string;
  slug: string;
  categoria?: string;
};

export const PROFISSOES: Profissao[] = [
  // Originais (mantidos para compat)
  { id: "limpeza", nome: "Limpeza", emoji: "🧹", slug: "limpeza", categoria: "Serviços Gerais" },
  { id: "obras", nome: "Obras / Pedreiro", emoji: "🔨", slug: "pedreiro", categoria: "Construção Civil" },
  { id: "ajudante", nome: "Ajudante / Estoque", emoji: "📦", slug: "ajudante-de-estoque", categoria: "Logística" },
  { id: "motorista", nome: "Motorista / Entregador", emoji: "🚗", slug: "motorista-entregador", categoria: "Transporte" },
  { id: "portaria", nome: "Recepção / Portaria", emoji: "🛎️", slug: "porteiro", categoria: "Serviços Gerais" },
  { id: "cozinha", nome: "Cozinha / Aux. Cozinha", emoji: "🍳", slug: "auxiliar-de-cozinha", categoria: "Alimentação" },
  { id: "domestica", nome: "Doméstica / Diarista", emoji: "🧺", slug: "domestica", categoria: "Serviços Domésticos" },
  { id: "vendas", nome: "Vendas / Caixa", emoji: "🛒", slug: "vendedor-caixa", categoria: "Comércio" },

  // Construção Civil
  { id: "pintor", nome: "Pintor", emoji: "🎨", slug: "pintor", categoria: "Construção Civil" },
  { id: "eletricista", nome: "Eletricista", emoji: "⚡", slug: "eletricista", categoria: "Construção Civil" },
  { id: "encanador", nome: "Encanador", emoji: "🔧", slug: "encanador", categoria: "Construção Civil" },
  { id: "marceneiro", nome: "Marceneiro", emoji: "🪚", slug: "marceneiro", categoria: "Construção Civil" },
  { id: "soldador", nome: "Soldador", emoji: "🔥", slug: "soldador", categoria: "Construção Civil" },
  { id: "gesseiro", nome: "Gesseiro", emoji: "🏗️", slug: "gesseiro", categoria: "Construção Civil" },
  { id: "azulejista", nome: "Azulejista", emoji: "🧱", slug: "azulejista", categoria: "Construção Civil" },

  // Serviços Gerais
  { id: "jardineiro", nome: "Jardineiro", emoji: "🌱", slug: "jardineiro", categoria: "Serviços Gerais" },
  { id: "vigia", nome: "Vigia / Vigilante", emoji: "🛡️", slug: "vigilante", categoria: "Segurança" },
  { id: "zelador", nome: "Zelador", emoji: "🔑", slug: "zelador", categoria: "Serviços Gerais" },
  { id: "controlador-acesso", nome: "Controlador de Acesso", emoji: "🚪", slug: "controlador-de-acesso", categoria: "Segurança" },

  // Logística / Indústria
  { id: "empacotador", nome: "Empacotador", emoji: "📦", slug: "empacotador", categoria: "Logística" },
  { id: "conferente", nome: "Conferente de Estoque", emoji: "📋", slug: "conferente", categoria: "Logística" },
  { id: "operador-empilhadeira", nome: "Operador de Empilhadeira", emoji: "🚜", slug: "operador-de-empilhadeira", categoria: "Logística" },
  { id: "auxiliar-producao", nome: "Auxiliar de Produção", emoji: "🏭", slug: "auxiliar-de-producao", categoria: "Indústria" },
  { id: "operador-maquina", nome: "Operador de Máquina", emoji: "⚙️", slug: "operador-de-maquina", categoria: "Indústria" },
  { id: "embalador", nome: "Embalador", emoji: "🎁", slug: "embalador", categoria: "Indústria" },

  // Transporte
  { id: "motoboy", nome: "Motoboy", emoji: "🛵", slug: "motoboy", categoria: "Transporte" },
  { id: "motorista-caminhao", nome: "Motorista de Caminhão", emoji: "🚛", slug: "motorista-de-caminhao", categoria: "Transporte" },
  { id: "motorista-app", nome: "Motorista de Aplicativo", emoji: "📱", slug: "motorista-de-aplicativo", categoria: "Transporte" },
  { id: "entregador-bike", nome: "Entregador de Bike", emoji: "🚴", slug: "entregador-de-bike", categoria: "Transporte" },
  { id: "ajudante-caminhao", nome: "Ajudante de Caminhão", emoji: "🚚", slug: "ajudante-de-caminhao", categoria: "Transporte" },

  // Alimentação
  { id: "cozinheiro", nome: "Cozinheiro", emoji: "👨‍🍳", slug: "cozinheiro", categoria: "Alimentação" },
  { id: "chapeiro", nome: "Chapeiro", emoji: "🍔", slug: "chapeiro", categoria: "Alimentação" },
  { id: "pizzaiolo", nome: "Pizzaiolo", emoji: "🍕", slug: "pizzaiolo", categoria: "Alimentação" },
  { id: "padeiro", nome: "Padeiro", emoji: "🥖", slug: "padeiro", categoria: "Alimentação" },
  { id: "confeiteiro", nome: "Confeiteiro", emoji: "🎂", slug: "confeiteiro", categoria: "Alimentação" },
  { id: "garcom", nome: "Garçom / Garçonete", emoji: "🍽️", slug: "garcom", categoria: "Alimentação" },
  { id: "barman", nome: "Barman / Barista", emoji: "🍸", slug: "barman", categoria: "Alimentação" },
  { id: "atendente-fastfood", nome: "Atendente de Fast Food", emoji: "🍟", slug: "atendente-de-fast-food", categoria: "Alimentação" },
  { id: "aux-cozinha-restaurante", nome: "Aux. de Cozinha (Restaurante)", emoji: "🥘", slug: "auxiliar-de-cozinha-restaurante", categoria: "Alimentação" },

  // Serviços Domésticos
  { id: "diarista", nome: "Diarista", emoji: "🧽", slug: "diarista", categoria: "Serviços Domésticos" },
  { id: "passadeira", nome: "Passadeira", emoji: "👕", slug: "passadeira", categoria: "Serviços Domésticos" },
  { id: "cuidador-idoso", nome: "Cuidador de Idoso", emoji: "👴", slug: "cuidador-de-idoso", categoria: "Cuidados" },
  { id: "baba", nome: "Babá", emoji: "👶", slug: "baba", categoria: "Cuidados" },
  { id: "passeador-cao", nome: "Passeador de Cães", emoji: "🐕", slug: "passeador-de-caes", categoria: "Cuidados" },

  // Comércio / Vendas
  { id: "vendedor-loja", nome: "Vendedor de Loja", emoji: "🛍️", slug: "vendedor-de-loja", categoria: "Comércio" },
  { id: "operador-caixa", nome: "Operador de Caixa", emoji: "💳", slug: "operador-de-caixa", categoria: "Comércio" },
  { id: "repositor", nome: "Repositor de Mercadorias", emoji: "🏪", slug: "repositor", categoria: "Comércio" },
  { id: "balconista", nome: "Balconista", emoji: "🏬", slug: "balconista", categoria: "Comércio" },
  { id: "promotor-vendas", nome: "Promotor de Vendas", emoji: "📣", slug: "promotor-de-vendas", categoria: "Comércio" },
  { id: "consultor-vendas", nome: "Consultor de Vendas", emoji: "💼", slug: "consultor-de-vendas", categoria: "Comércio" },

  // Escritório / Atendimento
  { id: "recepcionista", nome: "Recepcionista", emoji: "💁", slug: "recepcionista", categoria: "Atendimento" },
  { id: "telemarketing", nome: "Telemarketing / SAC", emoji: "📞", slug: "telemarketing", categoria: "Atendimento" },
  { id: "auxiliar-administrativo", nome: "Auxiliar Administrativo", emoji: "🗂️", slug: "auxiliar-administrativo", categoria: "Administrativo" },
  { id: "assistente-administrativo", nome: "Assistente Administrativo", emoji: "📊", slug: "assistente-administrativo", categoria: "Administrativo" },
  { id: "secretaria", nome: "Secretária", emoji: "📅", slug: "secretaria", categoria: "Administrativo" },
  { id: "office-boy", nome: "Office Boy", emoji: "🏃", slug: "office-boy", categoria: "Administrativo" },

  // Saúde / Beleza
  { id: "tecnico-enfermagem", nome: "Técnico de Enfermagem", emoji: "💉", slug: "tecnico-de-enfermagem", categoria: "Saúde" },
  { id: "auxiliar-enfermagem", nome: "Auxiliar de Enfermagem", emoji: "🏥", slug: "auxiliar-de-enfermagem", categoria: "Saúde" },
  { id: "cabeleireiro", nome: "Cabeleireiro(a)", emoji: "💇", slug: "cabeleireiro", categoria: "Beleza" },
  { id: "manicure", nome: "Manicure / Pedicure", emoji: "💅", slug: "manicure", categoria: "Beleza" },
  { id: "esteticista", nome: "Esteticista", emoji: "✨", slug: "esteticista", categoria: "Beleza" },
  { id: "depiladora", nome: "Depiladora", emoji: "🌸", slug: "depiladora", categoria: "Beleza" },
  { id: "massagista", nome: "Massagista", emoji: "🧘", slug: "massagista", categoria: "Beleza" },

  // Outros
  { id: "professor-particular", nome: "Professor Particular", emoji: "📚", slug: "professor-particular", categoria: "Educação" },
  { id: "monitor-escolar", nome: "Monitor Escolar", emoji: "🎒", slug: "monitor-escolar", categoria: "Educação" },
  { id: "mecanico-auto", nome: "Mecânico de Automóveis", emoji: "🔧", slug: "mecanico-de-automoveis", categoria: "Automotivo" },
  { id: "lavador-carros", nome: "Lavador de Carros", emoji: "🚙", slug: "lavador-de-carros", categoria: "Automotivo" },
  { id: "frentista", nome: "Frentista", emoji: "⛽", slug: "frentista", categoria: "Automotivo" },
  { id: "costureira", nome: "Costureira", emoji: "🧵", slug: "costureira", categoria: "Confecção" },
];

export const CATEGORIAS = Array.from(
  new Set(PROFISSOES.map((p) => p.categoria).filter(Boolean) as string[])
).sort();

export const CIDADES = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Curitiba",
  "Recife", "Fortaleza", "Porto Alegre", "Brasília", "Manaus",
  "Osasco", "Guarulhos", "Campinas", "Santo André", "São Bernardo",
  "Diadema", "Mauá", "Suzano", "Mogi das Cruzes", "São José dos Campos",
  "Sorocaba", "Ribeirão Preto", "Santos", "São Vicente", "Niterói",
  "Duque de Caxias", "Nova Iguaçu", "Belford Roxo", "São Gonçalo", "Vitória",
  "Vila Velha", "Serra", "Goiânia", "Aparecida de Goiânia", "Florianópolis",
  "Joinville", "Londrina", "Maringá", "Uberlândia", "Contagem",
  "Betim", "Juiz de Fora", "Feira de Santana", "Aracaju", "Maceió",
  "João Pessoa", "Natal", "Teresina", "São Luís", "Belém",
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
    experiencias: ["Farmácia de bairro — Motoboy (2022–2024)", "Apps de mobilidade — Motorista (2018–2022)"],
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
    experiencias: ["Rede de farmácias — Caixa (2020–2024)", "Supermercado regional — Operadora (2017–2020)"],
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
