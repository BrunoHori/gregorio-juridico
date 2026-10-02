import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useTenant } from '../../context/TenantContext'
import { Advogado } from '../../types'
import { IconPlus, IconTrash, IconDownload } from '../common/Icons'
import { useToast } from '../common/Toast'

interface EscritorioSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const EscritorioSettingsModal: React.FC<EscritorioSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTenant, updateTenant, resetData, exportBackup } = useTenant()
  const { success } = useToast()

  const [nome, setNome] = useState('')
  const [oabPrincipal, setOabPrincipal] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [logoText, setLogoText] = useState('')

  // Lista de advogados
  const [advogados, setAdvogados] = useState<Advogado[]>([])
  const [novoAdvNome, setNovoAdvNome] = useState('')
  const [novoAdvOab, setNovoAdvOab] = useState('')

  useEffect(() => {
    if (currentTenant) {
      setNome(currentTenant.nome)
      setOabPrincipal(currentTenant.oabPrincipal)
      setCidade(currentTenant.cidade)
      setEstado(currentTenant.estado)
      setTelefone(currentTenant.telefone || '')
      setEmail(currentTenant.email || '')
      setLogoText(currentTenant.logoText || 'ADV')
      setAdvogados(currentTenant.advogados || [])
    }
  }, [currentTenant, isOpen])

  const handleAddAdvogado = () => {
    if (!novoAdvNome.trim() || !novoAdvOab.trim()) return
    const colors = ['#1E3A8A', '#065F46', '#831843', '#312E81', '#701A75', '#B45309']
    const randomColor = colors[Math.floor(Math.random() * colors.length)]

    const novoAdv: Advogado = {
      id: `adv-${Date.now()}`,
      nome: novoAdvNome,
      oab: novoAdvOab,
      email: '',
      avatarColor: randomColor,
      ativo: true,
    }

    setAdvogados((prev) => [...prev, novoAdv])
    setNovoAdvNome('')
    setNovoAdvOab('')
  }

  const handleRemoveAdvogado = (id: string) => {
    if (advogados.length <= 1) {
      alert('O escritório deve manter pelo menos um advogado cadastrado.')
      return
    }
    setAdvogados((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateTenant(currentTenant.id, {
      nome,
      oabPrincipal,
      cidade,
      estado,
      telefone,
      email,
      logoText,
      advogados,
    })
    success('Dados do escritório atualizados!')
    onClose()
  }

  const inputClasses =
    'w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações do Escritório (Multi-Tenant)"
      subtitle="Personalize a marca, advogados e parâmetros deste escritório cliente"
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Dados Gerais da Banca */}
        <div className="space-y-3.5">
          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            Identidade do Escritório
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Nome da Banca / Razão Social *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Sigla / Monograma (2-3 ltrs)
              </label>
              <input
                type="text"
                maxLength={4}
                value={logoText}
                onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                className={`${inputClasses} font-mono text-center font-bold`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                OAB Principal *
              </label>
              <input
                type="text"
                required
                value={oabPrincipal}
                onChange={(e) => setOabPrincipal(e.target.value)}
                className={`${inputClasses} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Cidade *
              </label>
              <input
                type="text"
                required
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                UF *
              </label>
              <input
                type="text"
                maxLength={2}
                required
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
                className={`${inputClasses} font-mono text-center uppercase`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Telefone de Contato
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 0000-0000"
                className={`${inputClasses} font-mono`}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@escritorio.adv.br"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Advogados do Escritório */}
        <div className="space-y-3.5 pt-3.5 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Advogados da Equipe ({advogados.length})
            </h4>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto">
            {advogados.map((adv) => (
              <div
                key={adv.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                  >
                    {adv.nome[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{adv.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">{adv.oab}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAdvogado(adv.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                  title="Remover advogado"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Adicionar Advogado */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="text"
              value={novoAdvNome}
              onChange={(e) => setNovoAdvNome(e.target.value)}
              placeholder="Nome do novo advogado"
              className={`flex-1 ${inputClasses}`}
            />
            <input
              type="text"
              value={novoAdvOab}
              onChange={(e) => setNovoAdvOab(e.target.value)}
              placeholder="OAB/UF"
              className={`w-32 ${inputClasses} font-mono`}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddAdvogado}
              icon={<IconPlus className="w-3.5 h-3.5" />}
            >
              Adicionar
            </Button>
          </div>
        </div>

        {/* Gerenciamento de Backup e Demonstração */}
        <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={exportBackup}
            icon={<IconDownload className="w-4 h-4 text-gray-600 dark:text-slate-300" />}
          >
            Exportar Backup JSON
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Deseja restaurar os dados de demonstração originais?')) {
                resetData()
                success('Dados restaurados!')
                onClose()
              }
            }}
            className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm"
          >
            Restaurar Dados Demo
          </Button>
        </div>

        {/* Botões do Rodapé */}
        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Salvar Configurações
          </Button>
        </div>
      </form>
    </Modal>
  )
}
