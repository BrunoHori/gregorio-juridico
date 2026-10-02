export function getTodayString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateBr(dateString: string): string {
  if (!dateString) return ''
  const parts = dateString.split('T')[0].split('-')
  if (parts.length !== 3) return dateString
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

export function formatDateExtenso(dateString: string): string {
  if (!dateString) return ''
  const parts = dateString.split('T')[0].split('-')
  if (parts.length !== 3) return dateString
  const [year, month, day] = parts
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]
  const mesIndex = parseInt(month, 10) - 1
  return `${parseInt(day, 10)} de ${meses[mesIndex]} de ${year}`
}

export function getDaysDifference(targetDateString: string): number {
  if (!targetDateString) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const parts = targetDateString.split('T')[0].split('-')
  if (parts.length !== 3) return 0
  const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  return Math.round(diffTime / (1000 * 60 * 60 * 24))
}

export type UrgencyLevel = 'vencido' | 'hoje' | 'amanha' | 'critico' | 'atencao' | 'tranquilo'

export function getDeadlineUrgency(targetDateString: string, isCompleted: boolean = false): UrgencyLevel {
  if (isCompleted) return 'tranquilo'
  const diffDays = getDaysDifference(targetDateString)
  if (diffDays < 0) return 'vencido'
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'amanha'
  if (diffDays <= 3) return 'critico'
  if (diffDays <= 7) return 'atencao'
  return 'tranquilo'
}

export function getUrgencyBadgeInfo(urgency: UrgencyLevel): { text: string; bg: string; textCol: string; border: string } {
  switch (urgency) {
    case 'vencido':
      return { text: 'Vencido', bg: 'bg-red-50', textCol: 'text-red-700', border: 'border-red-200' }
    case 'hoje':
      return { text: 'Vence Hoje', bg: 'bg-red-100', textCol: 'text-red-800 font-semibold', border: 'border-red-300' }
    case 'amanha':
      return { text: 'Amanhã', bg: 'bg-amber-50', textCol: 'text-amber-800 font-medium', border: 'border-amber-200' }
    case 'critico':
      return { text: 'Urgente (< 3d)', bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-200' }
    case 'atencao':
      return { text: 'Esta semana', bg: 'bg-blue-50', textCol: 'text-blue-700', border: 'border-blue-200' }
    default:
      return { text: 'No prazo', bg: 'bg-gray-100', textCol: 'text-gray-700', border: 'border-gray-200' }
  }
}
