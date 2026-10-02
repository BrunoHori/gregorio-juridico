import React from 'react'
import { ViewTab } from '../../types'
import { useTenant } from '../../context/TenantContext'
import { getTodayString } from '../../utils/dateUtils'
import { IconCalendar, IconScale, IconVideo, IconCheckSquare, IconPrinter } from '../common/Icons'
import { Kbd } from '../common/Kbd'
import clsx from 'clsx'

interface NavigationTabsProps {
  currentTab: ViewTab
  onSelectTab: (tab: ViewTab) => void
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const { prazos, audiencias, tarefas } = useTenant()
  const todayStr = getTodayString()

  // Contadores inteligentes
  const prazosHojeCount = prazos.filter(
    (p) => p.dataFatal === todayStr && p.status !== 'cumprido'
  ).length

  const audienciasHojeCount = audiencias.filter(
    (a) => a.data === todayStr && a.status !== 'realizada'
  ).length

  const tarefasPendentesCount = tarefas.filter((t) => t.status !== 'concluido').length

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; count?: number; urgent?: boolean; keyShortcut?: string }[] = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: <IconCalendar className="w-4.5 h-4.5" />,
      keyShortcut: '1',
    },
    {
      id: 'prazos',
      label: 'Prazos Processuais',
      icon: <IconScale className="w-4.5 h-4.5" />,
      count: prazosHojeCount > 0 ? prazosHojeCount : prazos.filter((p) => p.status !== 'cumprido').length,
      urgent: prazosHojeCount > 0,
      keyShortcut: '2',
    },
    {
      id: 'audiencias',
      label: 'Pauta de Audiências',
      icon: <IconVideo className="w-4.5 h-4.5" />,
      count: audienciasHojeCount > 0 ? audienciasHojeCount : audiencias.length,
      urgent: audienciasHojeCount > 0,
      keyShortcut: '3',
    },
    {
      id: 'tarefas',
      label: 'Quadro de Tarefas',
      icon: <IconCheckSquare className="w-4.5 h-4.5" />,
      count: tarefasPendentesCount,
      keyShortcut: '4',
    },
    {
      id: 'pauta_impressao',
      label: 'Pauta para Impressão / PDF',
      icon: <IconPrinter className="w-4.5 h-4.5" />,
    },
  ]

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 no-print transition-colors" aria-label="Navegação Principal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm sm:text-base font-semibold whitespace-nowrap transition-all duration-150 relative active:scale-[0.98]',
                  isActive
                    ? 'bg-gray-100 text-gray-950 dark:bg-slate-800 dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
                )}
              >
                <span className={clsx(isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500')}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>

                {typeof tab.count === 'number' && (
                  <span
                    className={clsx(
                      'ml-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold leading-none',
                      tab.urgent
                        ? 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 animate-pulse'
                        : isActive
                        ? 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                    )}
                  >
                    {tab.count}
                  </span>
                )}

                {tab.keyShortcut && (
                  <Kbd className="hidden lg:inline-flex opacity-60 ml-1">{tab.keyShortcut}</Kbd>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
