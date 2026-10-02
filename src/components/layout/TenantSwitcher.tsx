import React, { useState, useRef, useEffect } from 'react'
import { useTenant } from '../../context/TenantContext'
import { IconChevronDown, IconPlus, IconCheck, IconSettings } from '../common/Icons'

interface TenantSwitcherProps {
  onOpenNewOfficeModal: () => void
  onOpenSettingsModal: () => void
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  onOpenNewOfficeModal,
  onOpenSettingsModal,
}) => {
  const { tenants, currentTenant, setCurrentTenantId } = useTenant()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100/90 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700 text-left group"
        title="Alternar entre escritórios"
      >
        <div className="w-9 h-9 rounded-lg bg-[#0F172A] dark:bg-slate-100 text-white dark:text-slate-950 flex items-center justify-center font-bold text-sm tracking-wider shrink-0 shadow-subtle group-hover:scale-[1.02] transition-transform">
          {currentTenant.logoText || 'ADV'}
        </div>
        <div className="flex flex-col min-w-0 max-w-[210px]">
          <span className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
            {currentTenant.nome}
          </span>
          <span className="text-xs text-gray-500 dark:text-slate-400 font-mono leading-tight truncate mt-0.5">
            {currentTenant.oabPrincipal} • {currentTenant.cidade}/{currentTenant.estado}
          </span>
        </div>
        <IconChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 shrink-0 ml-1 transition-transform duration-150" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-elevated border border-gray-200 dark:border-slate-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-1.5 text-xs uppercase font-bold text-gray-400 dark:text-slate-500 tracking-wider">
            Escritórios Ativos ({tenants.length})
          </div>

          <div className="space-y-1 px-1.5 max-h-60 overflow-y-auto">
            {tenants.map((t) => {
              const isSelected = t.id === currentTenant.id
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setCurrentTenantId(t.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-gray-100 dark:bg-slate-800 font-semibold text-gray-900 dark:text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800/60 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-gray-200 dark:bg-slate-800 text-gray-800 dark:text-slate-200 flex items-center justify-center text-xs font-bold shrink-0">
                      {t.logoText || 'ADV'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate font-semibold">{t.nome}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">{t.oabPrincipal}</p>
                    </div>
                  </div>
                  {isSelected && <IconCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
                </button>
              )
            })}
          </div>

          <div className="my-2 border-t border-gray-100 dark:border-slate-800" />

          <div className="px-1.5 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false)
                onOpenNewOfficeModal()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors font-medium"
            >
              <IconPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Cadastrar Novo Escritório...</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                onOpenSettingsModal()
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors font-medium"
            >
              <IconSettings className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span>Configurações da Banca</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
