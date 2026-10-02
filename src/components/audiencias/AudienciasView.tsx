import React, { useState, useMemo } from 'react'
import { useTenant } from '../../context/TenantContext'
import { Audiencia } from '../../types'
import { getTodayString, formatDateBr, getDaysDifference } from '../../utils/dateUtils'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  IconPlus,
  IconVideo,
  IconMapPin,
  IconCopy,
  IconExternalLink,
  IconEdit,
  IconTrash,
  IconSearch,
  IconUsers,
} from '../common/Icons'
import { useToast } from '../common/Toast'
import { AudienciaFormModal } from './AudienciaFormModal'
import { baixarArquivoReal } from '../../utils/fileStorage'

export const AudienciasView: React.FC = () => {
  const { currentTenant, audiencias, setAudienciaStatus, deleteAudiencia } = useTenant()
  const { success } = useToast()
  const todayStr = getTodayString()

  const [filterTab, setFilterTab] = useState<
    'todas' | 'hoje' | 'semana' | 'virtual' | 'presencial' | 'realizadas'
  >('todas')
  const [selectedAdvogadoId, setSelectedAdvogadoId] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [audienciaToEdit, setAudienciaToEdit] = useState<Audiencia | null>(null)

  const handleCopyProcesso = (num: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(num)
    success('Número copiado!', num)
  }

  const handleDelete = (id: string, tipo: string) => {
    if (confirm(`Excluir o agendamento da audiência "${tipo}"?`)) {
      deleteAudiencia(id)
      success('Audiência removida')
    }
  }

  const filteredAudiencias = useMemo(() => {
    return audiencias.filter((aud) => {
      // Busca
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          aud.tipo.toLowerCase().includes(q) ||
          aud.cliente.toLowerCase().includes(q) ||
          aud.processoNumero.includes(q) ||
          (aud.local && aud.local.toLowerCase().includes(q))
        if (!match) return false
      }

      // Advogado
      if (selectedAdvogadoId !== 'todos' && aud.advogadoId !== selectedAdvogadoId) {
        return false
      }

      const isHoje = aud.data === todayStr
      const diff = getDaysDifference(aud.data)
      const isRealizada = aud.status === 'realizada'

      if (filterTab === 'hoje') return isHoje
      if (filterTab === 'semana') return diff >= 0 && diff <= 7 && !isRealizada
      if (filterTab === 'virtual') return aud.modalidade === 'telepresencial' && !isRealizada
      if (filterTab === 'presencial') return aud.modalidade === 'presencial' && !isRealizada
      if (filterTab === 'realizadas') return isRealizada

      return true
    })
  }, [audiencias, filterTab, selectedAdvogadoId, searchQuery, todayStr])

  const audienciasHojeCount = audiencias.filter(
    (a) => a.data === todayStr && a.status !== 'realizada'
  ).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <IconVideo className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Pauta de Audiências
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Gestão de audiências virtuais e presenciais, salas de videoconferência e advogados designados
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setAudienciaToEdit(null)
            setIsModalOpen(true)
          }}
          icon={<IconPlus className="w-4 h-4" />}
        >
          Agendar Audiência
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle space-y-4 transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold">
          <button
            onClick={() => setFilterTab('todas')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'todas'
                ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Todas ({audiencias.length})
          </button>
          <button
            onClick={() => setFilterTab('hoje')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              filterTab === 'hoje'
                ? 'bg-blue-700 dark:bg-blue-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Hoje</span>
            {audienciasHojeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 font-bold">
                {audienciasHojeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('semana')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'semana'
                ? 'bg-gray-800 dark:bg-slate-700 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Próximos 7 Dias
          </button>
          <button
            onClick={() => setFilterTab('virtual')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'virtual'
                ? 'bg-blue-800 dark:bg-blue-700 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Telepresenciais (Virtuais)
          </button>
          <button
            onClick={() => setFilterTab('presencial')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'presencial'
                ? 'bg-gray-800 dark:bg-slate-700 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Presenciais (Fóruns)
          </button>
          <button
            onClick={() => setFilterTab('realizadas')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'realizadas'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Realizadas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div className="relative">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por tipo, partes, processo, sala..."
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <select
              value={selectedAdvogadoId}
              onChange={(e) => setSelectedAdvogadoId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
            >
              <option value="todos">Todos os Advogados Designados</option>
              {currentTenant.advogados.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Audiências */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAudiencias.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-900 p-14 text-center rounded-2xl border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 space-y-3.5">
            <IconVideo className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-gray-800 dark:text-slate-200">Nenhuma audiência encontrada</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-md mx-auto">
              Nenhuma audiência coincide com os filtros selecionados ou não há pauta para este período.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAudienciaToEdit(null)
                setIsModalOpen(true)
              }}
              icon={<IconPlus className="w-4 h-4" />}
            >
              Agendar Audiência
            </Button>
          </div>
        ) : (
          filteredAudiencias.map((aud) => {
            const isHoje = aud.data === todayStr
            const isRealizada = aud.status === 'realizada'
            const adv = currentTenant.advogados.find((a) => a.id === aud.advogadoId)

            return (
              <div
                key={aud.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 flex flex-col justify-between gap-4 shadow-subtle hover:border-gray-300 dark:hover:border-slate-700 transition-all ${
                  isRealizada
                    ? 'opacity-70 bg-gray-50/50 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800'
                    : isHoje
                    ? 'border-blue-400 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Bar: Data/Hora e Status */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-extrabold text-gray-900 dark:text-white">
                        {formatDateBr(aud.data)}
                      </span>
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-gray-900 text-white dark:bg-slate-100 dark:text-slate-900">
                        {aud.horario}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isHoje && (
                        <Badge variant="urgent" dot>
                          HOJE
                        </Badge>
                      )}
                      <span
                        className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-md border ${
                          isRealizada
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        {isRealizada ? 'Realizada' : aud.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Detalhes da Audiência */}
                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-2.5 py-0.5 rounded-md">
                        {aud.modalidade === 'telepresencial' ? 'Virtual' : 'Presencial'}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{aud.tipo}</h3>
                    </div>

                    <p className="text-sm text-gray-800 dark:text-slate-200 font-semibold">
                      {aud.cliente} <span className="text-gray-400 dark:text-slate-500 font-normal">vs</span> {aud.parteContraria}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-500">
                      <button
                        onClick={(e) => handleCopyProcesso(aud.processoNumero, e)}
                        className="font-mono text-xs sm:text-sm text-gray-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded-md transition-colors"
                        title="Copiar processo"
                      >
                        <span>{aud.processoNumero}</span>
                        <IconCopy className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>

                    {/* Local Físico ou Botão de Sala Virtual */}
                    {aud.modalidade === 'telepresencial' && aud.linkVirtual && (
                      <div className="pt-2">
                        <a
                          href={aud.linkVirtual}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors active:scale-[0.98]"
                        >
                          <IconVideo className="w-4.5 h-4.5 text-white" />
                          <span>Entrar na Sala Virtual da Audiência</span>
                          <IconExternalLink className="w-3.5 h-3.5 text-white/80" />
                        </a>
                      </div>
                    )}

                    {aud.modalidade === 'presencial' && aud.local && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300 pt-1.5">
                        <IconMapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span>{aud.local}</span>
                      </div>
                    )}

                    {/* Testemunhas */}
                    {aud.testemunhas && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300 pt-1">
                        <IconUsers className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <span><strong>Testemunhas/Preposto:</strong> {aud.testemunhas}</span>
                      </div>
                    )}

                    {/* Briefing da Audiência (IA) se houver */}
                    {aud.briefingIA && (
                      <div className="mt-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 space-y-2 text-xs">
                        <div className="flex items-center justify-between pb-1 border-b border-blue-100 dark:border-blue-900/40">
                          <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                            ✨ Briefing para o Audiencista (IA)
                          </span>
                          <span className="text-[10px] text-gray-500 dark:text-slate-400">{aud.briefingIA.geradoEm}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-slate-200">Tese do Autor:</p>
                          <p className="text-gray-600 dark:text-slate-300">{aud.briefingIA.teseAutor}</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-slate-200">Contraponto do Réu:</p>
                          <p className="text-gray-600 dark:text-slate-300">{aud.briefingIA.contrapontoReu}</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-slate-200">Pontos Controvertidos:</p>
                          <ul className="list-disc pl-4 space-y-0.5 text-gray-600 dark:text-slate-300">
                            {aud.briefingIA.pontosControvertidos.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Anexos de Preparação (Ata, Termo, Inicial) */}
                    {aud.anexos && aud.anexos.length > 0 && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        {aud.anexos.map((anx) => (
                          <div
                            key={anx.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              baixarArquivoReal(anx)
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 font-medium cursor-pointer hover:bg-gray-200"
                            title="Clique para baixar documento de preparação"
                          >
                            <span>📎 {anx.nome}</span>
                            <span className="text-[10px] opacity-75">({anx.tamanhoFormatado})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Notas Estratégicas */}
                    {aud.notasEstrategicas && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-sm text-amber-900 dark:text-amber-200 italic">
                        <strong>Estratégia:</strong> {aud.notasEstrategicas}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer do Card: Advogado e Ações */}
                <div className="pt-3.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm">
                  {adv ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                      >
                        {adv.nome[0]}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-slate-300 font-semibold truncate max-w-[130px]">
                        {adv.nome}
                      </span>
                    </div>
                  ) : <div />}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setAudienciaStatus(
                          aud.id,
                          isRealizada ? 'confirmada' : 'realizada'
                        )
                      }
                      className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        isRealizada
                          ? 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                          : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {isRealizada ? 'Reabrir Pauta' : 'Marcar Realizada'}
                    </button>

                    <button
                      onClick={() => {
                        setAudienciaToEdit(aud)
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar audiência"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(aud.id, aud.tipo)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-red-950/60 rounded-lg transition-colors"
                      title="Excluir audiência"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal */}
      <AudienciaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setAudienciaToEdit(null)
        }}
        audienciaToEdit={audienciaToEdit}
      />
    </div>
  )
}
