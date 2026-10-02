import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../common/Button'
import { Kbd } from '../common/Kbd'
import { useTheme } from '../../context/ThemeContext'
import {
  IconSearch,
  IconPlus,
  IconScale,
  IconVideo,
  IconCheckSquare,
  IconPrinter,
  IconSettings,
  IconChevronDown,
  IconSun,
  IconMoon,
  IconColumns,
} from '../common/Icons'

interface HeaderProps {
  onOpenSearch: () => void
  onOpenNewPrazo: () => void
  onOpenNewAudiencia: () => void
  onOpenNewTarefa: () => void
  onOpenSettings: () => void
  onOpenPrintDocket: () => void
  onToggleMobileSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNewPrazo,
  onOpenNewAudiencia,
  onOpenNewTarefa,
  onOpenSettings,
  onOpenPrintDocket,
  onToggleMobileSidebar,
}) => {
  const { theme, toggleTheme } = useTheme()
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20 no-print transition-colors">
      <div className="w-full px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Search bar */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-2 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl"
              title="Abrir Menu Lateral"
            >
              <IconColumns className="w-5 h-5" size={20} />
            </button>
          )}

          {/* Quick Search Command trigger (Compact, sleek and clean) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-between gap-3 w-56 sm:w-72 md:w-80 h-10 px-3 text-xs sm:text-sm text-gray-500 dark:text-slate-400 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700/80 rounded-xl transition-all shadow-subtle group"
            title="Pressione Ctrl+K para pesquisar"
          >
            <div className="flex items-center gap-2 min-w-0">
              <IconSearch className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-slate-300 shrink-0" size={16} />
              <span className="truncate">Buscar processo, prazo...</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Kbd className="text-[10px] px-1.5 py-0.5 opacity-70">Ctrl K</Kbd>
            </div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button (Light/Dark Mode) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-gray-600 dark:text-slate-300 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'dark' ? (
              <IconSun className="w-5 h-5 text-amber-400" size={20} />
            ) : (
              <IconMoon className="w-5 h-5 text-slate-700" size={20} />
            )}
          </button>

          {/* Print docket button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenPrintDocket}
            icon={<IconPrinter className="w-4 h-4 text-gray-600 dark:text-slate-300" size={16} />}
            className="hidden sm:inline-flex"
            title="Imprimir Pauta do Dia para audiências e prazos"
          >
            Pauta do Dia
          </Button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Configurações da Banca e Personalização"
          >
            <IconSettings className="w-5 h-5" size={20} />
          </button>

          {/* Primary Quick Add Menu */}
          <div className="relative" ref={addMenuRef}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              icon={<IconPlus className="w-4 h-4" size={16} />}
              iconRight={<IconChevronDown className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600" size={14} />}
            >
              Novo
            </Button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-gray-200 dark:border-slate-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false)
                    onOpenNewPrazo()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                >
                  <IconScale className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" size={16} />
                  <span className="font-bold">Novo Prazo</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false)
                    onOpenNewAudiencia()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                >
                  <IconVideo className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" size={16} />
                  <span className="font-bold">Nova Audiência</span>
                </button>
                <button
                  onClick={() => {
                    setIsAddMenuOpen(false)
                    onOpenNewTarefa()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors text-left"
                >
                  <IconCheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" size={16} />
                  <span className="font-bold">Nova Tarefa</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
