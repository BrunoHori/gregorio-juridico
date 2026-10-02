import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useToast } from '../common/Toast'

interface RecuperarSenhaModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RecuperarSenhaModal: React.FC<RecuperarSenhaModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [oab, setOab] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      success('Link de recuperação enviado!', `As instruções foram encaminhadas para ${email}`)
      onClose()
      setEmail('')
      setOab('')
    }, 600)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recuperação de Acesso da Banca"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          Informe seu e-mail institucional cadastrado e o número da OAB. Enviaremos um token de uso único para redefinição de credenciais.
        </p>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            E-mail Institucional *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="advogado@escritorio.adv.br"
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Inscrição OAB (Opcional)
          </label>
          <input
            type="text"
            value={oab}
            onChange={(e) => setOab(e.target.value)}
            placeholder="Ex: OAB/SP 312.445"
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Link Seguro'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
