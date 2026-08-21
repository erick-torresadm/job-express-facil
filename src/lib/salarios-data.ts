import { PROFISSOES } from "@/lib/mock-data";

/**
 * Faixas salariais mensais (BRL, Brasil, 2026) por profissão — base das
 * páginas programáticas /salarios/{slug}. Valores de mercado pro nicho
 * operacional (piso ≈ salário mínimo 2026: R$ 1.630). `diaria` só onde
 * trabalho por diária é comum. Editável à mão quando quiser refinar.
 */
export type SalarioInfo = {
  slug: string;
  piso: number;
  media: number;
  teto: number;
  diaria?: number;
  resumo: string;
};

export const SALARIOS: SalarioInfo[] = [
  { slug: "limpeza", piso: 1630, media: 1850, teto: 2400, diaria: 150, resumo: "Faz limpeza e conservação de casas, escritórios, condomínios e empresas." },
  { slug: "pedreiro", piso: 2000, media: 2800, teto: 4200, diaria: 250, resumo: "Executa construção, reforma e acabamento de obras residenciais e comerciais." },
  { slug: "ajudante-de-estoque", piso: 1630, media: 1900, teto: 2500, resumo: "Organiza, separa e movimenta mercadorias em estoques e depósitos." },
  { slug: "motorista-entregador", piso: 1800, media: 2300, teto: 3200, resumo: "Dirige veículos leves fazendo entregas e coletas em rotas urbanas." },
  { slug: "porteiro", piso: 1700, media: 2000, teto: 2700, resumo: "Controla entrada e saída de pessoas em prédios, condomínios e empresas." },
  { slug: "auxiliar-de-cozinha", piso: 1630, media: 1900, teto: 2500, resumo: "Ajuda no preparo de alimentos, organização e limpeza da cozinha." },
  { slug: "domestica", piso: 1630, media: 1900, teto: 2600, diaria: 180, resumo: "Cuida da limpeza, organização e rotina de residências." },
  { slug: "vendedor-caixa", piso: 1630, media: 1950, teto: 2800, resumo: "Atende clientes, registra vendas e opera o caixa em lojas e mercados." },
  { slug: "pintor", piso: 1900, media: 2600, teto: 3800, diaria: 220, resumo: "Faz pintura residencial, comercial e industrial, com preparação de superfícies." },
  { slug: "eletricista", piso: 2200, media: 3000, teto: 4500, diaria: 280, resumo: "Instala e faz manutenção de redes e sistemas elétricos." },
  { slug: "encanador", piso: 2000, media: 2700, teto: 4000, diaria: 250, resumo: "Instala e conserta tubulações de água, esgoto e gás." },
  { slug: "marceneiro", piso: 2100, media: 2900, teto: 4300, resumo: "Fabrica e monta móveis e estruturas de madeira sob medida." },
  { slug: "soldador", piso: 2400, media: 3200, teto: 5000, resumo: "Une peças metálicas com solda em indústrias, obras e oficinas." },
  { slug: "gesseiro", piso: 1900, media: 2600, teto: 3800, diaria: 230, resumo: "Executa forros, paredes de drywall, sancas e molduras em gesso." },
  { slug: "azulejista", piso: 2000, media: 2800, teto: 4200, diaria: 260, resumo: "Assenta pisos, azulejos e revestimentos cerâmicos." },
  { slug: "jardineiro", piso: 1630, media: 1900, teto: 2600, diaria: 160, resumo: "Cuida de jardins, gramados, poda e paisagismo." },
  { slug: "vigilante", piso: 2100, media: 2600, teto: 3400, resumo: "Faz segurança patrimonial armada ou desarmada (exige curso de formação)." },
  { slug: "zelador", piso: 1700, media: 2100, teto: 2800, resumo: "Cuida da manutenção e conservação geral de prédios e condomínios." },
  { slug: "controlador-de-acesso", piso: 1630, media: 1900, teto: 2400, resumo: "Controla acesso de pessoas e veículos em portarias e eventos." },
  { slug: "empacotador", piso: 1630, media: 1800, teto: 2200, resumo: "Embala compras e produtos em mercados e centros de distribuição." },
  { slug: "conferente", piso: 1800, media: 2200, teto: 3000, resumo: "Confere entrada e saída de mercadorias, notas e cargas." },
  { slug: "operador-de-empilhadeira", piso: 2100, media: 2600, teto: 3500, resumo: "Opera empilhadeira na movimentação de cargas (exige certificação)." },
  { slug: "auxiliar-de-producao", piso: 1700, media: 2100, teto: 2900, resumo: "Atua na linha de produção industrial: montagem, embalagem e apoio geral." },
  { slug: "operador-de-maquina", piso: 2000, media: 2500, teto: 3600, resumo: "Opera máquinas industriais de produção e acabamento." },
  { slug: "embalador", piso: 1630, media: 1800, teto: 2300, resumo: "Embala, rotula e prepara produtos para expedição." },
  { slug: "motoboy", piso: 1700, media: 2200, teto: 3200, resumo: "Faz entregas rápidas de moto: documentos, comida e encomendas." },
  { slug: "motorista-de-caminhao", piso: 2400, media: 3200, teto: 5000, resumo: "Transporta cargas em rotas urbanas e rodoviárias (CNH C, D ou E)." },
  { slug: "motorista-de-aplicativo", piso: 1800, media: 2800, teto: 4500, resumo: "Dirige por aplicativos de transporte de passageiros — renda varia com as horas." },
  { slug: "entregador-de-bike", piso: 1630, media: 1900, teto: 2600, resumo: "Faz entregas de bicicleta por aplicativos em regiões centrais." },
  { slug: "ajudante-de-caminhao", piso: 1630, media: 1900, teto: 2500, resumo: "Acompanha o motorista carregando e descarregando mercadorias." },
  { slug: "cozinheiro", piso: 1900, media: 2500, teto: 3800, resumo: "Prepara refeições e comanda a rotina da cozinha profissional." },
  { slug: "chapeiro", piso: 1700, media: 2100, teto: 2900, resumo: "Prepara lanches na chapa em lanchonetes e hamburguerias." },
  { slug: "pizzaiolo", piso: 1800, media: 2300, teto: 3300, resumo: "Prepara massas e monta pizzas em pizzarias e delivery." },
  { slug: "padeiro", piso: 1800, media: 2300, teto: 3400, resumo: "Produz pães, massas e produtos de padaria (turnos de madrugada pagam mais)." },
  { slug: "confeiteiro", piso: 1750, media: 2200, teto: 3300, resumo: "Produz bolos, doces e sobremesas em padarias e confeitarias." },
  { slug: "garcom", piso: 1630, media: 2000, teto: 3000, resumo: "Atende mesas em restaurantes e eventos — gorjetas aumentam a renda." },
  { slug: "barman", piso: 1700, media: 2200, teto: 3200, resumo: "Prepara drinks e atende no balcão de bares e eventos." },
  { slug: "atendente-de-fast-food", piso: 1630, media: 1800, teto: 2300, resumo: "Atende clientes, monta pedidos e opera caixa em redes de fast-food." },
  { slug: "auxiliar-de-cozinha-restaurante", piso: 1630, media: 1900, teto: 2500, resumo: "Apoia o cozinheiro no preparo e organização em restaurantes." },
  { slug: "diarista", piso: 1630, media: 2200, teto: 3500, diaria: 180, resumo: "Faz faxinas avulsas em casas e escritórios — normalmente cobra por diária." },
  { slug: "passadeira", piso: 1630, media: 1850, teto: 2400, diaria: 150, resumo: "Passa e organiza roupas em residências e lavanderias." },
  { slug: "cuidador-de-idoso", piso: 1700, media: 2200, teto: 3200, diaria: 200, resumo: "Acompanha idosos na rotina, medicação, higiene e mobilidade." },
  { slug: "baba", piso: 1700, media: 2200, teto: 3500, diaria: 180, resumo: "Cuida de crianças na rotina diária, alimentação e atividades." },
  { slug: "passeador-de-caes", piso: 1630, media: 1800, teto: 2800, resumo: "Passeia com cães e presta pequenos cuidados — renda varia por carteira de clientes." },
  { slug: "vendedor-de-loja", piso: 1630, media: 2100, teto: 3500, resumo: "Vende em lojas físicas — comissão pode dobrar o salário base." },
  { slug: "operador-de-caixa", piso: 1630, media: 1850, teto: 2400, resumo: "Registra compras, recebe pagamentos e fecha o caixa." },
  { slug: "repositor", piso: 1630, media: 1850, teto: 2300, resumo: "Repõe e organiza produtos nas prateleiras de mercados e lojas." },
  { slug: "balconista", piso: 1630, media: 1850, teto: 2400, resumo: "Atende no balcão de padarias, farmácias e lojas de bairro." },
  { slug: "promotor-de-vendas", piso: 1700, media: 2100, teto: 3000, resumo: "Divulga e organiza produtos de marcas em pontos de venda." },
  { slug: "consultor-de-vendas", piso: 1800, media: 2600, teto: 4500, resumo: "Vende produtos e serviços com metas — comissões pesam mais que o fixo." },
  { slug: "recepcionista", piso: 1630, media: 2000, teto: 2800, resumo: "Recebe clientes, atende telefone e organiza agendas em empresas e clínicas." },
  { slug: "telemarketing", piso: 1630, media: 1850, teto: 2500, resumo: "Atende e faz ligações de vendas, cobrança ou suporte em call centers." },
  { slug: "auxiliar-administrativo", piso: 1630, media: 2000, teto: 2800, resumo: "Cuida de rotinas de escritório: planilhas, documentos e atendimento." },
  { slug: "assistente-administrativo", piso: 1800, media: 2300, teto: 3200, resumo: "Apoia processos administrativos, financeiros e de RH." },
  { slug: "secretaria", piso: 1800, media: 2400, teto: 3500, resumo: "Organiza agenda, reuniões e comunicação de gestores e diretores." },
  { slug: "office-boy", piso: 1630, media: 1800, teto: 2200, resumo: "Faz serviços externos de banco, cartório e entregas de documentos." },
  { slug: "tecnico-de-enfermagem", piso: 2200, media: 2800, teto: 4000, resumo: "Presta cuidados de enfermagem em hospitais, clínicas e home care (exige COREN)." },
  { slug: "auxiliar-de-enfermagem", piso: 1900, media: 2300, teto: 3200, resumo: "Apoia a equipe de enfermagem em cuidados básicos de pacientes." },
  { slug: "cabeleireiro", piso: 1700, media: 2400, teto: 4500, resumo: "Corta, colore e trata cabelos — comissão por atendimento é comum." },
  { slug: "manicure", piso: 1630, media: 1900, teto: 3000, resumo: "Faz unhas em salões ou atendimento domiciliar — agenda própria aumenta a renda." },
  { slug: "esteticista", piso: 1700, media: 2300, teto: 3800, resumo: "Realiza tratamentos faciais e corporais em clínicas de estética." },
  { slug: "depiladora", piso: 1630, media: 1900, teto: 2900, resumo: "Realiza depilação em salões e clínicas de estética." },
  { slug: "massagista", piso: 1700, media: 2200, teto: 3500, resumo: "Aplica massagens relaxantes e terapêuticas em clínicas e spas." },
  { slug: "professor-particular", piso: 1700, media: 2500, teto: 4500, resumo: "Dá aulas de reforço e idiomas — cobra por hora-aula." },
  { slug: "monitor-escolar", piso: 1630, media: 1850, teto: 2400, resumo: "Acompanha alunos em escolas, transporte e atividades." },
  { slug: "mecanico-de-automoveis", piso: 2000, media: 2800, teto: 4500, resumo: "Diagnostica e conserta veículos em oficinas e concessionárias." },
  { slug: "lavador-de-carros", piso: 1630, media: 1800, teto: 2400, resumo: "Lava e higieniza veículos em lava-rápidos e estéticas automotivas." },
  { slug: "frentista", piso: 1700, media: 2000, teto: 2600, resumo: "Abastece veículos e atende clientes em postos de combustível." },
  { slug: "costureira", piso: 1630, media: 2100, teto: 3200, resumo: "Costura e ajusta roupas em confecções, ateliês ou por conta própria." },
];

