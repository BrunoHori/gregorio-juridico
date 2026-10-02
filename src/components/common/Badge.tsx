import React from 'react'
import clsx from 'clsx'

export type BadgeVariant =
  | 'default'
  | 'urgent'
  | 'warning'
  | 'success'
  | 'info'
  | 'outline'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
  dot = false,
}) => {
  const styles: Record<BadgeVariant, { bg: string; text: string; border: string; dotCol: string }> = {
    default: {
      bg: 'bg-gray-100 dark:bg-slate-800',
      text: 'text-gray-700 dark:text-slate-300',
      border: 'border-gray-200 dark:border-slate-700',
      dotCol: 'bg-gray-400 dark:bg-slate-400',
    },
    urgent: {
      bg: 'bg-red-50 dark:bg-red-950/70',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800/80',
      dotCol: 'bg-red-600 dark:bg-red-400',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/70',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/80',
      dotCol: 'bg-amber-600 dark:bg-amber-400',
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/70',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/80',
      dotCol: 'bg-emerald-600 dark:bg-emerald-400',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/70',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800/80',
      dotCol: 'bg-blue-600 dark:bg-blue-400',
    },
    outline: {
      bg: 'bg-transparent',
      text: 'text-gray-700 dark:text-slate-300',
      border: 'border-gray-300 dark:border-slate-700',
      dotCol: 'bg-gray-400 dark:bg-slate-400',
    },
  }

  const s = styles[variant]

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border leading-tight tracking-tight whitespace-nowrap transition-colors',
        s.bg,
        s.text,
        s.border,
        className
      )}
    >
      {dot && <span className={clsx('w-2 h-2 rounded-full shrink-0', s.dotCol)} />}
      {children}
    </span>
  )
}
