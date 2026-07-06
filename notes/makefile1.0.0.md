# Release makefile1.0.0

## Alterações desta versão

- Versão inicial do pacote `ark-format-makefile` (`1.0.0`), seguindo a estrutura das extensões Shell e PowerShell e reutilizando o pacote `@tooark/ark-format-shared` (config, editorConfig, document e types).
- Formatação de documento completo e de seleção (range formatting), com cálculo da profundidade base de condicionais a partir do contexto do documento.
- Invariantes de segurança:
  - Linhas de recipe (prefixadas com TAB) nunca têm o corpo alterado.
  - Blocos `define ... endef` preservados sem alterações.
  - Continuações de linha (`\`) preservadas.
  - Preservação integral do documento quando `.RECIPEPREFIX` é redefinido.
- Regras de espaçamento: operadores de atribuição (`=`, `:=`, `::=`, `?=`, `+=`, `!=`), separador de alvos (`:`/`::`), palavras-chave condicionais (`ifeq (`) e marcador de comentário (`#`/`##`).
- Alinhamento de continuações de linha (`\`) de atribuições com o início do valor da primeira linha.
- Alinhamento vertical opcional dos operadores de atribuição em blocos contíguos de variáveis (`alignAssignments`, desligado por padrão para evitar ruído de diff; preenchimento sempre com espaços, nunca TAB).
- Indentação configurável de blocos condicionais usando espaços (TAB nunca é usado por ter significado próprio em Makefiles).
- Normalização opcional do prefixo de recipe: recipes indentadas com espaços recebem o TAB obrigatório (apenas quando o conteúdo não é sintaxe de Makefile) e whitespace inicial excessivo (múltiplos TABs ou misturas) é reduzido para exatamente 1 TAB, preservando a indentação interna de continuações.
- Limpeza configurável: espaços finais, linhas em branco consecutivas, linhas em branco iniciais, nova linha final e estilo de fim de linha (LF/CRLF/Auto).
- Suporte opcional a `.editorconfig`, localização EN/PT-BR e amostras em `samples/`.
- Testes de unidade do formatador e da camada de extensão (ativação, providers e cálculo da profundidade de condicionais, ignorando recipes e blocos `define`), integrados à cobertura consolidada do monorepo.
- Seção de apoio (Support) nos READMEs (EN/PT-BR).

## Informações Adicionais

- Tag relacionada: `makefile1.0.0`
- Data de lançamento: **2026-07-05**
