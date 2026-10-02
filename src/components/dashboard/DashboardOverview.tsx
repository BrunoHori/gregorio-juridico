import React from 'react'
import { useTenant } from '../../context/TenantContext'
import {
  getTodayString,
  formatDateBr,
  formatDateExtenso,
  getDeadlineUrgency,
  getUrgencyBadgeInfo,
} from '../../utils/dateUtils'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import {
  IconScale,
  IconVideo,
  IconCheckSquare,
  IconAlertCircle,
  IconExternalLink,
  IconCheck,
  IconCopy,
} from '../common/Icons'
import { useToast } from '../common/Toast'
import { ViewTab } from '../../types'

interface DashboardOverviewProps {
  onSelectTab: (tab: ViewTab) => void
  onOpenNewPrazo: () => void
  onOpenNewAudiencia: () => void
  onOpenNewTarefa: () => void
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectTab,
  onOpenNewPrazo,
  onOpenNewAudiencia,
  onOpenNewTarefa,
}) => {
  const { currentTenant, prazos, audiencias, tarefas, togglePrazoCumprido } =
    useTenant()
  const { success } = useToast()
  const todayStr = getTodayString()

  // Filtros de urgência imediata
  const prazosHoje = prazos.filter((p) => p.dataFatal === todayStr && p.status !== 'cumprido')
  const prazosCriticos = prazos.filter((p) => {
    if (p.status === 'cumprido') return false
    const urg = getDeadlineUrgency(p.dataFatal)
    return urg === 'vencido' || urg === 'hoje' || urg === 'amanha' || urg === 'critico'
  })

  const audienciasHoje = audiencias.filter(
    (a) => a.data === todayStr && a.status !== 'realizada'
  )

  const tarefasPendentesHoje = tarefas.filter(
    (t) => t.status !== 'concluido' && (t.dataLimite === todayStr || t.prioridade === 'urgente')
  )

  const handleCopyProcesso = (num: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(num)
    success('Número copiado!', num)
  }

  return (
    <div className="space-y-6">
      {/* Banner / Header do Dia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              {currentTenant.nome}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-1.5">
            Painel de Urgências e Pauta Forense
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
            {formatDateExtenso(todayStr)} • Pautas e prazos atualizados em tempo real
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNewPrazo}
            icon={<IconScale className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          >
            + Prazo
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNewAudiencia}
            icon={<IconVideo className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          >
            + Audiência
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNewTarefa}
            icon={<IconCheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          >
            + Tarefa
          </Button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Prazos Fatais */}
        <div
          onClick={() => onSelectTab('prazos')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle hover:border-gray-300 dark:hover:border-slate-700 cursor-pointer transition-all hover:shadow-elevated group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
              <IconScale className="w-6 h-6" />
            </div>
            {prazosHoje.length > 0 ? (
              <Badge variant="urgent" dot>
                {prazosHoje.length} vencendo HOJE
              </Badge>
            ) : (
              <Badge variant="success">Dia em dia</Badge>
            )}
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight">
              {prazosCriticos.length}
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-1.5">
              Prazos Críticos (Próx. 3 dias)
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {prazos.filter((p) => p.status === 'cumprido').length} protocolados no período
            </p>
          </div>
        </div>

        {/* Card 2: Audiências */}
        <div
          onClick={() => onSelectTab('audiencias')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle hover:border-gray-300 dark:hover:border-slate-700 cursor-pointer transition-all hover:shadow-elevated group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
              <IconVideo className="w-6 h-6" />
            </div>
            {audienciasHoje.length > 0 ? (
              <Badge variant="info" dot>
                {audienciasHoje.length} HOJE
              </Badge>
            ) : (
              <Badge variant="default">Sem audiência hoje</Badge>
            )}
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight">
              {audiencias.length}
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-1.5">
              Audiências na Pauta Geral
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {audiencias.filter((a) => a.modalidade === 'telepresencial').length} telepresenciais / virtuais
            </p>
          </div>
        </div>

        {/* Card 3: Tarefas Operacionais */}
        <div
          onClick={() => onSelectTab('tarefas')}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle hover:border-gray-300 dark:hover:border-slate-700 cursor-pointer transition-all hover:shadow-elevated group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              <IconCheckSquare className="w-6 h-6" />
            </div>
            <Badge variant="default">
              {tarefas.filter((t) => t.status === 'concluido').length}/{tarefas.length} feitas
            </Badge>
          </div>
          <div className="mt-5">
            <p className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono tracking-tight">
              {tarefasPendentesHoje.length}
            </p>
            <p className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-1.5">
              Tarefas Urgentes Pendentes
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Distribuídas entre os advogados da banca
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Urgências do Dia e Audiências Imediatas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco 1: Prazos Fatais e Imediatos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle overflow-hidden transition-colors">
          <div className="px-6 py-4.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Prazos Fatais e Próximos Vencimentos
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('prazos')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              Ver todos →
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {prazosCriticos.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
                Nenhum prazo fatal pendente para os próximos dias. Excelente!
              </div>
            ) : (
              prazosCriticos.slice(0, 4).map((prazo) => {
                const urgency = getDeadlineUrgency(prazo.dataFatal, prazo.status === 'cumprido')
                const badgeInfo = getUrgencyBadgeInfo(urgency)
                const adv = currentTenant.advogados.find((a) => a.id === prazo.advogadoId)

                return (
                  <div
                    key={prazo.id}
                    className="p-5 hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold uppercase ${badgeInfo.bg} ${badgeInfo.textCol} border ${badgeInfo.border}`}
                        >
                          {badgeInfo.text}
                        </span>
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                          {prazo.titulo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-slate-300 flex-wrap">
                        <button
                          onClick={(e) => handleCopyProcesso(prazo.processoNumero, e)}
                          className="font-mono text-xs text-gray-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 px-2 py-0.5 rounded-md transition-colors"
                          title="Clique para copiar número CNJ"
                        >
                          <span>{prazo.processoNumero}</span>
                          <IconCopy className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <span>•</span>
                        <span className="truncate font-medium">{prazo.cliente}</span>
                        {adv && (
                          <>
                            <span>•</span>
                            <span className="text-gray-600 dark:text-slate-400 font-semibold truncate max-w-[120px]">
                              {adv.nome.split(' ')[0]}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-bold text-gray-800 dark:text-slate-200">{prazo.tribunal}</span>
                      </div>

                      {prazo.observacoes && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 italic line-clamp-1 bg-amber-50/60 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                          {prazo.observacoes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                          {formatDateBr(prazo.dataFatal)}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 block font-mono">
                          até {prazo.horarioLimite}
                        </span>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => togglePrazoCumprido(prazo.id)}
                        className="text-xs py-1.5 px-2.5 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                        icon={<IconCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                      >
                        Protocolar
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Bloco 2: Pauta de Audiências Imediatas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle overflow-hidden transition-colors">
          <div className="px-6 py-4.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconVideo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Pauta de Audiências (Destaques)
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('audiencias')}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              Ver pauta completa →
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {audiencias.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
                Nenhuma audiência agendada no momento.
              </div>
            ) : (
              audiencias.slice(0, 4).map((aud) => {
                const adv = currentTenant.advogados.find((a) => a.id === aud.advogadoId)
                const isHoje = aud.data === todayStr

                return (
                  <div
                    key={aud.id}
                    className="p-5 hover:bg-gray-50/80 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isHoje && (
                          <Badge variant="urgent" dot>
                            HOJE às {aud.horario}
                          </Badge>
                        )}
                        <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate">
                          {aud.tipo}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 font-semibold">
                          {aud.modalidade === 'telepresencial' ? 'Virtual' : 'Presencial'}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-gray-700 dark:text-slate-300">
                        <p className="truncate font-semibold">{aud.cliente} <span className="text-gray-400 dark:text-slate-500 font-normal">vs</span> {aud.parteContraria}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                          Proc: {aud.processoNumero}
                        </p>
                      </div>

                      {aud.modalidade === 'telepresencial' && aud.linkVirtual && (
                        <div className="pt-1">
                          <a
                            href={aud.linkVirtual}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <IconVideo className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Entrar na Sala Virtual</span>
                            <IconExternalLink className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          </a>
                        </div>
                      )}

                      {aud.modalidade === 'presencial' && aud.local && (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                          Local: {aud.local}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                        {formatDateBr(aud.data)}
                      </span>
                      <span className="text-xs sm:text-sm font-mono text-gray-600 dark:text-slate-300 font-semibold">
                        às {aud.horario}
                      </span>
                      {adv && (
                        <span className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">
                          Resp: {adv.nome.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Bloco 3: Equipe de Advogados e Distribuição da Banca */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Equipe Jurídica e Distribuição de Casos
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Carga de trabalho ativa no escritório {currentTenant.nome}
            </p>
          </div>
          <span className="text-sm font-mono text-gray-500 dark:text-slate-400 font-semibold">
            {currentTenant.advogados.length} advogados
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentTenant.advogados.map((adv) => {
            const advPrazos = prazos.filter(
              (p) => p.advogadoId === adv.id && p.status !== 'cumprido'
            )
            const advAudiencias = audiencias.filter((a) => a.advogadoId === adv.id)
            const advTarefas = tarefas.filter(
              (t) => t.advogadoId === adv.id && t.status !== 'concluido'
            )

            return (
              <div
                key={adv.id}
                className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/50 flex flex-col justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
                    style={{ backgroundColor: adv.avatarColor || '#0F172A' }}
                  >
                    {adv.nome
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{adv.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono truncate">{adv.oab}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs sm:text-sm text-gray-700 dark:text-slate-300 font-mono">
                  <span>
                    <strong className="text-gray-950 dark:text-white font-bold">{advPrazos.length}</strong> prazos
                  </span>
                  <span>
                    <strong className="text-gray-950 dark:text-white font-bold">{advAudiencias.length}</strong> audiências
                  </span>
                  <span>
                    <strong className="text-gray-950 dark:text-white font-bold">{advTarefas.length}</strong> tarefas
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
