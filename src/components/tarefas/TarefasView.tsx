import React, { useState, useMemo } from 'react'
import { useTenant } from '../../context/TenantContext'
import { Tarefa, StatusTarefa, PrioridadeTarefa } from '../../types'
import { formatDateBr } from '../../utils/dateUtils'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'
import {
  IconPlus,
  IconCheckSquare,
  IconColumns,
  IconList,
  IconCheck,
  IconEdit,
  IconTrash,
  IconSearch,
} from '../common/Icons'
import { useToast } from '../common/Toast'
import { TarefaFormModal } from './TarefaFormModal'
import { baixarArquivoReal } from '../../utils/fileStorage'

const COLUMNS: { id: StatusTarefa; title: string; color: string }[] = [
  { id: 'a_fazer', title: 'A Fazer', color: 'border-t-gray-400 dark:border-t-slate-500' },
  { id: 'em_andamento', title: 'Em Andamento', color: 'border-t-blue-500 dark:border-t-blue-400' },
  { id: 'revisao', title: 'Em Revisão', color: 'border-t-amber-500 dark:border-t-amber-400' },
  { id: 'concluido', title: 'Concluído', color: 'border-t-emerald-500 dark:border-t-emerald-400' },
]

export const TarefasView: React.FC = () => {
  const { currentTenant, tarefas, moveTarefaStatus, toggleTarefaConcluida, deleteTarefa } =
    useTenant()
  const { success } = useToast()

  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban')
  const [selectedAdvogadoId, setSelectedAdvogadoId] = useState<string>('todos')
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('todos')
  const [searchQuery, setSearchQuery] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tarefaToEdit, setTarefaToEdit] = useState<Tarefa | null>(null)
  const [initialColumnStatus, setInitialColumnStatus] = useState<StatusTarefa>('a_fazer')

  const handleDelete = (id: string, titulo: string) => {
    if (confirm(`Excluir a tarefa "${titulo}"?`)) {
      deleteTarefa(id)
      success('Tarefa excluída')
    }
  }

  const filteredTarefas = useMemo(() => {
    return tarefas.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          t.titulo.toLowerCase().includes(q) ||
          (t.cliente && t.cliente.toLowerCase().includes(q)) ||
          (t.processoNumero && t.processoNumero.includes(q))
        if (!match) return false
      }
      if (selectedAdvogadoId !== 'todos' && t.advogadoId !== selectedAdvogadoId) {
        return false
      }
      if (selectedPrioridade !== 'todos' && t.prioridade !== selectedPrioridade) {
        return false
      }
      return true
    })
  }, [tarefas, searchQuery, selectedAdvogadoId, selectedPrioridade])

  const getPriorityBadge = (p: PrioridadeTarefa) => {
    switch (p) {
      case 'urgente':
        return <Badge variant="urgent">Urgente (P1)</Badge>
      case 'alta':
        return <Badge variant="warning">Alta (P2)</Badge>
      case 'media':
        return <Badge variant="info">Média (P3)</Badge>
      case 'baixa':
        return <Badge variant="default">Baixa (P4)</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle transition-colors">
        <div>
          <div className="flex items-center gap-2.5">
            <IconCheckSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Quadro de Tarefas
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Fluxo operacional do escritório: distribuição por advogado e kanban de produtividade
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Alternador Kanban / Lista */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-gray-950 dark:text-white shadow-2xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Visão Kanban"
            >
              <IconColumns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${
                viewMode === 'lista'
                  ? 'bg-white dark:bg-slate-900 text-gray-950 dark:text-white shadow-2xs'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Visão Lista Checklist"
            >
              <IconList className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTarefaToEdit(null)
              setInitialColumnStatus('a_fazer')
              setIsModalOpen(true)
            }}
            icon={<IconPlus className="w-4 h-4" />}
          >
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row items-center gap-3.5 transition-colors">
        <div className="relative flex-1 w-full">
          <IconSearch className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar nas tarefas..."
            className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2.5">
          <select
            value={selectedAdvogadoId}
            onChange={(e) => setSelectedAdvogadoId(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
          >
            <option value="todos">Todos os Responsáveis</option>
            {currentTenant.advogados.map((adv) => (
              <option key={adv.id} value={adv.id}>
                {adv.nome}
              </option>
            ))}
          </select>

          <select
            value={selectedPrioridade}
            onChange={(e) => setSelectedPrioridade(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200"
          >
            <option value="todos">Todas Prioridades</option>
            <option value="urgente">Urgente (P1)</option>
            <option value="alta">Alta (P2)</option>
            <option value="media">Média (P3)</option>
            <option value="baixa">Baixa (P4)</option>
          </select>
        </div>
      </div>

      {/* Visão Kanban */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {COLUMNS.map((col) => {
            const colTarefas = filteredTarefas.filter((t) => t.status === col.id)

            return (
              <div
                key={col.id}
                className={`bg-gray-50/70 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 border-t-4 ${col.color} flex flex-col min-h-[520px] transition-colors`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-gray-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {col.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      {colTarefas.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setTarefaToEdit(null)
                      setInitialColumnStatus(col.id)
                      setIsModalOpen(true)
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title={`Adicionar tarefa em ${col.title}`}
                  >
                    <IconPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTarefas.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-400 dark:text-slate-500 border border-dashed border-gray-200 dark:border-slate-800 rounded-xl">
                      Nenhuma tarefa
                    </div>
                  ) : (
                    colTarefas.map((tarefa) => {
                      const adv = currentTenant.advogados.find(
                        (a) => a.id === tarefa.advogadoId
                      )

                      return (
                        <div
                          key={tarefa.id}
                          className="bg-white dark:bg-slate-850 p-4 rounded-xl border border-gray-200 dark:border-slate-750 shadow-2xs hover:border-gray-300 dark:hover:border-slate-650 hover:shadow-subtle transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-xs">{getPriorityBadge(tarefa.prioridade)}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setTarefaToEdit(tarefa)
                                  setIsModalOpen(true)
                                }}
                                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded"
                                title="Editar"
                              >
                                <IconEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(tarefa.id, tarefa.titulo)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded"
                                title="Excluir"
                              >
                                <IconTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                            {tarefa.titulo}
                          </h4>

                          {tarefa.descricao && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {tarefa.descricao}
                            </p>
                          )}

                          {tarefa.processoNumero && (
                            <p className="text-xs font-mono text-gray-600 dark:text-slate-400 truncate bg-gray-50 dark:bg-slate-900 p-1.5 rounded-md border border-gray-100 dark:border-slate-800">
                              Proc: {tarefa.processoNumero}
                            </p>
                          )}

                          {/* Subtarefas / Checklist IA */}
                          {tarefa.subtarefas && tarefa.subtarefas.length > 0 && (
                            <div className="space-y-1 pt-1">
                              <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400">
                                <span className="font-semibold flex items-center gap-1">
                                  <span>Checklist:</span>
                                  {tarefa.sugeridoPorIA && <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">✨ IA</span>}
                                </span>
                                <span className="font-mono">
                                  {tarefa.subtarefas.filter((s) => s.concluida).length}/{tarefa.subtarefas.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-blue-600 h-full rounded-full transition-all"
                                  style={{
                                    width: `${
                                      (tarefa.subtarefas.filter((s) => s.concluida).length /
                                        tarefa.subtarefas.length) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Anexos de Minutas/Peças */}
                          {tarefa.anexos && tarefa.anexos.length > 0 && (
                            <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                              {tarefa.anexos.map((anx) => (
                                <span
                                  key={anx.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    baixarArquivoReal(anx)
                                  }}
                                  className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium cursor-pointer hover:bg-blue-100 truncate max-w-full"
                                  title="Clique para baixar a minuta"
                                >
                                  📄 {anx.nome}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer do Card */}
                          <div className="pt-2.5 border-t border-gray-100 dark:border-slate-750 flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                            {adv ? (
                              <div className="flex items-center gap-1.5" title={adv.nome}>
                                <div
                                  className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold"
                                  style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                                >
                                  {adv.nome[0]}
                                </div>
                                <span className="truncate max-w-[90px] font-medium">
                                  {adv.nome.split(' ')[0]}
                                </span>
                              </div>
                            ) : <div />}

                            {tarefa.dataLimite && (
                              <span className="font-mono text-xs font-semibold">
                                Até {formatDateBr(tarefa.dataLimite)}
                              </span>
                            )}
                          </div>

                          {/* Botões de fluxo rápido entre colunas */}
                          <div className="pt-2 flex items-center justify-between border-t border-gray-50 dark:border-slate-750 text-xs">
                            {col.id !== 'a_fazer' ? (
                              <button
                                onClick={() => {
                                  const prevMap: Record<StatusTarefa, StatusTarefa> = {
                                    a_fazer: 'a_fazer',
                                    em_andamento: 'a_fazer',
                                    revisao: 'em_andamento',
                                    concluido: 'revisao',
                                  }
                                  moveTarefaStatus(tarefa.id, prevMap[col.id])
                                }}
                                className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-300 font-semibold"
                              >
                                &larr; Voltar
                              </button>
                            ) : <div />}

                            {col.id !== 'concluido' ? (
                              <button
                                onClick={() => {
                                  const nextMap: Record<StatusTarefa, StatusTarefa> = {
                                    a_fazer: 'em_andamento',
                                    em_andamento: 'revisao',
                                    revisao: 'concluido',
                                    concluido: 'concluido',
                                  }
                                  moveTarefaStatus(tarefa.id, nextMap[col.id])
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold"
                              >
                                Avançar &rarr;
                              </button>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <IconCheck className="w-3.5 h-3.5" /> Feito
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Visão Lista Checklist */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle divide-y divide-gray-100 dark:divide-slate-800 overflow-hidden transition-colors">
          {filteredTarefas.length === 0 ? (
            <div className="p-14 text-center text-sm text-gray-500 dark:text-slate-400">
              Nenhuma tarefa encontrada com estes filtros.
            </div>
          ) : (
            filteredTarefas.map((tarefa) => {
              const isDone = tarefa.status === 'concluido'
              const adv = currentTenant.advogados.find((a) => a.id === tarefa.advogadoId)

              return (
                <div
                  key={tarefa.id}
                  className={`p-5 flex items-center justify-between gap-4 hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors ${
                    isDone ? 'opacity-60 bg-gray-50/40 dark:bg-slate-900/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTarefaConcluida(tarefa.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-gray-300 dark:border-slate-600 hover:border-emerald-600 text-transparent'
                      }`}
                    >
                      <IconCheck className="w-4 h-4 text-white" />
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {getPriorityBadge(tarefa.prioridade)}
                        <span
                          className={`text-sm sm:text-base font-bold ${
                            isDone ? 'line-through text-gray-400 dark:text-slate-500' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {tarefa.titulo}
                        </span>
                      </div>

                      {tarefa.descricao && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 line-clamp-1">
                          {tarefa.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs sm:text-sm">
                    {adv && (
                      <span className="text-gray-600 dark:text-slate-400 font-semibold hidden sm:inline">
                        {adv.nome}
                      </span>
                    )}

                    <span className="font-mono text-gray-500 dark:text-slate-400 font-medium">
                      {tarefa.dataLimite ? formatDateBr(tarefa.dataLimite) : 'Sem data'}
                    </span>

                    <span className="capitalize font-semibold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                      {tarefa.status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setTarefaToEdit(tarefa)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 rounded-lg"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tarefa.id, tarefa.titulo)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
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
      )}

      {/* Modal */}
      <TarefaFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTarefaToEdit(null)
        }}
        tarefaToEdit={tarefaToEdit}
        initialStatus={initialColumnStatus}
      />
    </div>
  )
}
