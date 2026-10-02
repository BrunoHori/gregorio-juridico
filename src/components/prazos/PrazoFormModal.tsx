import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Prazo, AreaDireito, Anexo } from '../../types'
import { useTenant } from '../../context/TenantContext'
import { getTodayString } from '../../utils/dateUtils'
import { formatCNJ, detectTribunalFromCNJ } from '../../utils/cnjUtils'
import { FileUpload } from '../common/FileUpload'
import { analisarIntimacaoComIA } from '../../utils/aiSimulator'
import { useToast } from '../common/Toast'

interface PrazoFormModalProps {
  isOpen: boolean
  onClose: () => void
  prazoToEdit?: Prazo | null
}

export const PrazoFormModal: React.FC<PrazoFormModalProps> = ({
  isOpen,
  onClose,
  prazoToEdit,
}) => {
  const { currentTenant, addPrazo, updatePrazo } = useTenant()
  const { success, error } = useToast()

  // Form Fields
  const [titulo, setTitulo] = useState('')
  const [processoNumero, setProcessoNumero] = useState('')
  const [tribunal, setTribunal] = useState('')
  const [vara, setVara] = useState('')
  const [cliente, setCliente] = useState('')
  const [parteContraria, setParteContraria] = useState('')
  const [dataFatal, setDataFatal] = useState('')
  const [horarioLimite, setHorarioLimite] = useState('23:59')
  const [diasUteis, setDiasUteis] = useState<number | undefined>(15)
  const [advogadoId, setAdvogadoId] = useState('')
  const [area, setArea] = useState<AreaDireito>('Cível')
  const [observacoes, setObservacoes] = useState('')
  const [linkTribunal, setLinkTribunal] = useState('')

  // Anexos (Entrada e Saída)
  const [anexosIntimacao, setAnexosIntimacao] = useState<Anexo[]>([])
  const [anexosProtocolo, setAnexosProtocolo] = useState<Anexo[]>([])

  // IA Assistant State
  const [isAIOpen, setIsAIOpen] = useState(true)
  const [textoIntimacao, setTextoIntimacao] = useState('')
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
  const [camposSugeridosIA, setCamposSugeridosIA] = useState<string[]>([])

  useEffect(() => {
    if (prazoToEdit) {
      setTitulo(prazoToEdit.titulo)
      setProcessoNumero(prazoToEdit.processoNumero)
      setTribunal(prazoToEdit.tribunal)
      setVara(prazoToEdit.vara)
      setCliente(prazoToEdit.cliente)
      setParteContraria(prazoToEdit.parteContraria)
      setDataFatal(prazoToEdit.dataFatal)
      setHorarioLimite(prazoToEdit.horarioLimite || '23:59')
      setDiasUteis(prazoToEdit.diasUteis || 15)
      setAdvogadoId(prazoToEdit.advogadoId)
      setArea(prazoToEdit.area)
      setObservacoes(prazoToEdit.observacoes || '')
      setLinkTribunal(prazoToEdit.linkTribunal || '')
      setAnexosIntimacao(prazoToEdit.anexoIntimacao ? [prazoToEdit.anexoIntimacao] : [])
      setAnexosProtocolo(prazoToEdit.anexoProtocolo ? [prazoToEdit.anexoProtocolo] : [])
      setCamposSugeridosIA(prazoToEdit.camposSugeridosIA || [])
      setIsAIOpen(false)
    } else {
      setTitulo('')
      setProcessoNumero('')
      setTribunal('')
      setVara('')
      setCliente('')
      setParteContraria('')
      setDataFatal(getTodayString())
      setHorarioLimite('23:59')
      setDiasUteis(15)
      setAdvogadoId(currentTenant.advogados[0]?.id || '')
      setArea(currentTenant.areas[0] || 'Cível')
      setObservacoes('')
      setLinkTribunal('')
      setAnexosIntimacao([])
      setAnexosProtocolo([])
      setTextoIntimacao('')
      setCamposSugeridosIA([])
      setIsAIOpen(true)
    }
  }, [prazoToEdit, isOpen, currentTenant])

  const handleProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const formatted = formatCNJ(raw)
    setProcessoNumero(formatted)

    if (!tribunal) {
      const detected = detectTribunalFromCNJ(formatted)
      if (detected) setTribunal(detected)
    }
  }

  // Preenchimento via IA
  const handleAnalisarIA = () => {
    const input = textoIntimacao.trim() || (anexosIntimacao[0]?.nome || '')
    if (!input) {
      error('Texto ou arquivo não encontrado', 'Cole o recorte do Diário Oficial ou anexe o PDF da intimação.')
      return
    }

    setIsAnalyzingAI(true)

    setTimeout(() => {
      setIsAnalyzingAI(false)
      const res = analisarIntimacaoComIA(input)

      setTitulo(res.titulo)
      setProcessoNumero(res.processoNumero)
      setTribunal(res.tribunal)
      setVara(res.vara)
      setCliente(res.cliente)
      setParteContraria(res.parteContraria)
      setDiasUteis(res.diasUteis)
      setDataFatal(res.dataFatal)
      setArea(res.area)
      setObservacoes((prev) => (prev ? `${prev}\n\n[IA]: ${res.resumoIntimacao}` : `[IA]: ${res.resumoIntimacao}`))
      setCamposSugeridosIA(res.camposSugeridos)

      success('Intimação analisada com sucesso!', 'Os campos foram pré-preenchidos. Confira e ajuste antes de salvar.')
    }, 600)
  }

  const limparSugestoesIA = () => {
    setCamposSugeridosIA([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !processoNumero.trim() || !dataFatal) {
      error('Campos incompletos', 'Preencha Ato/Título, Processo e Data Fatal.')
      return
    }

    const payload = {
      titulo,
      processoNumero,
      tribunal: tribunal || 'TJSP',
      vara,
      cliente,
      parteContraria,
      dataFatal,
      horarioLimite,
      diasUteis,
      advogadoId: advogadoId || currentTenant.advogados[0]?.id,
      area,
      observacoes,
      linkTribunal,
      anexoIntimacao: anexosIntimacao[0],
      anexoProtocolo: anexosProtocolo[0],
      preenchidoPorIA: camposSugeridosIA.length > 0,
      camposSugeridosIA,
      textoIntimacaoOriginal: textoIntimacao,
    }

    if (prazoToEdit) {
      updatePrazo(prazoToEdit.id, payload)
      success('Prazo atualizado com sucesso!')
    } else {
      addPrazo({
        ...payload,
        status: 'em_andamento',
      })
      success('Novo prazo cadastrado na pauta!')
    }

    onClose()
  }

  const inputClasses =
    'w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={prazoToEdit ? 'Editar Prazo Processual' : 'Cadastrar Novo Prazo Processual'}
      subtitle="Defina os dados do ato judicial, processo, anexos e data limite fatal"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Bloco 1: Assistente IA de Leitura de Intimações (Destaque e atalho) */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/70 dark:from-slate-800/80 dark:via-blue-950/20 dark:to-slate-800/80 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/40 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <span>Assistente IA: Preenchimento Rápido via Intimação</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsAIOpen(!isAIOpen)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {isAIOpen ? 'Recolher Assistente' : 'Expandir Assistente'}
            </button>
          </div>

          {isAIOpen && (
            <div className="space-y-3 pt-1 text-xs">
              <p className="text-gray-600 dark:text-slate-300">
                Cole o recorte da publicação do Diário de Justiça ou suba o PDF da intimação. A IA lerá o teor, identificará o ato, o tribunal e calculará os prazos:
              </p>

              <textarea
                rows={3}
                value={textoIntimacao}
                onChange={(e) => setTextoIntimacao(e.target.value)}
                placeholder="Exemplo: 'Fica a parte ré intimada para apresentar Recurso de Apelação no prazo legal de 15 dias úteis referente aos autos 1023456-88.2023.8.26.0100 da 12ª Vara Cível...'"
                className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400"
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={isAnalyzingAI}
                    onClick={handleAnalisarIA}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    {isAnalyzingAI ? 'Analisando...' : '✨ Analisar Intimação com IA'}
                  </Button>
                  {camposSugeridosIA.length > 0 && (
                    <button
                      type="button"
                      onClick={limparSugestoesIA}
                      className="text-[11px] text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-white"
                    >
                      Remover destaque IA
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-gray-400 dark:text-slate-500">
                  Formulário tradicional sempre editável abaixo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bloco 2: Dados do Ato Processual */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
              Ato Judicial / Título do Prazo *
            </label>
            {camposSugeridosIA.includes('titulo') && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                ✨ Sugerido por IA
              </span>
            )}
          </div>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Apelação Cível, Contestação, Razões Finais, Embargos de Declaração"
            className={inputClasses}
          />
        </div>

        {/* Processo CNJ e Tribunal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
                Número do Processo (CNJ) *
              </label>
              {camposSugeridosIA.includes('processoNumero') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ✨ Sugerido por IA
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={processoNumero}
              onChange={handleProcessoChange}
              placeholder="0000000-00.0000.0.00.0000"
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
                Tribunal
              </label>
              {camposSugeridosIA.includes('tribunal') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ✨ IA
                </span>
              )}
            </div>
            <input
              type="text"
              value={tribunal}
              onChange={(e) => setTribunal(e.target.value)}
              placeholder="Ex: TJSP, TRT-2"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Vara */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
              Vara / Foro
            </label>
            {camposSugeridosIA.includes('vara') && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                ✨ Sugerido por IA
              </span>
            )}
          </div>
          <input
            type="text"
            value={vara}
            onChange={(e) => setVara(e.target.value)}
            placeholder="Ex: 12ª Vara Cível Central da Capital"
            className={inputClasses}
          />
        </div>

        {/* Partes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
                Cliente
              </label>
              {camposSugeridosIA.includes('cliente') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ✨ IA
                </span>
              )}
            </div>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className={inputClasses}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
                Parte Contrária
              </label>
              {camposSugeridosIA.includes('parteContraria') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ✨ IA
                </span>
              )}
            </div>
            <input
              type="text"
              value={parteContraria}
              onChange={(e) => setParteContraria(e.target.value)}
              placeholder="Nome da parte adversa"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Datas e Prazos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
                Data Fatal *
              </label>
              {camposSugeridosIA.includes('dataFatal') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ✨ IA
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={dataFatal}
              onChange={(e) => setDataFatal(e.target.value)}
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Horário Limite
            </label>
            <input
              type="time"
              value={horarioLimite}
              onChange={(e) => setHorarioLimite(e.target.value)}
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
                Dias Úteis (CPC/CLT)
              </label>
              {camposSugeridosIA.includes('diasUteis') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ✨ IA
                </span>
              )}
            </div>
            <input
              type="number"
              value={diasUteis || ''}
              onChange={(e) => setDiasUteis(parseInt(e.target.value, 10) || undefined)}
              placeholder="Ex: 15"
              className={`${inputClasses} font-mono`}
            />
          </div>
        </div>

        {/* Advogado Responsável e Área */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Advogado Responsável
            </label>
            <select
              value={advogadoId}
              onChange={(e) => setAdvogadoId(e.target.value)}
              className={inputClasses}
            >
              {currentTenant.advogados.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.nome} ({adv.oab}) {adv.cargo ? `• ${adv.cargo}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Área do Direito
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value as AreaDireito)}
              className={inputClasses}
            >
              {currentTenant.areas.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bloco 3: Anexos do Fluxo (Entrada: Intimação / Saída: Protocolo de Cumprimento) */}
        <div className="p-4 bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
            Documentos e Comprovações do Prazo
          </h4>

          {/* Gatilho: Intimação/Despacho */}
          <FileUpload
            label="1. Entrada (Gatilho): PDF da Intimação, Despacho ou Sentença"
            files={anexosIntimacao}
            onFilesChange={setAnexosIntimacao}
            categoria="intimacao"
            maxFiles={1}
            helperText="Anexe a certidão ou PDF extraído do tribunal (PJe, Projudi, e-SAJ)"
          />

          {/* Saída: Protocolo */}
          <FileUpload
            label="2. Saída (Comprovação): Protocolo de Cumprimento da Petição"
            files={anexosProtocolo}
            onFilesChange={setAnexosProtocolo}
            categoria="protocolo"
            maxFiles={1}
            helperText="Anexe o recibo com carimbo do tribunal para baixa formal do prazo"
          />
        </div>

        {/* Observações */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
            Instruções Estratégicas
          </label>
          <textarea
            rows={2}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Não esquecer de anexar a guia DARE; verificar certidão de intimação fls. 450..."
            className={inputClasses}
          />
        </div>

        {/* Footer Buttons */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {prazoToEdit ? 'Salvar Alterações' : 'Cadastrar Prazo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
