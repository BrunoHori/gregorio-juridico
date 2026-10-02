import React, { createContext, useContext, useState, useEffect } from 'react'
import { EscritorioTenant, Prazo, Audiencia, Tarefa, StatusTarefa, StatusAudiencia } from '../types'
import { INITIAL_TENANTS, INITIAL_PRAZOS, INITIAL_AUDIENCIAS, INITIAL_TAREFAS } from '../data/initialData'

interface TenantContextType {
  tenants: EscritorioTenant[]
  currentTenant: EscritorioTenant
  setCurrentTenantId: (id: string) => void
  prazos: Prazo[]
  audiencias: Audiencia[]
  tarefas: Tarefa[]
  // Prazos methods
  addPrazo: (prazo: Omit<Prazo, 'id' | 'createdAt' | 'tenantId'>) => void
  updatePrazo: (id: string, prazo: Partial<Prazo>) => void
  deletePrazo: (id: string) => void
  togglePrazoCumprido: (id: string) => void
  // Audiencias methods
  addAudiencia: (audiencia: Omit<Audiencia, 'id' | 'createdAt' | 'tenantId'>) => void
  updateAudiencia: (id: string, audiencia: Partial<Audiencia>) => void
  deleteAudiencia: (id: string) => void
  setAudienciaStatus: (id: string, status: StatusAudiencia) => void
  // Tarefas methods
  addTarefa: (tarefa: Omit<Tarefa, 'id' | 'createdAt' | 'tenantId'>) => void
  updateTarefa: (id: string, tarefa: Partial<Tarefa>) => void
  deleteTarefa: (id: string) => void
  moveTarefaStatus: (id: string, status: StatusTarefa) => void
  toggleTarefaConcluida: (id: string) => void
  // Tenant management
  createTenant: (tenantData: Omit<EscritorioTenant, 'id'>) => string
  updateTenant: (id: string, tenantData: Partial<EscritorioTenant>) => void
  // Backup & Reset
  resetData: () => void
  exportBackup: () => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

const STORAGE_KEY = 'gregorio_juridico_v1_store'

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or fallback to initial
  const [tenants, setTenants] = useState<EscritorioTenant[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tenants`)
      return saved ? JSON.parse(saved) : INITIAL_TENANTS
    } catch {
      return INITIAL_TENANTS
    }
  })

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activeTenant`)
      return saved || INITIAL_TENANTS[0].id
    } catch {
      return INITIAL_TENANTS[0].id
    }
  })

  const [allPrazos, setAllPrazos] = useState<Prazo[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_prazos`)
      return saved ? JSON.parse(saved) : INITIAL_PRAZOS
    } catch {
      return INITIAL_PRAZOS
    }
  })

  const [allAudiencias, setAllAudiencias] = useState<Audiencia[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audiencias`)
      return saved ? JSON.parse(saved) : INITIAL_AUDIENCIAS
    } catch {
      return INITIAL_AUDIENCIAS
    }
  })

  const [allTarefas, setAllTarefas] = useState<Tarefa[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tarefas`)
      return saved ? JSON.parse(saved) : INITIAL_TAREFAS
    } catch {
      return INITIAL_TAREFAS
    }
  })

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tenants`, JSON.stringify(tenants))
  }, [tenants])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activeTenant`, currentTenantId)
  }, [currentTenantId])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_prazos`, JSON.stringify(allPrazos))
  }, [allPrazos])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audiencias`, JSON.stringify(allAudiencias))
  }, [allAudiencias])

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tarefas`, JSON.stringify(allTarefas))
  }, [allTarefas])

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0]

  // Filter items for current tenant
  const tenantPrazos = allPrazos.filter((p) => p.tenantId === currentTenant.id)
  const tenantAudiencias = allAudiencias.filter((a) => a.tenantId === currentTenant.id)
  const tenantTarefas = allTarefas.filter((t) => t.tenantId === currentTenant.id)

  // PRAZOS ACTIONS
  const addPrazo = (item: Omit<Prazo, 'id' | 'createdAt' | 'tenantId'>) => {
    const newPrazo: Prazo = {
      ...item,
      id: `prz-${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAllPrazos((prev) => [newPrazo, ...prev])
  }

  const updatePrazo = (id: string, updates: Partial<Prazo>) => {
    setAllPrazos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const deletePrazo = (id: string) => {
    setAllPrazos((prev) => prev.filter((p) => p.id !== id))
  }

  const togglePrazoCumprido = (id: string) => {
    setAllPrazos((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const isCumprido = p.status === 'cumprido'
        return {
          ...p,
          status: isCumprido ? 'em_andamento' : 'cumprido',
          dataProtocolo: isCumprido ? undefined : new Date().toISOString().split('T')[0],
        }
      })
    )
  }

  // AUDIENCIAS ACTIONS
  const addAudiencia = (item: Omit<Audiencia, 'id' | 'createdAt' | 'tenantId'>) => {
    const newAud: Audiencia = {
      ...item,
      id: `aud-${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAllAudiencias((prev) => [newAud, ...prev])
  }

  const updateAudiencia = (id: string, updates: Partial<Audiencia>) => {
    setAllAudiencias((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
  }

  const deleteAudiencia = (id: string) => {
    setAllAudiencias((prev) => prev.filter((a) => a.id !== id))
  }

  const setAudienciaStatus = (id: string, status: StatusAudiencia) => {
    setAllAudiencias((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
  }

  // TAREFAS ACTIONS
  const addTarefa = (item: Omit<Tarefa, 'id' | 'createdAt' | 'tenantId'>) => {
    const newTar: Tarefa = {
      ...item,
      id: `tar-${Date.now()}`,
      tenantId: currentTenant.id,
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAllTarefas((prev) => [newTar, ...prev])
  }

  const updateTarefa = (id: string, updates: Partial<Tarefa>) => {
    setAllTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  const deleteTarefa = (id: string) => {
    setAllTarefas((prev) => prev.filter((t) => t.id !== id))
  }

  const moveTarefaStatus = (id: string, status: StatusTarefa) => {
    setAllTarefas((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        return {
          ...t,
          status,
          concluidaEm: status === 'concluido' ? new Date().toISOString().split('T')[0] : undefined,
        }
      })
    )
  }

  const toggleTarefaConcluida = (id: string) => {
    setAllTarefas((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t
        const isDone = t.status === 'concluido'
        return {
          ...t,
          status: isDone ? 'a_fazer' : 'concluido',
          concluidaEm: isDone ? undefined : new Date().toISOString().split('T')[0],
        }
      })
    )
  }

  // TENANT ACTIONS
  const createTenant = (tenantData: Omit<EscritorioTenant, 'id'>) => {
    const newId = `escritorio-${Date.now()}`
    const newTenant: EscritorioTenant = {
      ...tenantData,
      id: newId,
    }
    setTenants((prev) => [...prev, newTenant])
    setCurrentTenantId(newId)
    return newId
  }

  const updateTenant = (id: string, tenantData: Partial<EscritorioTenant>) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...tenantData } : t))
    )
  }

  const resetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_tenants`)
    localStorage.removeItem(`${STORAGE_KEY}_activeTenant`)
    localStorage.removeItem(`${STORAGE_KEY}_prazos`)
    localStorage.removeItem(`${STORAGE_KEY}_audiencias`)
    localStorage.removeItem(`${STORAGE_KEY}_tarefas`)
    setTenants(INITIAL_TENANTS)
    setCurrentTenantId(INITIAL_TENANTS[0].id)
    setAllPrazos(INITIAL_PRAZOS)
    setAllAudiencias(INITIAL_AUDIENCIAS)
    setAllTarefas(INITIAL_TAREFAS)
  }

  const exportBackup = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tenants,
      prazos: allPrazos,
      audiencias: allAudiencias,
      tarefas: allTarefas,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup_gregorio_juridico_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        setCurrentTenantId,
        prazos: tenantPrazos,
        audiencias: tenantAudiencias,
        tarefas: tenantTarefas,
        addPrazo,
        updatePrazo,
        deletePrazo,
        togglePrazoCumprido,
        addAudiencia,
        updateAudiencia,
        deleteAudiencia,
        setAudienciaStatus,
        addTarefa,
        updateTarefa,
        deleteTarefa,
        moveTarefaStatus,
        toggleTarefaConcluida,
        createTenant,
        updateTenant,
        resetData,
        exportBackup,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = () => {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
