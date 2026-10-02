import React, { useState } from 'react'
import { useTenant } from '../../context/TenantContext'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../common/Button'
import { IconCheck } from '../common/Icons'
import { RecuperarSenhaModal } from './RecuperarSenhaModal'
import { useToast } from '../common/Toast'

export const LoginView: React.FC = () => {
  const { tenants } = useTenant()
  const { login } = useAuth()
  const { success } = useToast()

  // Fluxo em 2 etapas: 1 = Escritório, 2 = Advogado
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '')
  const [selectedAdvogadoId, setSelectedAdvogadoId] = useState<string>('')
  const [senha, setSenha] = useState('••••••••')
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)

  const tenantAtual = tenants.find((t) => t.id === selectedTenantId) || tenants[0]

  const handleStep1Next = () => {
    if (!selectedTenantId) return
    const tenant = tenants.find((t) => t.id === selectedTenantId)
    if (tenant && tenant.advogados.length > 0) {
      setSelectedAdvogadoId(tenant.advogados[0].id)
    }
    setStep(2)
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenantId || !selectedAdvogadoId) return

    const ok = login(selectedTenantId, selectedAdvogadoId)
    if (ok) {
      const adv = tenantAtual?.advogados.find((a) => a.id === selectedAdvogadoId)
      success('Acesso autenticado!', `Bem-vindo(a), ${adv?.nome || 'Advogado'} (${tenantAtual?.nome})`)
    }
  }

  // Acesso rápido de 1 clique para demonstração
  const handleQuickLogin = (tenantId: string, advId: string) => {
    const ok = login(tenantId, advId)
    if (ok) {
      const t = tenants.find((item) => item.id === tenantId)
      const a = t?.advogados.find((item) => item.id === advId)
      success('Acesso rápido!', `${a?.nome} • ${t?.nome}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F3F4F6] flex flex-col justify-center items-center p-4 sm:p-6 select-none transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-elevated">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0F172A] dark:bg-slate-100 text-white dark:text-slate-950 font-bold text-xl shadow-md mb-3">
            G
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Portal Jurídico
          </h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Controle de Prazos, Pauta de Audiências e Gestão Forense
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                step === 1 ? 'bg-blue-600 w-6' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            />
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                step === 2 ? 'bg-blue-600 w-6' : 'bg-gray-300 dark:bg-slate-700'
              }`}
            />
          </div>
        </div>

        {/* ETAPA 1: Login do Escritório (Tenant) */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Etapa 1 de 2
              </p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                Identificação do Escritório
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Selecione a banca jurídica para carregar o banco de prazos e processos correspondente:
              </p>
            </div>

            <div className="space-y-2">
              {tenants.map((t) => {
                const isSelected = t.id === selectedTenantId
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTenantId(t.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 text-white dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {t.logoText || 'ADV'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {t.nome}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">
                          {t.oabPrincipal} • {t.cidade}/{t.estado}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <IconCheck className="w-3.5 h-3.5" size={12} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <Button variant="primary" className="w-full justify-center py-2.5" onClick={handleStep1Next}>
              Continuar para Login do Advogado →
            </Button>
          </div>
        )}

        {/* ETAPA 2: Login do Advogado */}
        {step === 2 && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Etapa 2 de 2
                </p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  Autenticação do Advogado
                </h2>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-semibold truncate max-w-[260px]">
                  Banca: {tenantAtual?.nome}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Trocar Escritório
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Selecione seu Usuário / Advogado *
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {tenantAtual?.advogados.map((adv) => {
                  const isSelected = adv.id === selectedAdvogadoId
                  return (
                    <div
                      key={adv.id}
                      onClick={() => setSelectedAdvogadoId(adv.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shrink-0"
                          style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                        >
                          {adv.nome[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {adv.nome}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 font-mono truncate">
                            {adv.oab} {adv.cargo ? `• ${adv.cargo}` : ''}
                          </p>
                        </div>
                      </div>
                      {isSelected && <IconCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" size={14} />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  Senha Institucional *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha de acesso"
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1 justify-center">
                ← Voltar
              </Button>
              <Button type="submit" variant="primary" className="flex-2 justify-center">
                Acessar Sistema →
              </Button>
            </div>
          </form>
        )}

        {/* Demo Fast Logins Section */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
            Acesso Rápido para Avaliação (1 Clique)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('escritorio-gregorio', 'adv-1')}
              className="p-2 text-left bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 border border-gray-200 dark:border-slate-700 rounded-xl transition-all"
            >
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Dra. Camila Gregório</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">Gregório & Associados (Sócia)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('escritorio-ferreira', 'adv-4')}
              className="p-2 text-left bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-750 border border-gray-200 dark:border-slate-700 rounded-xl transition-all"
            >
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">Dr. Leonardo Ferreira</p>
              <p className="text-[10px] text-gray-500 dark:text-slate-400 truncate">Ferreira, Costa & Prado (Sócio)</p>
            </button>
          </div>
        </div>
      </div>

      <RecuperarSenhaModal isOpen={isForgotModalOpen} onClose={() => setIsForgotModalOpen(false)} />
    </div>
  )
}
