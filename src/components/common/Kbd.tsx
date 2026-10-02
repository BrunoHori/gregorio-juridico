import React from 'react'
import clsx from 'clsx'

interface KbdProps {
  children: React.ReactNode
  className?: string
}

export const Kbd: React.FC<KbdProps> = ({ children, className }) => {
  return (
    <kbd
      className={clsx(
        'inline-flex items-center justify-center font-mono text-xs uppercase font-semibold text-gray-600 bg-gray-100 border border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 rounded px-2 py-0.5 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] leading-none select-none',
        className
      )}
    >
      {children}
    </kbd>
  )
}
