import React, { useEffect } from 'react'
import { IconX } from './Icons'
import clsx from 'clsx'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          className={clsx(
            'relative w-full bg-white dark:bg-slate-900 rounded-2xl shadow-elevated border border-gray-200 dark:border-slate-800 overflow-hidden text-left transform transition-all animate-in fade-in zoom-in-95 duration-150',
            widthClasses[maxWidth]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors -mr-1"
              aria-label="Fechar"
            >
              <IconX className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto text-sm text-gray-800 dark:text-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
