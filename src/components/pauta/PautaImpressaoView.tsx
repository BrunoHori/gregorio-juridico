import React, { useState } from 'react'
import { useTenant } from '../../context/TenantContext'
import {
  getTodayString,
  formatDateBr,
  formatDateExtenso,
} from '../../utils/dateUtils'
import { Button } from '../common/Button'
import { IconPrinter, IconScale, IconVideo, IconCheckSquare } from '../common/Icons'

export const PautaImpressaoView: React.FC = () => {
  const { currentTenant, prazos, audiencias, tarefas } = useTenant()
  const todayStr = getTodayString()

  const [filterDate, setFilterDate] = useState(todayStr)

  // Filtros pela data selecionada
  const audienciasDoDia = audiencias.filter((a) => a.data === filterDate)
  const prazosDoDia = prazos.filter((p) => p.dataFatal === filterDate)
  const tarefasDoDia = tarefas.filter(
    (t) => t.dataLimite === filterDate || t.prioridade === 'urgente'
  )

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Controles de Impressão (Ocultos na impressão real) */}
      <div className="no-print bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Pauta Forense para Impressão / Relatório Diário
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Gera uma folha limpa de audiências, prazos e tarefas para a bancada ou arquivo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <span className="text-gray-600 dark:text-slate-400 font-medium">Data da Pauta:</span>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-slate-700 rounded-xl text-sm font-mono bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<IconPrinter className="w-4 h-4" />}
          >
            Imprimir / Salvar PDF
          </Button>
        </div>
      </div>

      {/* Folha Oficial de Impressão (Papel Timbrado do Escritório) */}
      <div className="bg-white text-gray-900 dark:bg-slate-900 dark:text-slate-100 p-8 sm:p-12 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto space-y-8 print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Cabeçalho do Escritório */}
        <div className="border-b-2 border-gray-900 dark:border-slate-700 print:border-black pb-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-950 dark:text-white print:text-black uppercase tracking-tight">
              {currentTenant.nome}
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 print:text-gray-700 mt-1 font-mono">
              {currentTenant.oabPrincipal} • {currentTenant.cidade}/{currentTenant.estado}
            </p>
            {currentTenant.telefone && (
              <p className="text-sm text-gray-500 dark:text-slate-400 print:text-gray-600 font-mono">
                Tel: {currentTenant.telefone} • {currentTenant.email}
              </p>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-gray-100 dark:bg-slate-800 print:bg-gray-100 text-gray-800 dark:text-slate-200 print:text-black rounded-md">
              Pauta Forense Diária
            </span>
            <p className="text-base font-bold text-gray-950 dark:text-white print:text-black mt-2 font-mono">
              {formatDateBr(filterDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 print:text-gray-600">
              {formatDateExtenso(filterDate)}
            </p>
          </div>
        </div>

        {/* Bloco 1: Audiências Agendadas */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
            <IconVideo className="w-5 h-5 text-gray-800 dark:text-slate-200" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              1. Pauta de Audiências ({audienciasDoDia.length})
            </h2>
          </div>

          {audienciasDoDia.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic py-2">
              Nenhuma audiência marcada para esta data.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              {audienciasDoDia.map((aud) => {
                const adv = currentTenant.advogados.find((a) => a.id === aud.advogadoId)

                return (
                  <div key={aud.id} className="py-3.5 text-sm space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-950 dark:text-white font-mono text-base">
                        {aud.horario} — {aud.tipo}
                      </span>
                      <span className="font-semibold uppercase text-xs px-2.5 py-0.5 rounded border border-gray-300 dark:border-slate-700">
                        {aud.modalidade}
                      </span>
                    </div>

                    <p className="text-gray-800 dark:text-slate-200">
                      <strong>Processo:</strong> <span className="font-mono">{aud.processoNumero}</span>
                    </p>

                    <p className="text-gray-800 dark:text-slate-200">
                      <strong>Partes:</strong> {aud.cliente} <em>vs</em> {aud.parteContraria}
                    </p>

                    {aud.modalidade === 'presencial' && aud.local && (
                      <p className="text-gray-700 dark:text-slate-300">
                        <strong>Local:</strong> {aud.local}
                      </p>
                    )}

                    {aud.modalidade === 'telepresencial' && aud.linkVirtual && (
                      <p className="text-blue-700 dark:text-blue-400 font-mono text-xs truncate">
                        <strong>Link Virtual:</strong> {aud.linkVirtual}
                      </p>
                    )}

                    {aud.testemunhas && (
                      <p className="text-gray-700 dark:text-slate-300">
                        <strong>Testemunhas:</strong> {aud.testemunhas}
                      </p>
                    )}

                    {adv && (
                      <p className="text-gray-600 dark:text-slate-400">
                        <strong>Advogado Designado:</strong> {adv.nome} ({adv.oab})
                      </p>
                    )}

                    {aud.notasEstrategicas && (
                      <p className="text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-200 dark:border-slate-700 mt-1 italic">
                        <strong>Notas:</strong> {aud.notasEstrategicas}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Bloco 2: Prazos Processuais Fatais */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
            <IconScale className="w-5 h-5 text-gray-800 dark:text-slate-200" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              2. Prazos Processuais Fatais ({prazosDoDia.length})
            </h2>
          </div>

          {prazosDoDia.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic py-2">
              Nenhum prazo fatal vencendo nesta data.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-semibold">
                    <th className="py-2.5">Ato / Título</th>
                    <th className="py-2.5">Processo & Tribunal</th>
                    <th className="py-2.5">Cliente</th>
                    <th className="py-2.5">Responsável</th>
                    <th className="py-2.5 text-right">Limite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                  {prazosDoDia.map((prazo) => {
                    const adv = currentTenant.advogados.find((a) => a.id === prazo.advogadoId)

                    return (
                      <tr key={prazo.id} className="py-2.5">
                        <td className="py-2.5 font-bold text-gray-900 dark:text-white">{prazo.titulo}</td>
                        <td className="py-2.5 font-mono text-xs">
                          {prazo.processoNumero} <br />
                          <span className="text-gray-500 dark:text-slate-400">{prazo.tribunal} ({prazo.vara})</span>
                        </td>
                        <td className="py-2.5 text-gray-700 dark:text-slate-300">{prazo.cliente}</td>
                        <td className="py-2.5 text-gray-700 dark:text-slate-300">{adv ? adv.nome : '-'}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {prazo.horarioLimite}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bloco 3: Tarefas Críticas */}
        <section className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
            <IconCheckSquare className="w-5 h-5 text-gray-800 dark:text-slate-200" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
              3. Tarefas e Providências do Dia ({tarefasDoDia.length})
            </h2>
          </div>

          {tarefasDoDia.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 italic py-2">
              Nenhuma tarefa crítica com vencimento hoje.
            </p>
          ) : (
            <div className="space-y-2.5">
              {tarefasDoDia.map((tar) => {
                const adv = currentTenant.advogados.find((a) => a.id === tar.advogadoId)

                return (
                  <div
                    key={tar.id}
                    className="flex items-start justify-between gap-3 text-sm border border-gray-200 dark:border-slate-800 p-3 rounded-xl"
                  >
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">[ ] {tar.titulo}</span>
                      {tar.descricao && (
                        <p className="text-gray-600 dark:text-slate-400 text-xs sm:text-sm mt-0.5">{tar.descricao}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-semibold text-gray-700 dark:text-slate-300">{adv ? adv.nome : ''}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Rodapé da Folha */}
        <div className="pt-6 border-t border-gray-200 dark:border-slate-800 text-center text-xs text-gray-400 dark:text-slate-500 font-mono">
          Relatório gerado em {new Date().toLocaleString('pt-BR')} • Gregório Jurídico
        </div>
      </div>
    </div>
  )
}
