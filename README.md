# Gregório Jurídico — Sistema de Prazos, Audiências e Tarefas

Sistema SaaS frontend moderno, rápido e objetivo para controle de rotina jurídica forense, desenhado sob uma **arquitetura Multi-Tenant Whitelabel**.

---

## 🎯 Por que esta arquitetura é altamente vendável?

Ao invés de programar um sistema novo para cada escritório de advocacia:
1. **Multi-Escritório Integrado (Multi-Tenant):** Estrutura modular para atender diferentes bancas de advocacia (ex: *Gregório & Associados*, *Ferreira, Costa & Prado*, ou novos escritórios cadastrados).
2. **Dados e Identidade Isolados:** Cada escritório tem seus próprios advogados, OAB, monograma, áreas de atuação (Cível, Trabalhista, Tributário, etc.), prazos, audiências, tarefas e arquivos.
3. **Backup & Migração Portátil:** Cada escritório pode exportar e restaurar seus dados em formato JSON em segundos, facilitando migração e demonstrações de vendas.
4. **Sem Curva de Aprendizado:** Interface editorial minimalista (baseada nos princípios de Emil Kowalski e Impeccable), com dados tabulares, cores pastéis para status e foco total na rotina do advogado.

---

## ⚖️ Módulos e Recursos

### 1. Autenticação e Gestão de Acessos em 2 Etapas
- **Passo 1 (Identificação do Escritório):** O usuário seleciona ou insere a identificação da banca.
- **Passo 2 (Autenticação do Advogado):** Seleção do profissional e senha individual com perfil (Sócio, Associado, Audiencista, Estagiário).
- **Recuperação de Senha & Edição de Perfil:** Modal completo para atualização de dados do advogado (nome, email, telefone, OAB, bio) e alteração segura de senha.
- **Acesso Rápido de Demonstração:** Botões de preenchimento rápido para demonstrações comerciais imediatas.

### 2. Upload e Download Real de Arquivos (PDF / DOCX)
- Upload real com validação de extensão e tipo de arquivo (.pdf, .docx, .doc).
- Armazenamento em base64/Blob local com geração de link de download nativo do navegador.
- **Prazos:** Anexo do PDF da publicação/intimação e protocolo de cumprimento.
- **Audiências:** Anexo de atas anteriores, termos de assentada e documentos de preparação.
- **Tarefas:** Upload de minutas em DOCX e peças para revisão.

### 3. Copiloto de Inteligência Artificial Integrado
- **Análise Inteligente de Intimações (Prazos):** Botão *"Analisar Intimação com IA"* que lê o texto ou recorte da publicação e preenche automaticamente tipo de prazo, dias úteis, artigo legal e tribunal.
- **Briefing do Audiencista (Audiências):** Card expansível que sintetiza a audiência em 3 tópicos estratégicos diretos:
  1. *Tese do Autor*
  2. *Contraponto do Réu*
  3. *Pontos Controvertidos a Instruir*
- **Sugerir Checklist Procedural (Tarefas):** IA que sugere passos práticos e cronológicos de conferência antes da finalização da peça jurídica.

### 4. Gestor de Prazos Processuais
- Formatação automática de número CNJ (`0000000-00.0000.0.00.0000`) com detecção automática de tribunal e ramo da justiça.
- Contagem regressiva de urgência:
  - **Vence Hoje (Crítico)**
  - **Urgente (≤ 3 dias)**
  - **Esta Semana (≤ 7 dias)**
  - **No Prazo / Em Andamento**
  - **Protocolado / Cumprido**
- Cópia com 1 clique do número do processo e link direto para consulta no tribunal.

### 5. Pauta e Gestão de Audiências
- Gestão de audiências **Telepresenciais (Virtuais)** e **Presenciais (Fóruns)**.
- **Acesso em 1 clique à Sala Virtual:** Links integrados (Teams, Zoom, Google Meet).
- Controle de testemunhas, prepostos, notas estratégicas e propostas de acordo.
- Status: *Confirmada*, *Em Preparação*, *Realizada*, *Redesignada*.

### 6. Quadro de Tarefas (Workflow Operacional)
- **Modo Duplo:** Alternador instantâneo entre **Quadro Kanban** (A Fazer → Em Andamento → Em Revisão → Concluído) e **Lista Rápida (Checklist)**.
- Atribuição por advogado e priorização por criticidade (P1 Urgente até P4 Baixa).

### 7. Pauta do Dia (Modo Impressão / PDF)
- Gera papel timbrado oficial da banca para levar para o fórum ou distribuir na reunião matinal da equipe com todas as audiências e prazos do dia.

### 8. Modo Claro e Modo Escuro (Dark Mode)
- **Alternador de Tema (Ícone Sol / Lua no Cabeçalho):** Permite alternar instantaneamente entre o **Modo Claro** e o **Modo Escuro (Dark Mode)**, com persistência no navegador.
- **Tipografia Ampliada e Confortável:** Tamanhos de fonte otimizados em toda a aplicação para garantir legibilidade sem cansaço visual.

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

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (rodando em http://127.0.0.1:3000)
npm run dev

# Compilar versão de produção
npm run build
```

O sistema já está em execução local no endereço:
**[http://127.0.0.1:3000](http://127.0.0.1:3000)**
