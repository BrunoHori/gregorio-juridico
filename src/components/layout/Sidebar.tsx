import React from 'react'
import { ViewTab } from '../../types'
import { useTenant } from '../../context/TenantContext'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { getTodayString } from '../../utils/dateUtils'
import {
  IconCalendar,
  IconScale,
  IconVideo,
  IconCheckSquare,
  IconPrinter,
  IconSun,
  IconMoon,
  IconSettings,
} from '../common/Icons'
import { Kbd } from '../common/Kbd'
import clsx from 'clsx'

interface SidebarProps {
  currentTab: ViewTab
  onSelectTab: (tab: ViewTab) => void
  onOpenNewOffice: () => void
  onOpenSettings: () => void
  onOpenPerfil: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewOffice,
  onOpenSettings,
  onOpenPerfil,
}) => {
  const { currentTenant, prazos, audiencias, tarefas } = useTenant()
  const { theme, setTheme } = useTheme()
  const { activeAdvogado, logout } = useAuth()
  const todayStr = getTodayString()

  // Counters
  const prazosHojeCount = prazos.filter(
    (p) => p.dataFatal === todayStr && p.status !== 'cumprido'
  ).length

  const audienciasHojeCount = audiencias.filter(
    (a) => a.data === todayStr && a.status !== 'realizada'
  ).length

  const tarefasPendentesCount = tarefas.filter((t) => t.status !== 'concluido').length

  const navItems: {
    id: ViewTab
    label: string
    icon: React.ReactNode
    count?: number
    urgent?: boolean
    hotkey?: string
  }[] = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: <IconCalendar className="w-5 h-5" size={20} />,
      hotkey: '1',
    },
    {
      id: 'prazos',
      label: 'Prazos Processuais',
      icon: <IconScale className="w-5 h-5" size={20} />,
      count: prazosHojeCount > 0 ? prazosHojeCount : prazos.filter((p) => p.status !== 'cumprido').length,
      urgent: prazosHojeCount > 0,
      hotkey: '2',
    },
    {
      id: 'audiencias',
      label: 'Pauta de Audiências',
      icon: <IconVideo className="w-5 h-5" size={20} />,
      count: audienciasHojeCount > 0 ? audienciasHojeCount : audiencias.length,
      urgent: audienciasHojeCount > 0,
      hotkey: '3',
    },
    {
      id: 'tarefas',
      label: 'Quadro de Tarefas',
      icon: <IconCheckSquare className="w-5 h-5" size={20} />,
      count: tarefasPendentesCount,
      hotkey: '4',
    },
    {
      id: 'pauta_impressao',
      label: 'Pauta para Impressão',
      icon: <IconPrinter className="w-5 h-5" size={20} />,
    },
  ]

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col justify-between shrink-0 no-print transition-colors select-none">
      {/* Top: Office Branding & Active Lawyer Session (No direct switcher, formal login) */}
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 space-y-3">
        {/* Office Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] dark:bg-slate-100 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-subtle">
            {currentTenant.logoText || 'ADV'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-extrabold text-gray-900 dark:text-white truncate leading-tight">
              {currentTenant.nome}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate mt-0.5">
              {currentTenant.oabPrincipal} • {currentTenant.cidade}/{currentTenant.estado}
            </p>
          </div>
        </div>

        {/* Active Logged-in Lawyer Card */}
        <div className="p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: activeAdvogado?.avatarColor || '#1E3A8A' }}
            >
              {activeAdvogado?.nome ? activeAdvogado.nome[0] : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {activeAdvogado?.nome || 'Advogado Conectado'}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                {activeAdvogado?.cargo || 'Advogado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onOpenPerfil}
              className="px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
              title="Editar Meu Perfil"
            >
              Perfil
            </button>
            <button
              onClick={logout}
              className="px-2 py-1 text-[11px] font-semibold text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
              title="Sair / Trocar de Conta"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Center: Navigation Menu */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        <div>
          <p className="px-3 pb-2 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
            Menu Forense
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-gray-100 text-gray-950 dark:bg-slate-800 dark:text-white shadow-2xs'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/60'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        isActive
                          ? 'text-gray-950 dark:text-white'
                          : 'text-gray-400 dark:text-slate-500'
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {typeof item.count === 'number' && (
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded-full text-xs font-mono font-bold leading-none',
                          item.urgent
                            ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 animate-pulse'
                            : isActive
                            ? 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                        )}
                      >
                        {item.count}
                      </span>
                    )}

                    {item.hotkey && (
                      <Kbd className="opacity-40">{item.hotkey}</Kbd>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Team Section in Sidebar */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-3 pb-2">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              Corpo Jurídico ({currentTenant.advogados.length})
            </span>
          </div>

          <div className="space-y-1.5 px-1">
            {currentTenant.advogados.map((adv) => {
              const isMe = adv.id === activeAdvogado?.id
              return (
                <div
                  key={adv.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    isMe
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 font-semibold'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] shrink-0"
                      style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                    >
                      {adv.nome[0]}
                    </div>
                    <p className="truncate text-xs">{adv.nome}</p>
                  </div>
                  {isMe && (
                    <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 shrink-0">
                      (Você)
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom: Explicit Theme Toggle & Settings */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
        {/* Clear, explicit Segmented Theme Control */}
        <div>
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Tema Visual
          </p>
          <div className="grid grid-cols-2 gap-1.5 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setTheme('light')}
              className={clsx(
                'flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all',
                theme === 'light'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <IconSun className="w-4 h-4 text-amber-500" size={16} />
              <span>Claro</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={clsx(
                'flex items-center justify-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all',
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <IconMoon className="w-4 h-4 text-blue-400" size={16} />
              <span>Escuro</span>
            </button>
          </div>
        </div>

        {/* Settings & Onboarding buttons */}
        <div className="space-y-1">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <IconSettings className="w-4 h-4 text-gray-500" size={16} />
            <span>Configurações da Banca</span>
          </button>

          <button
            onClick={onOpenNewOffice}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors text-left"
          >
            <span>+ Cadastrar Novo Escritório</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
