# Changelog

Todas as mudanças relevantes do pacote `ark-format-makefile` estão documentadas aqui.

## 1.0.1 - 2026-07-06

- Versão do pacote atualizada de `1.0.0` para `1.0.1`.
- Campo `sponsor` adicionado ao manifesto da extensão, habilitando o botão de apoio (GitHub Sponsors) na página do Marketplace.
- GIFs de demonstração do README regenerados (`makefile-settings.gif` e `makefile-using.gif`) com capturas atualizadas e maior qualidade.
- Sem alterações funcionais no motor de formatação.
- Detalhes: [notes/makefile1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.1.md)

## 1.0.0 - 2026-07-05

- Versão inicial do formatador de Makefile, seguindo a estrutura das extensões Shell e PowerShell.
- Formatação de documento completo e de seleção (range formatting), com cálculo de contexto do documento.
- Invariantes de segurança: prefixo TAB de recipes preservado, blocos `define ... endef` intocados, continuações de linha (`\`) preservadas e preservação integral quando `.RECIPEPREFIX` é redefinido.
- Regras de espaçamento: operadores de atribuição (`=`, `:=`, `::=`, `?=`, `+=`, `!=`), separador de alvos (`:`/`::`), palavras-chave condicionais (`ifeq (`) e marcador de comentário (`#`/`##`).
- Alinhamento de continuações de linha (`\`) de atribuições com o início do valor da primeira linha.
- Alinhamento vertical opcional dos operadores de atribuição em blocos contíguos de variáveis (`alignAssignments`, desligado por padrão para evitar ruído de diff).
- Indentação configurável de blocos condicionais (`ifeq`/`ifneq`/`ifdef`/`ifndef` ... `else` ... `endif`) usando espaços.
- Normalização opcional do prefixo de recipe: recipes indentadas com espaços recebem o TAB obrigatório (apenas quando o conteúdo não é sintaxe de Makefile) e whitespace inicial excessivo (múltiplos TABs ou misturas) é reduzido para exatamente 1 TAB, preservando a indentação interna de continuações.
- Limpeza configurável: espaços finais, linhas em branco consecutivas, linhas em branco iniciais, nova linha final e estilo de fim de linha (LF/CRLF/Auto).
- Suporte opcional a `.editorconfig` e localização EN/PT-BR.
- Testes de unidade do formatador e da camada de extensão (ativação, providers e cálculo da profundidade de condicionais, ignorando recipes e blocos `define`), integrados à cobertura consolidada do monorepo.
- Seção de apoio (Support) nos READMEs (EN/PT-BR).
- Detalhes: [notes/makefile1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.0.md)
