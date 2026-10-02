import React, { createContext, useContext, useState, useCallback } from 'react'
import { IconCheck, IconAlertCircle, IconX } from './Icons'

export type ToastType = 'success' | 'info' | 'error'

interface ToastItem {
  id: string
  message: string
  type: ToastType
  description?: string
}

interface ToastContextType {
  toast: (message: string, description?: string, type?: ToastType) => void
  success: (message: string, description?: string) => void
  error: (message: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, description?: string, type: ToastType = 'info') => {
      const id = `toast-${Date.now()}-${Math.random()}`
      setToasts((prev) => [...prev, { id, message, description, type }])
      setTimeout(() => {
        removeToast(id)
      }, 3500)
    },
    [removeToast]
  )

  const success = useCallback(
    (message: string, description?: string) => toast(message, description, 'success'),
    [toast]
  )

  const error = useCallback(
    (message: string, description?: string) => toast(message, description, 'error'),
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      {/* Toast container floating at bottom-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-[#0F172A] text-white rounded-lg shadow-elevated border border-gray-800 transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <span className="mt-0.5 shrink-0">
              {t.type === 'success' && <IconCheck className="w-4 h-4 text-emerald-400" />}
              {t.type === 'error' && <IconAlertCircle className="w-4 h-4 text-rose-400" />}
              {t.type === 'info' && <span className="w-2 h-2 rounded-full bg-blue-400 block mt-1" />}
            </span>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-white leading-snug">{t.message}</p>
              {t.description && <p className="text-gray-300 mt-0.5 leading-relaxed">{t.description}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
