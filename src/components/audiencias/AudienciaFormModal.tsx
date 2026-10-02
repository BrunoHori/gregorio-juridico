import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Audiencia, ModalidadeAudiencia, StatusAudiencia, Anexo, BriefingAudienciaIA } from '../../types'
import { useTenant } from '../../context/TenantContext'
import { getTodayString } from '../../utils/dateUtils'
import { formatCNJ } from '../../utils/cnjUtils'
import { FileUpload } from '../common/FileUpload'
import { gerarBriefingAudiencia } from '../../utils/aiSimulator'
import { useToast } from '../common/Toast'

interface AudienciaFormModalProps {
  isOpen: boolean
  onClose: () => void
  audienciaToEdit?: Audiencia | null
}

export const AudienciaFormModal: React.FC<AudienciaFormModalProps> = ({
  isOpen,
  onClose,
  audienciaToEdit,
}) => {
  const { currentTenant, addAudiencia, updateAudiencia } = useTenant()
  const { success } = useToast()

  const [tipo, setTipo] = useState('Instrução e Julgamento')
  const [processoNumero, setProcessoNumero] = useState('')
  const [cliente, setCliente] = useState('')
  const [parteContraria, setParteContraria] = useState('')
  const [data, setData] = useState('')
  const [horario, setHorario] = useState('14:00')
  const [modalidade, setModalidade] = useState<ModalidadeAudiencia>('telepresencial')
  const [local, setLocal] = useState('')
  const [linkVirtual, setLinkVirtual] = useState('')
  const [advogadoId, setAdvogadoId] = useState('')
  const [testemunhas, setTestemunhas] = useState('')
  const [status, setStatus] = useState<StatusAudiencia>('confirmada')
  const [notasEstrategicas, setNotasEstrategicas] = useState('')

  // Anexos de Preparação
  const [anexos, setAnexos] = useState<Anexo[]>([])

  // Briefing da Audiência com IA
  const [briefingIA, setBriefingIA] = useState<BriefingAudienciaIA | undefined>(undefined)
  const [isBriefingOpen, setIsBriefingOpen] = useState(true)
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false)

  useEffect(() => {
    if (audienciaToEdit) {
      setTipo(audienciaToEdit.tipo)
      setProcessoNumero(audienciaToEdit.processoNumero)
      setCliente(audienciaToEdit.cliente)
      setParteContraria(audienciaToEdit.parteContraria)
      setData(audienciaToEdit.data)
      setHorario(audienciaToEdit.horario)
      setModalidade(audienciaToEdit.modalidade)
      setLocal(audienciaToEdit.local || '')
      setLinkVirtual(audienciaToEdit.linkVirtual || '')
      setAdvogadoId(audienciaToEdit.advogadoId)
      setTestemunhas(audienciaToEdit.testemunhas || '')
      setStatus(audienciaToEdit.status)
      setNotasEstrategicas(audienciaToEdit.notasEstrategicas || '')
      setAnexos(audienciaToEdit.anexos || [])
      setBriefingIA(audienciaToEdit.briefingIA)
    } else {
      setTipo('Instrução e Julgamento')
      setProcessoNumero('')
      setCliente('')
      setParteContraria('')
      setData(getTodayString())
      setHorario('14:00')
      setModalidade('telepresencial')
      setLocal('')
      setLinkVirtual('')
      setAdvogadoId(currentTenant.advogados[0]?.id || '')
      setTestemunhas('')
      setStatus('confirmada')
      setNotasEstrategicas('')
      setAnexos([])
      setBriefingIA(undefined)
    }
  }, [audienciaToEdit, isOpen, currentTenant])

  const handleProcessoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProcessoNumero(formatCNJ(e.target.value))
  }

  // Geração do Briefing com IA
  const handleGerarBriefing = () => {
    setIsGeneratingBriefing(true)
    setTimeout(() => {
      setIsGeneratingBriefing(false)
      const novoBriefing = gerarBriefingAudiencia(
        tipo,
        cliente || 'Cliente Representado',
        parteContraria || 'Parte Adversa',
        notasEstrategicas
      )
      setBriefingIA(novoBriefing)
      setIsBriefingOpen(true)
      success('Briefing da audiência gerado!', 'Os 3 tópicos estratégicos estão prontos para conferência.')
    }, 500)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipo.trim() || !processoNumero.trim() || !data || !horario) {
      alert('Preencha os campos obrigatórios (Tipo, Processo, Data e Horário).')
      return
    }

    const payload = {
      tipo,
      processoNumero,
      cliente,
      parteContraria,
      data,
      horario,
      modalidade,
      local,
      linkVirtual,
      advogadoId: advogadoId || currentTenant.advogados[0]?.id,
      testemunhas,
      status,
      notasEstrategicas,
      anexos,
      briefingIA,
    }

    if (audienciaToEdit) {
      updateAudiencia(audienciaToEdit.id, payload)
      success('Audiência atualizada com sucesso!')
    } else {
      addAudiencia(payload)
      success('Audiência agendada na pauta forense!')
    }

    onClose()
  }

  const inputClasses =
    'w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={audienciaToEdit ? 'Editar Audiência' : 'Agendar Nova Audiência'}
      subtitle="Defina horário, modalidade, testemunhas, briefing da IA e anexos de preparação"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de Audiência e Processo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Tipo de Audiência *
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className={inputClasses}
            >
              <option value="Instrução e Julgamento">Instrução e Julgamento</option>
              <option value="Conciliação e Mediação (CEJUSC)">Conciliação e Mediação (CEJUSC)</option>
              <option value="Audiência Una Trabalhista">Audiência Una Trabalhista</option>
              <option value="Audiência de Justificação Prévia">Audiência de Justificação Prévia</option>
              <option value="Audiência de Saneamento Compartilhado">Audiência de Saneamento Compartilhado</option>
              <option value="Sessão de Julgamento Colegiado">Sessão de Julgamento Colegiado</option>
              <option value="Oitiva de Testemunhas (Carta Precatória)">Oitiva de Testemunhas (Carta Precatória)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Processo CNJ *
            </label>
            <input
              type="text"
              required
              value={processoNumero}
              onChange={handleProcessoChange}
              placeholder="0000000-00.0000.0.00.0000"
              className={`${inputClasses} font-mono`}
            />
          </div>
        </div>

        {/* Partes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Cliente
            </label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Parte Contrária
            </label>
            <input
              type="text"
              value={parteContraria}
              onChange={(e) => setParteContraria(e.target.value)}
              placeholder="Nome da parte adversa"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Data, Horário e Modalidade */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Data da Audiência *
            </label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Horário de Abertura *
            </label>
            <input
              type="time"
              required
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Modalidade
            </label>
            <select
              value={modalidade}
              onChange={(e) => setModalidade(e.target.value as ModalidadeAudiencia)}
              className={inputClasses}
            >
              <option value="telepresencial">Telepresencial (Virtual)</option>
              <option value="presencial">Presencial no Fórum</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </div>
        </div>

        {/* Link Virtual ou Local Físico */}
        {modalidade !== 'presencial' && (
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Link da Sala Virtual (Teams / Zoom / Meet / Google)
            </label>
            <input
              type="url"
              value={linkVirtual}
              onChange={(e) => setLinkVirtual(e.target.value)}
              placeholder="https://teams.microsoft.com/... ou https://zoom.us/..."
              className={`${inputClasses} font-mono`}
            />
          </div>
        )}

        {modalidade !== 'telepresencial' && (
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Local / Sala / Fórum Físico
            </label>
            <input
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Ex: Fórum João Mendes, Sala 402, 4º andar"
              className={inputClasses}
            />
          </div>
        )}

        {/* Advogado Designado e Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Advogado(a) Designado(a)
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
              Status da Pauta
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusAudiencia)}
              className={inputClasses}
            >
              <option value="confirmada">Confirmada</option>
              <option value="em_preparacao">Em Preparação</option>
              <option value="realizada">Realizada</option>
              <option value="redesignada">Redesignada</option>
            </select>
          </div>
        </div>

        {/* Testemunhas e Prepostos */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
            Rol de Testemunhas e Prepostos
          </label>
          <input
            type="text"
            value={testemunhas}
            onChange={(e) => setTestemunhas(e.target.value)}
            placeholder="Ex: Marcos Silva (Motorista - levar RG); Mariana Souza (Gerente)"
            className={inputClasses}
          />
        </div>

        {/* CARD RETRÁTIL: Briefing da Audiência para o Audiencista (IA) */}
        <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/70 dark:from-slate-800/80 dark:via-blue-950/20 dark:to-slate-800/80 rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                Briefing Estruturado da Audiência (Assistente IA)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isGeneratingBriefing}
                onClick={handleGerarBriefing}
                className="bg-white dark:bg-slate-900"
              >
                {isGeneratingBriefing ? 'Gerando...' : '✨ Gerar Resumo para o Audiencista'}
              </Button>
              <button
                type="button"
                onClick={() => setIsBriefingOpen(!isBriefingOpen)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {isBriefingOpen ? 'Recolher' : 'Expandir'}
              </button>
            </div>
          </div>

          {isBriefingOpen && (
            <div className="space-y-3 pt-2 text-xs">
              {briefingIA ? (
                <div className="space-y-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 pb-1 border-b border-gray-100 dark:border-slate-800">
                    <span className="font-bold text-blue-600 dark:text-blue-400">✨ Resumo Gerado por IA</span>
                    <span>{briefingIA.geradoEm}</span>
                  </div>

                  {/* 1. Tese do Autor */}
                  <div>
                    <label className="block font-bold text-gray-800 dark:text-slate-200 mb-1">
                      1. Tese do Autor:
                    </label>
                    <textarea
                      rows={2}
                      value={briefingIA.teseAutor}
                      onChange={(e) =>
                        setBriefingIA({ ...briefingIA, teseAutor: e.target.value })
                      }
                      className={inputClasses}
                    />
                  </div>

                  {/* 2. Contraponto do Réu */}
                  <div>
                    <label className="block font-bold text-gray-800 dark:text-slate-200 mb-1">
                      2. Contraponto do Réu:
                    </label>
                    <textarea
                      rows={2}
                      value={briefingIA.contrapontoReu}
                      onChange={(e) =>
                        setBriefingIA({ ...briefingIA, contrapontoReu: e.target.value })
                      }
                      className={inputClasses}
                    />
                  </div>

                  {/* 3. Pontos Controvertidos */}
                  <div>
                    <label className="block font-bold text-gray-800 dark:text-slate-200 mb-1">
                      3. Pontos Controvertidos a Instruir:
                    </label>
                    <div className="space-y-1.5">
                      {briefingIA.pontosControvertidos.map((ponto, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="font-bold text-blue-600 dark:text-blue-400 mt-1">•</span>
                          <input
                            type="text"
                            value={ponto}
                            onChange={(e) => {
                              const updated = [...briefingIA.pontosControvertidos]
                              updated[i] = e.target.value
                              setBriefingIA({ ...briefingIA, pontosControvertidos: updated })
                            }}
                            className={inputClasses}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-slate-400 italic">
                  Clique em &ldquo;Gerar Resumo para o Audiencista&rdquo; para que a IA sintetize a inicial e contestação em 3 tópicos diretos para o advogado que fará o ato.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Upload de Documentos de Preparação (Ata anterior, termo de assentada, etc) */}
        <div className="p-4 bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded-2xl">
          <FileUpload
            label="Documentos de Preparação da Audiência"
            files={anexos}
            onFilesChange={setAnexos}
            categoria="ata"
            maxFiles={3}
            helperText="Anexe atas anteriores, termos de assentada, cópia da inicial ou síntese dos fatos"
          />
        </div>

        {/* Notas Estratégicas */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
            Notas Estratégicas e Proposta Limite de Acordo
          </label>
          <textarea
            rows={2}
            value={notasEstrategicas}
            onChange={(e) => setNotasEstrategicas(e.target.value)}
            placeholder="Ex: Não aceitar proposta inferior a R$ 35.000,00; questionar a testemunha sobre..."
            className={inputClasses}
          />
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {audienciaToEdit ? 'Salvar Alterações' : 'Confirmar Audiência'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
