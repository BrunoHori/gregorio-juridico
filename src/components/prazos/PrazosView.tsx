import React, { useState, useMemo } from 'react'
import { useTenant } from '../../context/TenantContext'
import { Prazo } from '../../types'
import {
  getTodayString,
  formatDateBr,
  getDeadlineUrgency,
  getUrgencyBadgeInfo,
  getDaysDifference,
} from '../../utils/dateUtils'
import { Button } from '../common/Button'
import {
  IconPlus,
  IconScale,
  IconCopy,
  IconCheck,
  IconEdit,
  IconTrash,
  IconSearch,
  IconExternalLink,
} from '../common/Icons'
import { useToast } from '../common/Toast'
import { PrazoFormModal } from './PrazoFormModal'
import { baixarArquivoReal } from '../../utils/fileStorage'

export const PrazosView: React.FC = () => {
  const { currentTenant, prazos, togglePrazoCumprido, deletePrazo } = useTenant()
  const { success } = useToast()
  const todayStr = getTodayString()

  // Estados de filtro
  const [filterTab, setFilterTab] = useState<
    'todos' | 'hoje' | 'urgentes' | 'semana' | 'andamento' | 'cumpridos'
  >('todos')
  const [selectedAdvogadoId, setSelectedAdvogadoId] = useState<string>('todos')
  const [selectedArea, setSelectedArea] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [prazoToEdit, setPrazoToEdit] = useState<Prazo | null>(null)

  const handleCopyProcesso = (num: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(num)
    success('Número copiado!', num)
  }

  const handleDelete = (id: string, titulo: string) => {
    if (confirm(`Tem certeza que deseja excluir o prazo "${titulo}"?`)) {
      deletePrazo(id)
      success('Prazo removido')
    }
  }

  const filteredPrazos = useMemo(() => {
    return prazos.filter((p) => {
      // Filtro de texto
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          p.titulo.toLowerCase().includes(q) ||
          p.processoNumero.includes(q) ||
          p.cliente.toLowerCase().includes(q) ||
          p.tribunal.toLowerCase().includes(q)
        if (!match) return false
      }

      // Filtro de advogado
      if (selectedAdvogadoId !== 'todos' && p.advogadoId !== selectedAdvogadoId) {
        return false
      }

      // Filtro de área
      if (selectedArea !== 'todos' && p.area !== selectedArea) {
        return false
      }

      // Filtro de status / urgência
      const diff = getDaysDifference(p.dataFatal)
      const isCumprido = p.status === 'cumprido'

      if (filterTab === 'hoje') {
        return p.dataFatal === todayStr && !isCumprido
      }
      if (filterTab === 'urgentes') {
        return diff >= 0 && diff <= 3 && !isCumprido
      }
      if (filterTab === 'semana') {
        return diff >= 0 && diff <= 7 && !isCumprido
      }
      if (filterTab === 'andamento') {
        return !isCumprido
      }
      if (filterTab === 'cumpridos') {
        return isCumprido
      }

      return true
    })
  }, [prazos, filterTab, selectedAdvogadoId, selectedArea, searchQuery, todayStr])

  const prazosHojeCount = prazos.filter(
    (p) => p.dataFatal === todayStr && p.status !== 'cumprido'
  ).length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <IconScale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Prazos Processuais
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Controle de datas fatais judiciais, contagem e protocolo tempestivo
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setPrazoToEdit(null)
            setIsModalOpen(true)
          }}
          icon={<IconPlus className="w-4 h-4" />}
        >
          Novo Prazo
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle space-y-4 transition-colors">
        {/* Pills de visualização rápida */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold">
          <button
            onClick={() => setFilterTab('todos')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'todos'
                ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Todos ({prazos.length})
          </button>
          <button
            onClick={() => setFilterTab('hoje')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
              filterTab === 'hoje'
                ? 'bg-red-700 dark:bg-red-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Vencendo Hoje</span>
            {prazosHojeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 font-bold">
                {prazosHojeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilterTab('urgentes')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'urgentes'
                ? 'bg-amber-700 dark:bg-amber-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Urgentes (&le; 3 dias)
          </button>
          <button
            onClick={() => setFilterTab('semana')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'semana'
                ? 'bg-blue-700 dark:bg-blue-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Esta Semana
          </button>
          <button
            onClick={() => setFilterTab('andamento')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'andamento'
                ? 'bg-gray-800 dark:bg-slate-700 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilterTab('cumpridos')}
            className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap ${
              filterTab === 'cumpridos'
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            Protocolados
          </button>
        </div>

        {/* Secondary filters: Busca, Advogado e Área */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
          <div className="relative">
            <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filtrar por processo, título, cliente..."
              className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <select
              value={selectedAdvogadoId}
              onChange={(e) => setSelectedAdvogadoId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
            >
              <option value="todos">Todos os Advogados</option>
              {currentTenant.advogados.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
            >
              <option value="todos">Todas as Áreas do Direito</option>
              {currentTenant.areas.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Prazos */}
      <div className="space-y-4">
        {filteredPrazos.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-14 text-center rounded-2xl border border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 space-y-3.5">
            <IconScale className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto" />
            <p className="text-base font-bold text-gray-800 dark:text-slate-200">Nenhum prazo encontrado</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 max-w-md mx-auto">
              Nenhum prazo coincide com os filtros atuais ou não há prazos cadastrados nesta categoria.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setPrazoToEdit(null)
                setIsModalOpen(true)
              }}
              icon={<IconPlus className="w-4 h-4" />}
            >
              Adicionar Prazo
            </Button>
          </div>
        ) : (
          filteredPrazos.map((prazo) => {
            const isCumprido = prazo.status === 'cumprido'
            const urgency = getDeadlineUrgency(prazo.dataFatal, isCumprido)
            const badgeInfo = getUrgencyBadgeInfo(urgency)
            const adv = currentTenant.advogados.find((a) => a.id === prazo.advogadoId)

            return (
              <div
                key={prazo.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-subtle hover:border-gray-300 dark:hover:border-slate-700 ${
                  isCumprido
                    ? 'opacity-70 bg-gray-50/50 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800'
                    : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                {/* Lado Esquerdo: Checkbox + Detalhes */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    onClick={() => togglePrazoCumprido(prazo.id)}
                    className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isCumprido
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-gray-300 dark:border-slate-600 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-transparent'
                    }`}
                    title={isCumprido ? 'Desmarcar protocolo' : 'Marcar como cumprido/protocolado'}
                  >
                    <IconCheck className="w-4 h-4 text-white" />
                  </button>

                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Linha 1: Badges e Título */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                          isCumprido
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : `${badgeInfo.bg} ${badgeInfo.textCol} border ${badgeInfo.border}`
                        }`}
                      >
                        {isCumprido ? 'Protocolado' : badgeInfo.text}
                      </span>

                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-semibold border border-gray-200 dark:border-slate-700">
                        {prazo.area}
                      </span>

                      {prazo.preenchidoPorIA && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900 flex items-center gap-1">
                          ✨ IA
                        </span>
                      )}

                      <h3
                        className={`text-base sm:text-lg font-bold tracking-tight ${
                          isCumprido ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {prazo.titulo}
                      </h3>
                    </div>

                    {/* Anexos de Entrada e Saída */}
                    {(prazo.anexoIntimacao || prazo.anexoProtocolo) && (
                      <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                        {prazo.anexoIntimacao && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              baixarArquivoReal(prazo.anexoIntimacao!)
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 font-medium cursor-pointer hover:bg-red-100"
                            title="Clique para baixar a intimação"
                          >
                            <span>📄 Intimação: {prazo.anexoIntimacao.nome}</span>
                            <span className="text-[10px] opacity-75">({prazo.anexoIntimacao.tamanhoFormatado})</span>
                          </div>
                        )}

                        {prazo.anexoProtocolo && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation()
                              baixarArquivoReal(prazo.anexoProtocolo!)
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-medium cursor-pointer hover:bg-emerald-100"
                            title="Comprovante de protocolo anexado"
                          >
                            <span>✅ Protocolo: {prazo.anexoProtocolo.nome}</span>
                            <span className="text-[10px] opacity-75">({prazo.anexoProtocolo.tamanhoFormatado})</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Linha 2: Processo, Partes, Tribunal */}
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm text-gray-600 dark:text-slate-300 flex-wrap">
                      <button
                        onClick={(e) => handleCopyProcesso(prazo.processoNumero, e)}
                        className="font-mono text-xs sm:text-sm text-gray-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-2.5 py-0.5 rounded-md transition-colors"
                        title="Copiar número do processo"
                      >
                        <span>{prazo.processoNumero}</span>
                        <IconCopy className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      <span>•</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200">{prazo.tribunal}</span>
                      {prazo.vara && <span className="text-gray-500 dark:text-slate-400 truncate">({prazo.vara})</span>}
                    </div>

                    {/* Linha 3: Partes */}
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      <strong>Cliente:</strong> {prazo.cliente || 'Não informado'}
                      {prazo.parteContraria && (
                        <span> • <strong>Contrário:</strong> {prazo.parteContraria}</span>
                      )}
                    </p>

                    {/* Observações */}
                    {prazo.observacoes && (
                      <p className="text-sm text-gray-700 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/40 italic">
                        {prazo.observacoes}
                      </p>
                    )}

                    {/* Link para Tribunal */}
                    {prazo.linkTribunal && (
                      <div className="pt-1">
                        <a
                          href={prazo.linkTribunal}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                        >
                          <IconExternalLink className="w-3.5 h-3.5" />
                          <span>Acessar autos no tribunal ({prazo.tribunal})</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lado Direito: Data Fatal, Advogado Responsável e Ações */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-sm sm:text-base font-mono font-extrabold text-gray-900 dark:text-white">
                      {formatDateBr(prazo.dataFatal)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400 block font-mono mt-0.5">
                      até {prazo.horarioLimite} {prazo.diasUteis ? `(${prazo.diasUteis} dias úteis)` : ''}
                    </span>
                  </div>

                  {adv && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300 font-medium">
                      <div
                        className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                      >
                        {adv.nome[0]}
                      </div>
                      <span className="truncate max-w-[140px]">{adv.nome}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setPrazoToEdit(prazo)
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar prazo"
                    >
                      <IconEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prazo.id, prazo.titulo)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-red-950/60 rounded-lg transition-colors"
                      title="Excluir prazo"
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

      {/* Modal de Adicionar/Editar */}
      <PrazoFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setPrazoToEdit(null)
        }}
        prazoToEdit={prazoToEdit}
      />
    </div>
  )
}
