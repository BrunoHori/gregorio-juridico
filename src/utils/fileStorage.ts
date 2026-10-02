import { Anexo } from '../types'

// Armazenamento em memória de arquivos reais enviados pelo usuário
const blobRegistry = new Map<string, { blob: Blob | File; filename: string }>()

/**
 * Registra um arquivo real (File/Blob) vinculado ao ID do Anexo
 */
export function registrarArquivoReal(anexoId: string, file: File | Blob, filename: string): string {
  blobRegistry.set(anexoId, { blob: file, filename })
  try {
    return URL.createObjectURL(file)
  } catch {
    return ''
  }
}

/**
 * Executa o download real do arquivo no navegador do usuário
 */
export function baixarArquivoReal(anexo: Anexo) {
  let url = anexo.url
  const registryEntry = blobRegistry.get(anexo.id)

  if (registryEntry) {
    url = URL.createObjectURL(registryEntry.blob)
  } else if (!url) {
    // Caso seja um anexo de teste ou demonstração pré-existente
    const conteudoDemo = `Gregório Jurídico — Gestão Forense\n` +
      `Arquivo: ${anexo.nome}\n` +
      `Categoria: ${anexo.categoria.toUpperCase()}\n` +
      `Tamanho: ${anexo.tamanhoFormatado}\n` +
      `Data de Registro: ${anexo.dataUpload}\n\n` +
      `Documento processual anexado na plataforma.`
    const blob = new Blob([conteudoDemo], { type: 'application/octet-stream' })
    url = URL.createObjectURL(blob)
  }

  // Cria elemento invisível de download
  const link = document.createElement('a')
  link.href = url
  link.download = anexo.nome
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
