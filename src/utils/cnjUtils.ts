// Formata número de processo padrão CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
export function formatCNJ(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 7) return digits
  if (digits.length <= 9) return `${digits.slice(0, 7)}-${digits.slice(7)}`
  if (digits.length <= 13) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9)}`
  if (digits.length <= 14) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13)}`
  if (digits.length <= 16) return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14)}`
  return `${digits.slice(0, 7)}-${digits.slice(7, 9)}.${digits.slice(9, 13)}.${digits.slice(13, 14)}.${digits.slice(14, 16)}.${digits.slice(16, 20)}`
}

export function cleanCNJ(value: string): string {
  return value.replace(/\D/g, '')
}

export function detectTribunalFromCNJ(value: string): string {
  const digits = cleanCNJ(value)
  if (digits.length < 16) return ''
  const ramo = digits.slice(13, 14)
  const tribunal = digits.slice(14, 16)

  if (ramo === '8') {
    // Estadual
    const tjMap: Record<string, string> = {
      '26': 'TJSP',
      '19': 'TJRJ',
      '13': 'TJMG',
      '21': 'TJRS',
      '16': 'TJPR',
      '24': 'TJSC',
      '07': 'TJDF',
      '05': 'TJBA',
      '06': 'TJCE',
      '17': 'TJPE',
    }
    return tjMap[tribunal] || `TJ-${tribunal}`
  } else if (ramo === '5') {
    // Trabalhista
    return `TRT-${parseInt(tribunal, 10)}`
  } else if (ramo === '4') {
    // Federal
    return `TRF-${parseInt(tribunal, 10)}`
  }
  return ''
}
