# Gregório Jurídico — Sistema de Prazos, Audiências e Tarefas

Sistema frontend moderno, rápido e objetivo para controle de rotina jurídica forense, desenhado sob uma **arquitetura Multi-Tenant Whitelabel**.

---

## 🎯 Por que esta arquitetura é altamente vendável?

Ao invés de programar um sistema novo para cada escritório de advocacia:
1. **Multi-Escritório Integrado (Workspace Switcher):** Você pode alternar ou cadastrar novos escritórios clientes em 1 clique (ex: *Gregório & Associados*, *Ferreira, Costa & Prado*, ou cadastrar novas bancas).
2. **Dados e Identidade Isolados:** Cada escritório tem seus próprios advogados, OAB, monograma, áreas de atuação (Cível, Trabalhista, Tributário, etc.), prazos, audiências e tarefas.
3. **Backup & Migração Portátil:** Cada escritório pode exportar e restaurar seus dados em formato JSON em segundos, facilitando migração e demonstrações de vendas.
4. **Sem Curva de Aprendizado:** Interface editorial minimalista (baseada nos princípios de Emil Kowalski e Impeccable), com dados tabulares, cores pastéis para status e foco total na rotina do advogado.

---

## ⚖️ Módulos Principais

### 1. Painel de Urgências e Visão Geral
- **O que resolver hoje:** resumo imediato de prazos com vencimento em menos de 24h e audiências marcadas.
- **Distribuição da equipe:** acompanhamento de carga de trabalho por advogado da banca.
- **Ações imediatas:** protocolar prazos ou ingressar em audiências direto pelo painel.

### 2. Prazos Processuais
- Formatação automática de número CNJ (`0000000-00.0000.0.00.0000`) com detecção de tribunal.
- Contagem regressiva de urgência:
  - **Vence Hoje (Crítico)**
  - **Urgente (&le; 3 dias)**
  - **Esta Semana (&le; 7 dias)**
  - **No Prazo / Em Andamento**
  - **Protocolado / Cumprido**
- Botão de cópia rápida do número do processo para a área de transferência.
- Link direto para consulta no tribunal (PJe, e-SAJ, etc.).

### 3. Pauta de Audiências
- Gestão de audiências **Telepresenciais (Virtuais)** e **Presenciais (Fóruns)**.
- **Acesso em 1 clique à Sala Virtual:** links diretos integrados (Teams, Zoom, Google Meet).
- Controle de testemunhas, prepostos e notas estratégicas para audiência e propostas de acordo.
- Status: Confirmada, Em Preparação, Realizada, Redesignada.

### 4. Quadro de Tarefas (Workflow Operacional)
- **Modo Duplo:** Alternador instantâneo entre **Quadro Kanban** (A Fazer &rarr; Em Andamento &rarr; Em Revisão &rarr; Concluído) e **Lista Rápida (Checklist)**.
- Atribuição por advogado e priorização por criticidade (P1 Urgente até P4 Baixa).

### 5. Pauta do Dia (Modo Impressão / PDF)
- Gera papel timbrado oficial da banca para levar para o fórum ou distribuir na reunião matinal da equipe com todas as audiências e prazos do dia.

### 6. Modo Claro e Modo Escuro (Dark Mode)
- **Alternador de Tema (Ícone Sol / Lua no Cabeçalho):** Permite alternar instantaneamente entre o **Modo Claro** e o **Modo Escuro (Dark Mode)**, com persistência no navegador.
- **Tipografia Ampliada e Confortável:** Tamanhos de fonte aumentados em toda a aplicação (títulos, números de processo CNJ, badges de urgência e formulários) para garantir legibilidade sem cansaço visual.

---

## ⌨️ Atalhos de Teclado (Power User)

- `Ctrl + K` (ou `Cmd + K`): Barra de busca global de processos, clientes e ações.
- `1`: Ir para Visão Geral.
- `2`: Ir para Prazos.
- `3`: Ir para Audiências.
- `4`: Ir para Tarefas.
- `N`: Cadastrar novo prazo imediatamente.
- `ESC`: Fechar qualquer modal ou janela de busca.

---

## 🚀 Como Executar

```bash
cd C:\gregorio

# Instalar dependências (já realizado)
npm install

# Iniciar servidor de desenvolvimento (já rodando na porta 3000)
npm run dev

# Compilar versão de produção
npm run build
```

O sistema já está em execução no endereço:
**[http://127.0.0.1:3000](http://127.0.0.1:3000)**