const porSlug = new Map(SALARIOS.map((s) => [s.slug, s]));

export function getSalarioInfo(slug: string) {
  const s = porSlug.get(slug);
  if (!s) return null;
  const prof = PROFISSOES.find((p) => p.slug === slug);
  if (!prof) return null;
  return { ...s, nome: prof.nome, emoji: prof.emoji, categoria: prof.categoria ?? "Outros" };
}

export function listarSalarios() {
  return SALARIOS
    .map((s) => getSalarioInfo(s.slug))
    .filter((s): s is NonNullable<ReturnType<typeof getSalarioInfo>> => s != null);
}

/** Fatores que puxam o salário pra cima, por categoria — texto compartilhado. */
export const FATORES_POR_CATEGORIA: Record<string, string[]> = {
  "Construção Civil": ["Experiência comprovada em obras maiores", "Trabalhar por empreitada ou diária em vez de fixo", "Ter ferramentas próprias e NR-35 (trabalho em altura)"],
  "Logística": ["Certificação de empilhadeira ou movimentação de carga", "Turnos noturnos (adicional de 20%+)", "Experiência com sistemas de estoque (WMS)"],
  "Transporte": ["Categoria de CNH mais alta (C, D, E)", "Curso de transporte de carga ou passageiros", "Disponibilidade pra viagens e rotas longas"],
  "Alimentação": ["Experiência em cozinha de alto movimento", "Turnos de madrugada e fim de semana", "Especialização (confeitaria, pizzaria, grelha)"],
  "Serviços Gerais": ["Adicional noturno e escala 12x36", "Curso de segurança ou brigada de incêndio", "Experiência em condomínios e empresas grandes"],
  "Serviços Domésticos": ["Carteira de clientes fixos", "Referências de empregadores anteriores", "Morar perto das regiões de maior demanda"],
  "Comércio": ["Comissão sobre vendas — pode dobrar o fixo", "Experiência com metas e CRM", "Conhecer bem o produto que vende"],
  "Atendimento": ["Boa comunicação e paciência com o público", "Informática básica e sistemas de atendimento", "Segundo idioma abre portas melhores"],
  "Administrativo": ["Excel e informática intermediária", "Experiência com rotinas fiscais e RH", "Boa comunicação escrita"],
  "Saúde": ["Registro ativo no conselho (COREN)", "Plantões noturnos e fins de semana", "Especializações (UTI, home care, idosos)"],
  "Cuidados": ["Curso de cuidador e primeiros socorros", "Referências de famílias anteriores", "Disponibilidade pra pernoite e fim de semana"],
  "Segurança": ["Curso de vigilante atualizado (reciclagem)", "Escala 12x36 e adicional noturno", "Porte e experiência em segurança patrimonial"],
  "Beleza": ["Carteira própria de clientes", "Cursos de especialização e novidades técnicas", "Atendimento domiciliar com agenda própria"],
  "Educação": ["Formação na área de ensino", "Aulas de idiomas ou reforço especializado", "Indicações de alunos satisfeitos"],
  "Automotivo": ["Especialização em injeção eletrônica ou câmbio", "Experiência com marcas premium", "Ferramentas próprias"],
  "Indústria": ["Certificações técnicas (NR-12, solda, caldeiraria)", "Turnos noturnos com adicional", "Experiência com máquinas específicas"],
  "Confecção": ["Máquinas próprias (overloque, galoneira)", "Produção por peça com volume", "Ajustes finos e alfaiataria"],
};

export function fatoresDe(categoria: string): string[] {
  return FATORES_POR_CATEGORIA[categoria] ?? [
    "Experiência comprovada na função",
    "Cursos e certificações da área",
    "Disponibilidade de horário e boas referências",
  ];
}
