export type AreaDireito =
  | 'Cível'
  | 'Trabalhista'
  | 'Tributário'
  | 'Família e Sucessões'
  | 'Penal'
  | 'Previdenciário'
  | 'Empresarial'
  | 'Consumidor'

export type CargoAdvogado = 'Sócio' | 'Advogado Associado' | 'Estagiário' | 'Administrador'

export interface Advogado {
  id: string
  nome: string
  oab: string
  email: string
  avatarColor: string
  ativo: boolean
  cargo?: CargoAdvogado
  telefone?: string
}

export type TipoAnexo = 'pdf' | 'docx' | 'imagem' | 'outro'
export type CategoriaAnexo = 'intimacao' | 'protocolo' | 'ata' | 'minuta' | 'prova' | 'geral'

export interface Anexo {
  id: string
  nome: string
  tamanho: number // bytes
  tamanhoFormatado: string // ex: "1.4 MB"
  tipo: TipoAnexo
  categoria: CategoriaAnexo
  dataUpload: string
  url?: string
}

export type StatusPrazo = 'urgente' | 'em_andamento' | 'cumprido' | 'suspenso'

export interface Prazo {
  id: string
  tenantId: string
  titulo: string // ex: "Recurso de Apelação", "Contestação", "Quesitos Periciais"
  processoNumero: string
  tribunal: string // ex: "TJSP", "TRT-2", "TRF-3", "STJ"
  vara: string // ex: "3ª Vara Cível da Capital"
  cliente: string
  parteContraria: string
  dataFatal: string // YYYY-MM-DD
  horarioLimite: string // "23:59" ou "19:00"
  diasUteis?: number
  advogadoId: string
  area: AreaDireito
  status: StatusPrazo
  dataProtocolo?: string
  observacoes?: string
  linkTribunal?: string
  createdAt: string
  // Anexos do fluxo (Entrada e Saída)
  anexoIntimacao?: Anexo // Gatilho: publicação, despacho, sentença em PDF/DOCX
  anexoProtocolo?: Anexo // Saída/Comprovação: protocolo interposto para baixa formal
  // Recursos de IA
  preenchidoPorIA?: boolean
  camposSugeridosIA?: string[]
  textoIntimacaoOriginal?: string
}

export type ModalidadeAudiencia = 'telepresencial' | 'presencial' | 'hibrida'
export type StatusAudiencia = 'confirmada' | 'em_preparacao' | 'realizada' | 'redesignada'

export interface BriefingAudienciaIA {
  teseAutor: string
  contrapontoReu: string
  pontosControvertidos: string[]
  geradoEm: string
}

export interface Audiencia {
  id: string
  tenantId: string
  tipo: string // "Instrução e Julgamento", "Conciliação", "Sessão de Julgamento", "Audiência Una"
  processoNumero: string
  cliente: string
  parteContraria: string
  data: string // YYYY-MM-DD
  horario: string // HH:mm
  modalidade: ModalidadeAudiencia
  local?: string // Sala 402, Fórum João Mendes
  linkVirtual?: string // link teams/meet/zoom
  advogadoId: string
  testemunhas?: string
  status: StatusAudiencia
  notasEstrategicas?: string
  resultado?: string
  createdAt: string
  // Anexos de Preparação (ata anterior, assentada, inicial)
  anexos?: Anexo[]
  // Briefing da Audiência gerado pela IA
  briefingIA?: BriefingAudienciaIA
}

export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'revisao' | 'concluido'
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta' | 'urgente'

export interface Subtarefa {
  id: string
  titulo: string
  concluida: boolean
}

export interface Tarefa {
  id: string
  tenantId: string
  titulo: string
  descricao?: string
  status: StatusTarefa
  prioridade: PrioridadeTarefa
  dataLimite?: string // YYYY-MM-DD
  advogadoId: string
  processoNumero?: string
  cliente?: string
  concluidaEm?: string
  createdAt: string
  // Anexos de Elaboração/Revisão (minuta DOCX para revisão do sócio, etc)
  anexos?: Anexo[]
  // Checklist / Subtarefas sugeridas pela IA ou manuais
  subtarefas?: Subtarefa[]
  sugeridoPorIA?: boolean
}

export interface EscritorioTenant {
  id: string
  nome: string // Nome fantasia do escritório
  razaoSocial?: string
  oabPrincipal: string
  cidade: string
  estado: string
  telefone?: string
  email?: string
  logoText: string // Sigla ou monograma, ex: "G&A"
  corDestaque?: string
  advogados: Advogado[]
  areas: AreaDireito[]
}

export interface AuthSession {
  tenantId: string | null
  advogadoId: string | null
  isAuthenticated: boolean
}

export type ViewTab = 'dashboard' | 'prazos' | 'audiencias' | 'tarefas' | 'pauta_impressao'
