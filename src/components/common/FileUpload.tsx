import React, { useRef, useState } from 'react'
import { Anexo, TipoAnexo, CategoriaAnexo } from '../../types'
import { IconDownload, IconTrash } from './Icons'
import { registrarArquivoReal, baixarArquivoReal } from '../../utils/fileStorage'

interface FileUploadProps {
  files: Anexo[]
  onFilesChange: (files: Anexo[]) => void
  categoria?: CategoriaAnexo
  maxFiles?: number
  label?: string
  helperText?: string
  accept?: string
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function getTipoFromNome(nome: string): TipoAnexo {
  const ext = nome.split('.').pop()?.toLowerCase() || ''
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  if (['png', 'jpg', 'jpeg'].includes(ext)) return 'imagem'
  return 'outro'
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  categoria = 'geral',
  maxFiles = 5,
  label,
  helperText = 'Formatos aceitos: PDF ou DOCX (até 25 MB)',
  accept = '.pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    const newAnexos: Anexo[] = []
    const agora = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    for (let i = 0; i < fileList.length; i++) {
      if (files.length + newAnexos.length >= maxFiles) break
      const f = fileList[i]
      const anexoId = `anx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const url = registrarArquivoReal(anexoId, f, f.name)

      newAnexos.push({
        id: anexoId,
        nome: f.name,
        tamanho: f.size,
        tamanhoFormatado: formatBytes(f.size),
        tipo: getTipoFromNome(f.name),
        categoria,
        dataUpload: agora,
        url,
      })
    }

    onFilesChange([...files, ...newAnexos])
  }

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onFilesChange(files.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-2.5">
      {label && (
        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Drop Area */}
      {files.length < maxFiles && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-800/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">
                PDF
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                DOCX
              </span>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">
                Arraste o arquivo ou <span className="text-blue-600 dark:text-blue-400 underline">clique para selecionar</span>
              </span>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-slate-500">{helperText}</p>
          </div>
        </div>
      )}

      {/* List of Uploaded Files */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((file) => {
            const isPdf = file.tipo === 'pdf'
            const isDocx = file.tipo === 'docx'

            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700/80 rounded-xl text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] uppercase shrink-0 ${
                      isPdf
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300'
                        : isDocx
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {file.tipo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate" title={file.nome}>
                      {file.nome}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 font-mono">
                      {file.tamanhoFormatado} • Anexado em {file.dataUpload}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      baixarArquivoReal(file)
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    title="Baixar arquivo"
                  >
                    <IconDownload className="w-3.5 h-3.5" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRemove(file.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                    title="Remover anexo"
                  >
                    <IconTrash className="w-3.5 h-3.5" size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
