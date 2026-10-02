import React, { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { TenantProvider } from './context/TenantContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/common/Toast'
import { Sidebar } from './components/layout/Sidebar'
import { Header } from './components/layout/Header'
import { DashboardOverview } from './components/dashboard/DashboardOverview'
import { PrazosView } from './components/prazos/PrazosView'
import { AudienciasView } from './components/audiencias/AudienciasView'
import { TarefasView } from './components/tarefas/TarefasView'
import { PautaImpressaoView } from './components/pauta/PautaImpressaoView'
import { SearchCommandDialog } from './components/common/SearchCommandDialog'
import { PrazoFormModal } from './components/prazos/PrazoFormModal'
import { AudienciaFormModal } from './components/audiencias/AudienciaFormModal'
import { TarefaFormModal } from './components/tarefas/TarefaFormModal'
import { EscritorioSettingsModal } from './components/config/EscritorioSettingsModal'
import { NovoEscritorioModal } from './components/config/NovoEscritorioModal'
import { LoginView } from './components/auth/LoginView'
import { PerfilModal } from './components/auth/PerfilModal'
import { ViewTab } from './types'

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isPrazoModalOpen, setIsPrazoModalOpen] = useState(false)
  const [isAudienciaModalOpen, setIsAudienciaModalOpen] = useState(false)
  const [isTarefaModalOpen, setIsTarefaModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isNewOfficeModalOpen, setIsNewOfficeModalOpen] = useState(false)
  const [isPerfilModalOpen, setIsPerfilModalOpen] = useState(false)

  // Keyboard shortcuts (Emil Kowalski power-user ux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input or textarea
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'

      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
        return
      }

      if (isInput) return

      // Tab switcher numbers 1 to 5
      if (e.key === '1') {
        setCurrentTab('dashboard')
      } else if (e.key === '2') {
        setCurrentTab('prazos')
      } else if (e.key === '3') {
        setCurrentTab('audiencias')
      } else if (e.key === '4') {
        setCurrentTab('tarefas')
      } else if (e.key === '5') {
        setCurrentTab('pauta_impressao')
      } else if (e.key.toLowerCase() === 'n') {
        setIsPrazoModalOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Se não autenticado, renderiza a tela de login em 2 etapas
  if (!isAuthenticated) {
    return <LoginView />
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0F19] text-[#111827] dark:text-[#F3F4F6] flex font-sans selection:bg-[#0F172A] selection:text-white transition-colors duration-200">
      {/* Desktop Persistent Left Sidebar */}
      <div className="hidden md:flex shrink-0 min-h-screen sticky top-0 h-screen">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenNewOffice={() => setIsNewOfficeModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPerfil={() => setIsPerfilModalOpen(true)}
        />
      </div>

      {/* Mobile Sidebar Drawer / Modal */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full z-10 shadow-2xl bg-white dark:bg-slate-900 animate-in slide-in-from-left duration-200">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab)
                setIsMobileSidebarOpen(false)
              }}
              onOpenNewOffice={() => {
                setIsNewOfficeModalOpen(true)
                setIsMobileSidebarOpen(false)
              }}
              onOpenSettings={() => {
                setIsSettingsModalOpen(true)
                setIsMobileSidebarOpen(false)
              }}
              onOpenPerfil={() => {
                setIsPerfilModalOpen(true)
                setIsMobileSidebarOpen(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Right Content Area (Full Fluid Layout) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewPrazo={() => setIsPrazoModalOpen(true)}
          onOpenNewAudiencia={() => setIsAudienciaModalOpen(true)}
          onOpenNewTarefa={() => setIsTarefaModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPrintDocket={() => setCurrentTab('pauta_impressao')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Main Content: Wide, breathing room, organized */}
        <main className="flex-1 w-full px-6 lg:px-10 xl:px-12 py-8 max-w-[1700px] mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              onSelectTab={(tab) => setCurrentTab(tab)}
              onOpenNewPrazo={() => setIsPrazoModalOpen(true)}
              onOpenNewAudiencia={() => setIsAudienciaModalOpen(true)}
              onOpenNewTarefa={() => setIsTarefaModalOpen(true)}
            />
          )}

          {currentTab === 'prazos' && <PrazosView />}

          {currentTab === 'audiencias' && <AudienciasView />}

          {currentTab === 'tarefas' && <TarefasView />}

          {currentTab === 'pauta_impressao' && <PautaImpressaoView />}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <SearchCommandDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenNewPrazo={() => setIsPrazoModalOpen(true)}
        onOpenNewAudiencia={() => setIsAudienciaModalOpen(true)}
        onOpenNewTarefa={() => setIsTarefaModalOpen(true)}
      />

      <PrazoFormModal
        isOpen={isPrazoModalOpen}
        onClose={() => setIsPrazoModalOpen(false)}
      />

      <AudienciaFormModal
        isOpen={isAudienciaModalOpen}
        onClose={() => setIsAudienciaModalOpen(false)}
      />

      <TarefaFormModal
        isOpen={isTarefaModalOpen}
        onClose={() => setIsTarefaModalOpen(false)}
      />

      <EscritorioSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <NovoEscritorioModal
        isOpen={isNewOfficeModalOpen}
        onClose={() => setIsNewOfficeModalOpen(false)}
      />

      <PerfilModal
        isOpen={isPerfilModalOpen}
        onClose={() => setIsPerfilModalOpen(false)}
      />
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <TenantProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  )
}

export default App
