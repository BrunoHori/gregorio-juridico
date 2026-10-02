import React from 'react'
import clsx from 'clsx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0F172A] dark:focus-visible:ring-slate-300 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#0F172A] text-white hover:bg-[#1E293B] dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white border border-transparent shadow-sm',
    secondary:
      'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700/80 shadow-subtle',
    ghost:
      'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white border border-transparent',
    danger:
      'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-900/80 active:bg-red-200',
  }

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-sm px-3.5 py-1.5 rounded-lg gap-2',
    md: 'text-base px-4.5 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5 font-semibold',
  }

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  )
}
