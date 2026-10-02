import React, { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { useTenant } from '../../context/TenantContext'
import { useToast } from '../common/Toast'

interface NovoEscritorioModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NovoEscritorioModal: React.FC<NovoEscritorioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createTenant } = useTenant()
  const { success } = useToast()

  const [nome, setNome] = useState('')
  const [oabPrincipal, setOabPrincipal] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SP')
  const [advogadoNome, setAdvogadoNome] = useState('')
  const [advogadoOab, setAdvogadoOab] = useState('')
  const [logoText, setLogoText] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !oabPrincipal.trim() || !advogadoNome.trim()) {
      alert('Preencha os campos obrigatórios.')
      return
    }

    const calculatedMonogram =
      logoText.trim() ||
      nome
        .split(' ')
        .map((w) => w[0])
        .slice(0, 3)
        .join('')
        .toUpperCase()

    createTenant({
      nome,
      oabPrincipal,
      cidade: cidade || 'São Paulo',
      estado: estado || 'SP',
      logoText: calculatedMonogram,
      areas: ['Cível', 'Trabalhista', 'Tributário', 'Família e Sucessões', 'Consumidor'],
      advogados: [
        {
          id: `adv-${Date.now()}`,
          nome: advogadoNome,
          oab: advogadoOab || oabPrincipal,
          email: '',
          avatarColor: '#0F172A',
          ativo: true,
        },
      ],
    })

    success('Novo escritório criado!', `Você agora está gerenciando ${nome}`)
    onClose()
  }

  const inputClasses =
    'w-full text-sm px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-300 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Novo Escritório Cliente"
      subtitle="Instancie um novo ambiente isolado para vender ou implantar em outra banca"
      maxWidth="md"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
            Nome do Novo Escritório *
          </label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Oliveira & Santos Advogados Associados"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              OAB da Sociedade *
            </label>
            <input
              type="text"
              required
              value={oabPrincipal}
              onChange={(e) => setOabPrincipal(e.target.value)}
              placeholder="OAB/SP 55.432"
              className={`${inputClasses} font-mono`}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Sigla / Monograma
            </label>
            <input
              type="text"
              maxLength={4}
              value={logoText}
              onChange={(e) => setLogoText(e.target.value.toUpperCase())}
              placeholder="Ex: OSA"
              className={`${inputClasses} font-mono text-center font-bold uppercase`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Ex: Curitiba"
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
              UF
            </label>
            <input
              type="text"
              maxLength={2}
              value={estado}
              onChange={(e) => setEstado(e.target.value.toUpperCase())}
              placeholder="PR"
              className={`${inputClasses} font-mono text-center uppercase`}
            />
          </div>
        </div>

        {/* Advogado Titular */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
            Primeiro Advogado da Banca
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                Nome do Advogado Titular *
              </label>
              <input
                type="text"
                required
                value={advogadoNome}
                onChange={(e) => setAdvogadoNome(e.target.value)}
                placeholder="Dr(a). Fulano de Tal"
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-slate-300 mb-1.5">
                OAB Individual
              </label>
              <input
                type="text"
                value={advogadoOab}
                onChange={(e) => setAdvogadoOab(e.target.value)}
                placeholder="OAB/PR 89.123"
                className={`${inputClasses} font-mono`}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Criar Escritório
          </Button>
        </div>
      </form>
    </Modal>
  )
}
