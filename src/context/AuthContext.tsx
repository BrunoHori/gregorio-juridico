import React, { createContext, useContext, useState, useEffect } from 'react'
import { Advogado, EscritorioTenant } from '../types'
import { useTenant } from './TenantContext'

interface AuthContextType {
  isAuthenticated: boolean
  activeTenant: EscritorioTenant | null
  activeAdvogado: Advogado | null
  login: (tenantId: string, advogadoId: string) => boolean
  logout: () => void
  updateProfile: (updatedData: Partial<Advogado>) => void
  openLoginModal: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'gregorio_juridico_auth_session'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { tenants, setCurrentTenantId } = useTenant()

  // Estado de autenticação persistido
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean
    tenantId: string | null
    advogadoId: string | null
  }>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {}
    // Padrão inicial: Autenticado como Dra. Camila Gregório (para não travar o primeiro acesso)
    return {
      isAuthenticated: true,
      tenantId: 'escritorio-gregorio',
      advogadoId: 'adv-1',
    }
  })

  // Sincroniza tenant atual com o TenantContext
  useEffect(() => {
    if (authState.tenantId) {
      setCurrentTenantId(authState.tenantId)
    }
  }, [authState.tenantId, setCurrentTenantId])

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState))
    } catch {}
  }, [authState])

  const activeTenant = tenants.find((t) => t.id === authState.tenantId) || tenants[0] || null
  const activeAdvogado =
    activeTenant?.advogados.find((a) => a.id === authState.advogadoId) ||
    activeTenant?.advogados[0] ||
    null

  const login = (tenantId: string, advogadoId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId)
    if (!tenant) return false
    const adv = tenant.advogados.find((a) => a.id === advogadoId)
    if (!adv) return false

    setAuthState({
      isAuthenticated: true,
      tenantId,
      advogadoId,
    })
    setCurrentTenantId(tenantId)
    return true
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      tenantId: null,
      advogadoId: null,
    })
  }

  const openLoginModal = () => {
    setAuthState((prev) => ({ ...prev, isAuthenticated: false }))
  }

  const updateProfile = (updatedData: Partial<Advogado>) => {
    if (!activeAdvogado || !activeTenant) return
    // Atualiza in-memory para refletir no advogado
    Object.assign(activeAdvogado, updatedData)
    setAuthState((prev) => ({ ...prev }))
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        activeTenant,
        activeAdvogado,
        login,
        logout,
        updateProfile,
        openLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
