import React, { useState, useEffect, useMemo } from 'react'
import { useTenant } from '../../context/TenantContext'
import { IconSearch, IconVideo, IconCheckSquare, IconScale, IconX } from './Icons'
import { Kbd } from './Kbd'
import { formatDateBr } from '../../utils/dateUtils'
import { ViewTab } from '../../types'

interface SearchCommandDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectTab: (tab: ViewTab) => void
  onOpenNewPrazo: () => void
  onOpenNewAudiencia: () => void
  onOpenNewTarefa: () => void
}

export const SearchCommandDialog: React.FC<SearchCommandDialogProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenNewPrazo,
  onOpenNewAudiencia,
  onOpenNewTarefa,
}) => {
  const { currentTenant, prazos, audiencias, tarefas } = useTenant()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  // ESC handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const filteredPrazos = useMemo(() => {
    if (!query.trim()) return prazos.slice(0, 3)
    const q = query.toLowerCase()
    return prazos.filter(
      (p) =>
        p.titulo.toLowerCase().includes(q) ||
        p.processoNumero.includes(q) ||
        p.cliente.toLowerCase().includes(q) ||
        p.tribunal.toLowerCase().includes(q)
    )
  }, [prazos, query])

  const filteredAudiencias = useMemo(() => {
    if (!query.trim()) return audiencias.slice(0, 3)
    const q = query.toLowerCase()
    return audiencias.filter(
      (a) =>
        a.tipo.toLowerCase().includes(q) ||
        a.cliente.toLowerCase().includes(q) ||
        a.processoNumero.includes(q)
    )
  }, [audiencias, query])

  const filteredTarefas = useMemo(() => {
    if (!query.trim()) return tarefas.slice(0, 3)
    const q = query.toLowerCase()
    return tarefas.filter(
      (t) =>
        t.titulo.toLowerCase().includes(q) ||
        (t.cliente && t.cliente.toLowerCase().includes(q))
    )
  }, [tarefas, query])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/55 backdrop-blur-xs" onClick={onClose} />
      <div className="min-h-full flex items-start justify-center pt-20 p-4">
        <div
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-gray-200 dark:border-slate-800 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Bar */}
          <div className="flex items-center px-5 py-4 border-b border-gray-100 dark:border-slate-800 gap-3.5">
            <IconSearch className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar processo, cliente, prazo, audiência ou tarefa..."
              className="w-full text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 bg-transparent focus:outline-none"
            />
            {query ? (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                <IconX className="w-5 h-5" />
              </button>
            ) : (
              <Kbd>ESC</Kbd>
            )}
          </div>

          <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5 text-sm">
            {/* Quick Actions */}
            <div>
              <p className="px-2 pb-2 font-bold text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                Ações Rápidas
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    onClose()
                    onOpenNewPrazo()
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 text-left transition-colors"
                >
                  <IconScale className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="font-semibold text-gray-800 dark:text-slate-200">+ Novo Prazo</span>
                </button>
                <button
                  onClick={() => {
                    onClose()
                    onOpenNewAudiencia()
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 text-left transition-colors"
                >
                  <IconVideo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-800 dark:text-slate-200">+ Audiência</span>
                </button>
                <button
                  onClick={() => {
                    onClose()
                    onOpenNewTarefa()
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 text-left transition-colors"
                >
                  <IconCheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-gray-800 dark:text-slate-200">+ Nova Tarefa</span>
                </button>
              </div>
            </div>

            {/* Prazos Results */}
            {filteredPrazos.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="font-bold text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Prazos Processuais
                  </span>
                  <button
                    onClick={() => {
                      onClose()
                      onSelectTab('prazos')
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver todos ({prazos.length})
                  </button>
                </div>
                <div className="space-y-1.5">
                  {filteredPrazos.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose()
                        onSelectTab('prazos')
                      }}
                      className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{p.titulo}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                          {p.processoNumero} • {p.cliente} ({p.tribunal})
                        </p>
                      </div>
                      <span className="font-mono text-gray-700 dark:text-slate-300 font-bold text-sm">
                        {formatDateBr(p.dataFatal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audiências Results */}
            {filteredAudiencias.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="font-bold text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Audiências
                  </span>
                  <button
                    onClick={() => {
                      onClose()
                      onSelectTab('audiencias')
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver pauta ({audiencias.length})
                  </button>
                </div>
                <div className="space-y-1.5">
                  {filteredAudiencias.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        onClose()
                        onSelectTab('audiencias')
                      }}
                      className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{a.tipo}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          {a.cliente} • {a.modalidade === 'telepresencial' ? 'Virtual' : 'Presencial'}
                        </p>
                      </div>
                      <span className="font-mono text-gray-700 dark:text-slate-300 font-bold text-sm">
                        {formatDateBr(a.data)} às {a.horario}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarefas Results */}
            {filteredTarefas.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 pb-2">
                  <span className="font-bold text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Tarefas Operacionais
                  </span>
                  <button
                    onClick={() => {
                      onClose()
                      onSelectTab('tarefas')
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Ver quadro ({tarefas.length})
                  </button>
                </div>
                <div className="space-y-1.5">
                  {filteredTarefas.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        onClose()
                        onSelectTab('tarefas')
                      }}
                      className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <p className="font-bold text-gray-800 dark:text-slate-200 truncate mr-3 text-sm">{t.titulo}</p>
                      <span className="capitalize text-gray-500 dark:text-slate-400 text-xs shrink-0 font-semibold">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-3 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 font-medium">
            <span>Escritório ativo: <strong>{currentTenant.nome}</strong></span>
            <span>Atalho global: <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></span>
          </div>
        </div>
      </div>
    </div>
  )
}
