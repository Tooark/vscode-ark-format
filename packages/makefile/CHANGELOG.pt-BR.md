# Changelog

Todas as mudanças relevantes do pacote `ark-format-makefile` estão documentadas aqui.

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](https://github.com/Tooark/vscode-ark-format/blob/main/packages/makefile/CHANGELOG.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

## 1.0.3 - 2026-11-22

- Versão do pacote atualizada de `1.0.2` para `1.0.3`.
- Correção: o texto dentro de referências (`$(...)`, `${...}`) nunca é alterado. Um `:` dentro de uma chamada de função ou de uma referência de substituição era lido como separador de alvo (`$(MODULES:%=test_%):` virava `$(MODULES: %=test_%):`, o que quebra a regra, e `$(info ver http://host)` virava `http: //host`), e os espaços dentro de `$(info a   b)` eram colapsados.
- Correção: o `#` dentro de uma referência não é comentário (`$(shell grep -c '^#' file)`, `$(subst #,,$(X))`). Um espaço era inserido depois dele, o que alterava o comando ou o argumento.
- Correção: em uma atribuição, o espaçamento entre o valor e um comentário inline é mantido exatamente, porque o make inclui esses espaços no valor. `DIR := /usr#nota` virava `DIR := /usr # nota`, mudando o valor de `/usr` para `/usr` mais um espaço no fim.
- Correção: os argumentos de `ifeq`/`ifneq` são mantidos como escritos; os espaços repetidos dentro deles eram colapsados, o que muda a comparação.
- Correção: `export define`, `private define` e prefixos combinados são reconhecidos, e blocos `define` aninhados são preservados até o `endef` externo. Antes, o corpo era reformatado.
- Correção: uma linha formada só por uma chamada de função (`$(eval ...)`, `$(call ...)`, `$(foreach ...)`) escrita depois de uma regra não recebe mais um TAB, que a transformava em linha de recipe.
- Correção: `endif` e `else` seguidos de comentário sem espaço (`endif# fim`) são reconhecidos.
- Correção: a letra de unidade do Windows não é separador de alvo (`C:/out/a.o: a.c` virava `C: /out/a.o: a.c`).
- README: documenta as garantias para referências, comentários inline em atribuições e `define` aninhado.
- Exemplo `samples/example.complex.mk` com esses casos.
- Novos testes de regressão para os formatadores de documento e de seleção, o lexer, o espaçamento e o contexto da seleção.
- Detalhes: [notes/makefile1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.3.md)

## 1.0.2 - 2026-11-18

- Versão do pacote atualizada de `1.0.1` para `1.0.2`.
- Changelog em inglês ([#24](https://github.com/Tooark/vscode-ark-format/discussions/24)): o `CHANGELOG.md`, arquivo exibido no Marketplace, passa a ser em inglês, e a versão em português foi movida para `CHANGELOG.pt-BR.md`, com seletor de idioma nos dois arquivos, como no README.
- Notas de release em `notes/` passam a ser bilíngues (inglês e português), incluindo as das versões anteriores.
- Sem alterações funcionais no motor de formatação.
- Detalhes: [notes/makefile1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/makefile1.0.2.md)

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
