import React, { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../common/Toast'
import { CargoAdvogado } from '../../types'

interface PerfilModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PerfilModal: React.FC<PerfilModalProps> = ({ isOpen, onClose }) => {
  const { activeAdvogado, activeTenant, updateProfile } = useAuth()
  const { success } = useToast()

  const [nome, setNome] = useState('')
  const [oab, setOab] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState<CargoAdvogado>('Advogado Associado')
  const [avatarColor, setAvatarColor] = useState('#1E3A8A')
  const [novaSenha, setNovaSenha] = useState('')

  useEffect(() => {
    if (activeAdvogado) {
      setNome(activeAdvogado.nome || '')
      setOab(activeAdvogado.oab || '')
      setEmail(activeAdvogado.email || '')
      setTelefone(activeAdvogado.telefone || '(11) 98765-4321')
      setCargo(activeAdvogado.cargo || 'Advogado Associado')
      setAvatarColor(activeAdvogado.avatarColor || '#1E3A8A')
    }
  }, [activeAdvogado, isOpen])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAdvogado) return

    updateProfile({
      nome,
      oab,
      email,
      telefone,
      cargo,
      avatarColor,
    })

    success('Perfil atualizado com sucesso!', `${nome} (${cargo})`)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edição do Perfil Profissional"
      maxWidth="lg"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Banner com avatar e dados do escritório */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-slate-700">
          <div
            className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {nome ? nome[0] : 'A'}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base">{nome}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
              {oab} • {activeTenant?.nome}
            </p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {cargo}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Nome Completo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Número da OAB *
            </label>
            <input
              type="text"
              required
              value={oab}
              onChange={(e) => setOab(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              E-mail Institucional *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Cargo / Função na Banca
            </label>
            <select
              value={cargo}
              onChange={(e) => setCargo(e.target.value as CargoAdvogado)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            >
              <option value="Sócio">Sócio(a)</option>
              <option value="Advogado Associado">Advogado(a) Associado(a)</option>
              <option value="Estagiário">Estagiário(a)</option>
              <option value="Administrador">Administrador(a) do Escritório</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Telefone / Celular
            </label>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(11) 98765-4321"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Cor do Avatar de Destaque
            </label>
            <div className="flex items-center gap-2 pt-1">
              {['#1E3A8A', '#065F46', '#831843', '#312E81', '#701A75', '#B45309'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    avatarColor === c ? 'scale-110 border-white ring-2 ring-blue-500' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Alterar Senha de Acesso
          </label>
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Digite nova senha para atualizar"
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  )
}
