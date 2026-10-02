import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Tarefa, StatusTarefa, PrioridadeTarefa, Anexo, Subtarefa } from '../../types'
import { useTenant } from '../../context/TenantContext'
import { getTodayString } from '../../utils/dateUtils'
import { formatCNJ } from '../../utils/cnjUtils'
import { FileUpload } from '../common/FileUpload'
import { sugerirChecklistTarefa } from '../../utils/aiSimulator'
import { useToast } from '../common/Toast'
import { IconPlus, IconTrash } from '../common/Icons'

interface TarefaFormModalProps {
  isOpen: boolean
  onClose: () => void
  tarefaToEdit?: Tarefa | null
  initialStatus?: StatusTarefa
}

export const TarefaFormModal: React.FC<TarefaFormModalProps> = ({
  isOpen,
  onClose,
  tarefaToEdit,
  initialStatus = 'a_fazer',
}) => {
  const { currentTenant, addTarefa, updateTarefa } = useTenant()
  const { success } = useToast()

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState<StatusTarefa>(initialStatus)
  const [prioridade, setPrioridade] = useState<PrioridadeTarefa>('media')
  const [dataLimite, setDataLimite] = useState('')
  const [advogadoId, setAdvogadoId] = useState('')
  const [processoNumero, setProcessoNumero] = useState('')
  const [cliente, setCliente] = useState('')

  // Anexos de Minuta (DOCX/PDF)
  const [anexos, setAnexos] = useState<Anexo[]>([])

  // Checklist / Subtarefas com IA
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([])
  const [novaSubtarefa, setNovaSubtarefa] = useState('')
  const [isSuggestingAI, setIsSuggestingAI] = useState(false)

  useEffect(() => {
    if (tarefaToEdit) {
      setTitulo(tarefaToEdit.titulo)
      setDescricao(tarefaToEdit.descricao || '')
      setStatus(tarefaToEdit.status)
      setPrioridade(tarefaToEdit.prioridade)
      setDataLimite(tarefaToEdit.dataLimite || '')
      setAdvogadoId(tarefaToEdit.advogadoId)
      setProcessoNumero(tarefaToEdit.processoNumero || '')
      setCliente(tarefaToEdit.cliente || '')
      setAnexos(tarefaToEdit.anexos || [])
      setSubtarefas(tarefaToEdit.subtarefas || [])
    } else {
      setTitulo('')
      setDescricao('')
      setStatus(initialStatus)
      setPrioridade('media')
      setDataLimite(getTodayString())
      setAdvogadoId(currentTenant.advogados[0]?.id || '')
      setProcessoNumero('')
      setCliente('')
      setAnexos([])
      setSubtarefas([])
    }
  }, [tarefaToEdit, isOpen, initialStatus, currentTenant])

  const handleSugerirChecklist = () => {
    if (!titulo.trim()) {
      alert('Digite o título da tarefa primeiro para que a IA possa sugerir os passos adequados.')
      return
    }

    setIsSuggestingAI(true)
    setTimeout(() => {
      setIsSuggestingAI(false)
      const sugeridas = sugerirChecklistTarefa(titulo, descricao)
      setSubtarefas(sugeridas)
      success('Checklist sugerido pela IA!', `${sugeridas.length} subtarefas foram recomendadas.`)
    }, 450)
  }

  const handleToggleSubtarefa = (id: string) => {
    setSubtarefas(
      subtarefas.map((s) => (s.id === id ? { ...s, concluida: !s.concluida } : s))
    )
  }

  const handleRemoveSubtarefa = (id: string) => {
    setSubtarefas(subtarefas.filter((s) => s.id !== id))
  }

  const handleAddSubtarefa = () => {
    if (!novaSubtarefa.trim()) return
    setSubtarefas([
      ...subtarefas,
      {
        id: `sub-${Date.now()}`,
        titulo: novaSubtarefa.trim(),
        concluida: false,
      },
    ])
    setNovaSubtarefa('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim()) {
      alert('Preencha o título da tarefa.')
      return
    }

    const payload = {
      titulo,
      descricao,
      status,
      prioridade,
      dataLimite,
      advogadoId: advogadoId || currentTenant.advogados[0]?.id,
      processoNumero,
      cliente,
      anexos,
      subtarefas,
      sugeridoPorIA: subtarefas.length > 0,
    }

    if (tarefaToEdit) {
      updateTarefa(tarefaToEdit.id, payload)
      success('Tarefa atualizada com sucesso!')
    } else {
      addTarefa(payload)
      success('Nova tarefa adicionada ao quadro!')
    }

    onClose()
  }

  const inputClasses =
    'w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 transition-colors'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tarefaToEdit ? 'Editar Tarefa' : 'Nova Tarefa do Escritório'}
      subtitle="Defina o fluxo de trabalho, checklist processual e anexo de minutas"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título da Tarefa e Sugestão IA */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300">
              Título da Atividade / Peça *
            </label>
            <button
              type="button"
              disabled={isSuggestingAI}
              onClick={handleSugerirChecklist}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>{isSuggestingAI ? 'Gerando...' : '✨ Sugerir Checklist com IA'}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Elaborar Contestação em Ação de Cobrança, Minutar Recurso, Revisar Parecer"
            className={inputClasses}
          />
        </div>

        {/* Descrição Detalhada */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
            Orientações e Instruções
          </label>
          <textarea
            rows={2}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Detalhes para o associado ou estagiário: pontos de atenção, laudos anexados..."
            className={inputClasses}
          />
        </div>

        {/* Checklist / Subtarefas da IA */}
        <div className="p-4 bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Subtarefas / Checklist Processual</span>
              {subtarefas.length > 0 && (
                <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400">
                  ({subtarefas.filter((s) => s.concluida).length}/{subtarefas.length} feitos)
                </span>
              )}
            </h4>
            {subtarefas.length > 0 && (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                ✨ Sugerido por IA
              </span>
            )}
          </div>

          {/* Lista de Subtarefas */}
          {subtarefas.length > 0 && (
            <div className="space-y-1.5">
              {subtarefas.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs gap-2"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={sub.concluida}
                      onChange={() => handleToggleSubtarefa(sub.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-700"
                    />
                    <span
                      className={`truncate ${
                        sub.concluida
                          ? 'line-through text-gray-400 dark:text-slate-500'
                          : 'text-gray-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {sub.titulo}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtarefa(sub.id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                  >
                    <IconTrash className="w-3.5 h-3.5" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar nova subtarefa manual */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={novaSubtarefa}
              onChange={(e) => setNovaSubtarefa(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSubtarefa()
                }
              }}
              placeholder="Adicionar novo item ao checklist..."
              className="flex-1 text-xs px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSubtarefa}
              icon={<IconPlus className="w-3.5 h-3.5" size={14} />}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Upload de Minutas e Peças para Revisão */}
        <div className="p-4 bg-gray-50/70 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded-2xl">
          <FileUpload
            label="Anexo de Elaboração / Revisão (DOCX ou PDF)"
            files={anexos}
            onFilesChange={setAnexos}
            categoria="minuta"
            maxFiles={2}
            helperText="Suba a minuta em DOCX para o sócio revisar ou PDF com anotações e provas"
          />
        </div>

        {/* Coluna Kanban e Prioridade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Status no Quadro (Kanban)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusTarefa)}
              className={inputClasses}
            >
              <option value="a_fazer">A Fazer</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="revisao">Em Revisão pelo Sócio</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Prioridade
            </label>
            <select
              value={prioridade}
              onChange={(e) => setPrioridade(e.target.value as PrioridadeTarefa)}
              className={inputClasses}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        {/* Data Limite e Advogado Responsável */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Data Limite de Entrega
            </label>
            <input
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Responsável pela Atividade
            </label>
            <select
              value={advogadoId}
              onChange={(e) => setAdvogadoId(e.target.value)}
              className={inputClasses}
            >
              {currentTenant.advogados.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.nome} ({adv.cargo || 'Advogado'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Processo e Cliente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Processo Vinculado (Opcional)
            </label>
            <input
              type="text"
              value={processoNumero}
              onChange={(e) => setProcessoNumero(formatCNJ(e.target.value))}
              placeholder="0000000-00.0000.0.00.0000"
              className={`${inputClasses} font-mono`}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Cliente / Pasta
            </label>
            <input
              type="text"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            {tarefaToEdit ? 'Salvar Tarefa' : 'Adicionar Tarefa'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
