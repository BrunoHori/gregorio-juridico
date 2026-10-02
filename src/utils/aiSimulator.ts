import { AreaDireito, BriefingAudienciaIA, Subtarefa } from '../types'

function getRelativeDate(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export interface AnaliseIntimacaoResult {
  titulo: string
  processoNumero: string
  tribunal: string
  vara: string
  cliente: string
  parteContraria: string
  diasUteis: number
  dataFatal: string
  area: AreaDireito
  resumoIntimacao: string
  camposSugeridos: string[]
}

/**
 * Motor Simulado de Inteligência Artificial para Leitura e Extração de Intimações Judiciais
 * Reconhece formatos de publicação do Diário de Justiça (DJe, PJe, Projudi, e-SAJ) e arquivos PDF/DOCX
 */
export function analisarIntimacaoComIA(textoOuNomeArquivo: string): AnaliseIntimacaoResult {
  const t = textoOuNomeArquivo.toLowerCase()

  // 1. Número do Processo (CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO)
  const cnjRegex = /(\d{7}[-.]?\d{2}[-.]?\d{4}[-.]?\d[-.]?\d{2}[-.]?\d{4})/
  const cnjMatch = textoOuNomeArquivo.match(cnjRegex)
  const processo = cnjMatch
    ? cnjMatch[1]
    : `${Math.floor(1000000 + Math.random() * 9000000)}-${String(Math.floor(10 + Math.random() * 89))}.2024.8.26.0100`

  // 2. Detecção de Tribunal
  let tribunal = 'TJSP'
  if (t.includes('trt-1') || t.includes('trt1') || (t.includes('rio de janeiro') && t.includes('trabalh'))) {
    tribunal = 'TRT-1'
  } else if (t.includes('trt-2') || t.includes('trt2') || t.includes('trabalho')) {
    tribunal = 'TRT-2'
  } else if (t.includes('trf-3') || t.includes('trf3') || t.includes('federal') || t.includes('uniao')) {
    tribunal = 'TRF-3'
  } else if (t.includes('stj') || t.includes('superior')) {
    tribunal = 'STJ'
  } else if (t.includes('tjmg')) {
    tribunal = 'TJMG'
  } else if (t.includes('tjrj')) {
    tribunal = 'TJRJ'
  }

  // 3. Detecção de Vara
  let vara = '12ª Vara Cível Central'
  if (tribunal.startsWith('TRT')) {
    vara = '14ª Vara do Trabalho'
  } else if (tribunal.startsWith('TRF')) {
    vara = '5ª Vara Cível Federal'
  } else if (t.includes('família') || t.includes('familia')) {
    vara = '2ª Vara da Família e Sucessões'
  } else if (t.includes('fazenda')) {
    vara = '4ª Vara da Fazenda Pública'
  }

  // 4. Detecção de Tipo de Ato Processual e Prazos do CPC/CLT
  let titulo = 'Manifestação sobre Despacho'
  let diasUteis = 15
  let area: AreaDireito = 'Cível'

  if (t.includes('apela') || t.includes('senten') || t.includes('recurso de apelação')) {
    titulo = 'Recurso de Apelação - Reforma de Sentença'
    diasUteis = 15
    area = 'Cível'
  } else if (t.includes('contest') || t.includes('cita') || t.includes('reconven')) {
    titulo = 'Contestação com Preliminares de Mérito'
    diasUteis = 15
    area = 'Cível'
  } else if (t.includes('embargos de declara') || t.includes('omiss') || t.includes('obscur')) {
    titulo = 'Embargos de Declaração por Omissão/Contradição'
    diasUteis = 5
    area = 'Cível'
  } else if (t.includes('réplica') || t.includes('replica') || t.includes('impugnação')) {
    titulo = 'Réplica à Contestação e Documentos'
    diasUteis = 15
    area = 'Cível'
  } else if (t.includes('agravo') || t.includes('liminar') || t.includes('tutela')) {
    titulo = 'Agravo de Instrumento com Pedido de Efeito Suspensivo'
    diasUteis = 15
    area = 'Cível'
  } else if (t.includes('quesitos') || t.includes('perícia') || t.includes('perito')) {
    titulo = 'Apresentação de Quesitos e Assistente Técnico'
    diasUteis = 15
    area = 'Cível'
  } else if (t.includes('trabalh') || t.includes('reclam')) {
    titulo = 'Recurso Ordinário Trabalhista (RO)'
    diasUteis = 8
    area = 'Trabalhista'
  } else if (t.includes('tribut') || t.includes('fiscal') || t.includes('fazenda')) {
    titulo = 'Manifestação em Execução Fiscal'
    diasUteis = 30
    area = 'Tributário'
  }

  // 5. Partes envolvidas
  let cliente = 'Nexus Logística e Transportes S.A.'
  let parteContraria = 'Seguradora Porto Real Ltda'

  if (area === 'Trabalhista') {
    cliente = 'Carlos Eduardo Nogueira'
    parteContraria = 'Viação Estrela do Norte S.A.'
  } else if (area === 'Tributário') {
    cliente = 'Alpha Química Industrial Ltda'
    parteContraria = 'União Federal (Fazenda Nacional)'
  }

  // Se o texto tiver indicação de nomes
  const autorMatch = textoOuNomeArquivo.match(/autor[a]?[:\s]+([^,\n\r]+)/i)
  if (autorMatch && autorMatch[1]) {
    cliente = autorMatch[1].trim()
  }
  const reuMatch = textoOuNomeArquivo.match(/r[ée]u[:\s]+([^,\n\r]+)/i)
  if (reuMatch && reuMatch[1]) {
    parteContraria = reuMatch[1].trim()
  }

  const dataFatal = getRelativeDate(diasUteis)

  return {
    titulo,
    processoNumero: processo,
    tribunal,
    vara,
    cliente,
    parteContraria,
    diasUteis,
    dataFatal,
    area,
    resumoIntimacao: `Publicação intimando a parte ré para interposição do ato no prazo de ${diasUteis} dias úteis conforme Art. 1.003, § 5º e Art. 219 do CPC.`,
    camposSugeridos: [
      'titulo',
      'processoNumero',
      'tribunal',
      'vara',
      'cliente',
      'parteContraria',
      'diasUteis',
      'dataFatal',
      'area',
    ],
  }
}

/**
 * Gera Briefing Estruturado da Audiência para o Advogado Audiencista
 * Dividido em 3 blocos diretos conforme requisitos:
 * 1. Tese do autor
 * 2. Contraponto do réu
 * 3. Pontos controvertidos a instruir
 */
export function gerarBriefingAudiencia(
  tipoAudiencia: string,
  cliente: string,
  parteContraria: string,
  notas?: string
): BriefingAudienciaIA {
  const agora = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const complemento = notas ? ` [Foco: ${notas}]` : ''

  return {
    teseAutor: `Para audiência de ${tipoAudiencia}, o Autor (${cliente}) pleiteia a responsabilização integral e indenização material e moral decorrente do inadimplemento contratual/acidente, alegando prejuízo de R$ 85.000,00.${complemento}`,
    contrapontoReu: `A parte contrária (${parteContraria}) alega preliminar de ilegitimidade passiva e, no mérito, sustenta culpa exclusiva de terceiro com excludente de nexo causal. Apresenta proposta informal de acordo limitada a R$ 35.000,00 em 3 parcelas.`,
    pontosControvertidos: [
      'Demonstração da responsabilidade objetiva pelo evento danoso e data de início do sinistro.',
      'Oitiva das testemunhas para comprovar se houve aviso prévio de descumprimento contratual.',
      'Validade dos orçamentos e notas fiscais acostados aos autos para liquidação de danos.',
    ],
    geradoEm: agora,
  }
}

/**
 * Sugere checklist de 3 a 5 subtarefas práticas e processuais para a tarefa
 */
export function sugerirChecklistTarefa(titulo: string, descricao?: string): Subtarefa[] {
  const t = (titulo + ' ' + (descricao || '')).toLowerCase()

  if (t.includes('contest') || t.includes('defesa')) {
    return [
      { id: 'sub-1', titulo: 'Conferir prazo fatal e data da juntada do mandado de citação', concluida: true },
      { id: 'sub-2', titulo: 'Verificar preliminares de mérito (inépcia da inicial e ilegitimidade)', concluida: false },
      { id: 'sub-3', titulo: 'Checar prescrição trienal/quinquenal com base nos documentos', concluida: false },
      { id: 'sub-4', titulo: 'Minutar tese defensiva e juntar documentos comprobatórios', concluida: false },
      { id: 'sub-5', titulo: 'Submeter peça à revisão do sócio antes do protocolo', concluida: false },
    ]
  }

  if (t.includes('recurso') || t.includes('apela') || t.includes('agravo')) {
    return [
      { id: 'sub-1', titulo: 'Emitir guia de preparo recursal DARE e comprovar pagamento', concluida: false },
      { id: 'sub-2', titulo: 'Confrontar tópicos da decisão recorrida ponto a ponto', concluida: false },
      { id: 'sub-3', titulo: 'Minutar preliminares de cerceamento de defesa e mérito', concluida: false },
      { id: 'sub-4', titulo: 'Revisar minuta final com o advogado responsável', concluida: false },
    ]
  }

  if (t.includes('audiência') || t.includes('audiencia') || t.includes('testemunha')) {
    return [
      { id: 'sub-1', titulo: 'Alinhar com o cliente/preposto 24 horas antes do ato', concluida: false },
      { id: 'sub-2', titulo: 'Confirmar envio do link virtual (Teams/Zoom) para testemunhas', concluida: false },
      { id: 'sub-3', titulo: 'Imprimir ou salvar offline o Briefing e notas estratégicas', concluida: false },
      { id: 'sub-4', titulo: 'Conferir termo de assentada ao encerramento da audiência', concluida: false },
    ]
  }

  // Padrão processual geral
  return [
    { id: 'sub-1', titulo: 'Levantar documentos comprobatórios e certidões necessárias', concluida: true },
    { id: 'sub-2', titulo: 'Redigir a minuta técnica no padrão de qualidade da banca', concluida: false },
    { id: 'sub-3', titulo: 'Conferir com o cliente eventuais dados complementares', concluida: false },
    { id: 'sub-4', titulo: 'Efetuar protocolo no tribunal e arquivar comprovante', concluida: false },
  ]
}
