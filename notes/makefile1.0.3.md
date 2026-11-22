# Release makefile1.0.3

## Notes in en-US

### Changes in this version

- Package version bumped from `1.0.2` to `1.0.3`.
- These fixes come from an audit of the Makefile formatter for the same family of defects fixed in the Shell formatter for [#39](https://github.com/Tooark/vscode-ark-format/issues/39): ordinary text read as an operator, a separator or a comment. Each rule below was checked against GNU Make 4.4.1.
- **Fix**: text inside references is never changed. A reference is a function call or a variable reference (`$(...)`, `${...}`), and everything inside it is an argument, not line syntax. The line is now classified and spaced with the references masked.
  - A `:` inside a reference was read as a target separator. `$(MODULES:%=test_%): test_%:` became `$(MODULES: %=test_%): test_%:`, and make then fails with "target doesn't match the target pattern". `$(info see http://example.com/a)` became `http: //example.com/a`, and `$(eval $(call tmpl,a,b:c))` became `b: c`.
  - A top-level call such as `$(warning "missing: tool")` inside a conditional was treated as a target and, in some contexts, rewritten as a recipe line.
  - Spaces inside a reference were collapsed: `$(info a   b)` printed `a b`.
  - An `=` or `:=` inside a reference is no longer taken as the assignment operator when spacing or aligning assignments.
- **Fix**: `#` inside a reference is literal, not a comment. `N := $(shell grep -c '^#' file)` became `'^ # ' file)`, which changes the pattern, and `$(subst #,,$(Y))` became `$(subst # ,,$(Y))`. A `#` outside references still starts a comment, and `\#` is still literal.
- **Fix**: on an assignment, the spacing between the value and an inline comment is kept exactly. Make includes the spaces before the `#` in the value: `DIR := /usr#note` is `/usr`, `DIR := /usr # note` is `/usr` followed by one space and `DIR := /usr    # note` is `/usr` followed by four spaces. The formatter used to rewrite all three with a single space, which changes the value (for example in `$(DIR)/bin`). When the assignment has no value, and on every other kind of line, a single space is still used. The space after the `#` marker is still inserted.
- **Fix**: the arguments of `ifeq` and `ifneq` are kept as written. Spaces inside them are part of the comparison (`ifeq (a  b,a b)` is false, and so is `ifeq ( a,a)`), but repeated spaces were collapsed. Only the keyword is normalized: `ifeq(` becomes `ifeq (` and `else   ifeq` becomes `else ifeq`.
- **Fix**: `define` blocks.
  - `export define`, `private define` and combined prefixes (`override export define`) are recognized. Previously only `override define` was, so the body of the others was reformatted: indentation removed and spaces collapsed.
  - Nested `define` blocks are preserved up to the outer `endef`. Previously the block ended at the first `endef` and the rest of the body was formatted as code.
  - Inside a body the formatter follows make exactly: only a `define` without prefixes opens a nested block (`override define X` is body text), only an `endef` followed by a space or the end of the line closes one (`endef# note` is body text), and a line with the recipe prefix (TAB) is never a directive.
- **Fix**: a line that is only a function call (`$(eval $(call rule,x))`, `$(foreach ...)`, `$(info ...)`) written after a rule is no longer given a TAB. Blank lines and comments do not end the recipe context, so `$(eval X := 1)` or `$(call setup)` at column 0 after a recipe was treated as a command missing its TAB and moved into the recipe, where make no longer evaluates it while reading the file. Commands that are missing the TAB (`$(CC) -o x x.c`, `$(MAKE)`) are still converted. A function call on its own line inside a recipe indented with spaces is no longer converted either.
- **Fix**: `endif` and `else` followed by a comment with no space (`endif# done`) are recognized. Previously the conditional was never closed and the rest of the file stayed indented.
- **Fix**: a Windows drive letter is not a target separator. `C:/out/a.o: a.c` became `C: /out/a.o: a.c`. A single letter at the start of a word followed by `:/` or `:\` is read as a drive.
- README: the "Makefile-aware" section now documents references, inline comments on assignments and nested `define`.
- Example `samples/example.complex.mk`: `$(shell ...)` and `$(subst ...)` with `#`, values with and without spaces before the comment, `$(info ...)` with a URL, `$(eval $(call ...))` with `:`, `ifeq` with spaces in an argument, `endif# ...`, `export define` with a nested `define`, and a static pattern rule on a substitution reference.
- Tests: function calls with `:`, `=`, `#` and spaces, substitution references as targets, calls inside conditionals, drive letters, literal `#`, the spacing before inline comments (none, one space, several, a TAB), `ifeq`/`ifneq` arguments, glued comments, `define` with each prefix and nested (including the lines make treats as body text), function calls after a rule, alignment with references that contain operators, the selection formatter and the selection context.
- Validation with 282 real Makefiles (the Go module cache, Git, the Makefiles shipped in a Linux distribution and the project examples), comparing the database that GNU Make 4.4.1 builds (`make -pn`) for each original and its formatted output. Variable values are compared exactly; rules and recipes are compared ignoring whitespace, which the formatter normalizes on purpose. No command is executed during the comparison.
  - Makefiles whose meaning the formatter changed went from 15 to 10.
  - The 5 fixed: `cloudflare/circl` (two versions), where `OPTS += -v              # Be verbose` lost the spaces of the value; `grpc-ecosystem/go-grpc-middleware` (two versions), where `$(MODULES:%=test_module_%):` was broken and make reported errors; and `spf13/cobra`, where a `$(warning ...)` with a `:` became a recipe line.
  - The 10 remaining already happened before this version and are by design: 5 have trailing spaces at the end of a value, removed by `trimTrailingWhitespace`; 4 are the project examples, written with invalid spacing on purpose (the formatter fixes them); 1 has a recipe continuation line whose leading spaces become a TAB.
  - 6 Makefiles changed compared with the previous version: the 5 above and `sergi/go-diff`, where `$(eval $(ARGS):;@:)` is now kept as written. All outputs are fixed points.
  - The same comparison with `alignAssignments` enabled gives the same result (15 before, the same 10 after).
  - The new block in `example.complex.mk` produces the same database before and after formatting.
- No new configuration options.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.0.2` para `1.0.3`.
- Estas correções vêm de uma auditoria do formatador Makefile atrás da mesma família de defeitos corrigida no formatador Shell para a [#39](https://github.com/Tooark/vscode-ark-format/issues/39): texto comum lido como operador, separador ou comentário. Cada regra abaixo foi conferida no GNU Make 4.4.1.
- **Correção**: o texto dentro de referências nunca é alterado. Uma referência é uma chamada de função ou uma referência a variável (`$(...)`, `${...}`), e tudo dentro dela é argumento, não sintaxe da linha. A linha passa a ser classificada e espaçada com as referências mascaradas.
  - Um `:` dentro de uma referência era lido como separador de alvo. `$(MODULES:%=test_%): test_%:` virava `$(MODULES: %=test_%): test_%:`, e o make passa a falhar com "target doesn't match the target pattern". `$(info ver http://example.com/a)` virava `http: //example.com/a`, e `$(eval $(call tmpl,a,b:c))` virava `b: c`.
  - Uma chamada no nível superior, como `$(warning "faltou: tool")` dentro de uma condicional, era tratada como alvo e, em alguns contextos, reescrita como linha de recipe.
  - Os espaços dentro de uma referência eram colapsados: `$(info a   b)` imprimia `a b`.
  - Um `=` ou `:=` dentro de uma referência não é mais tomado como o operador de atribuição ao espaçar ou alinhar atribuições.
- **Correção**: o `#` dentro de uma referência é literal, não comentário. `N := $(shell grep -c '^#' file)` virava `'^ # ' file)`, o que muda o padrão, e `$(subst #,,$(Y))` virava `$(subst # ,,$(Y))`. O `#` fora de referências continua iniciando comentário, e `\#` continua literal.
- **Correção**: em uma atribuição, o espaçamento entre o valor e um comentário inline é mantido exatamente. O make inclui no valor os espaços antes do `#`: `DIR := /usr#nota` vale `/usr`, `DIR := /usr # nota` vale `/usr` seguido de um espaço e `DIR := /usr    # nota` vale `/usr` seguido de quatro espaços. O formatador reescrevia os três com um único espaço, o que muda o valor (por exemplo em `$(DIR)/bin`). Quando a atribuição não tem valor, e em todos os outros tipos de linha, continua sendo usado um único espaço. O espaço depois do marcador `#` continua sendo inserido.
- **Correção**: os argumentos de `ifeq` e `ifneq` são mantidos como escritos. Os espaços dentro deles fazem parte da comparação (`ifeq (a  b,a b)` é falso, assim como `ifeq ( a,a)`), mas os espaços repetidos eram colapsados. Só a palavra-chave é normalizada: `ifeq(` vira `ifeq (` e `else   ifeq` vira `else ifeq`.
- **Correção**: blocos `define`.
  - `export define`, `private define` e prefixos combinados (`override export define`) são reconhecidos. Antes só `override define` era, então o corpo dos demais era reformatado: a indentação era removida e os espaços, colapsados.
  - Blocos `define` aninhados são preservados até o `endef` externo. Antes o bloco terminava no primeiro `endef` e o restante do corpo era formatado como código.
  - Dentro do corpo o formatador segue exatamente o make: só um `define` sem prefixos abre um bloco aninhado (`override define X` é texto do corpo), só um `endef` seguido de espaço ou do fim da linha fecha um (`endef# nota` é texto do corpo), e uma linha com o prefixo de recipe (TAB) nunca é diretiva.
- **Correção**: uma linha formada só por uma chamada de função (`$(eval $(call regra,x))`, `$(foreach ...)`, `$(info ...)`) escrita depois de uma regra não recebe mais um TAB. Linhas em branco e comentários não encerram o contexto de recipe, então `$(eval X := 1)` ou `$(call setup)` na coluna 0 depois de uma recipe era tratada como comando sem TAB e movida para a recipe, onde o make deixa de avaliá-la na leitura do arquivo. Comandos aos quais falta o TAB (`$(CC) -o x x.c`, `$(MAKE)`) continuam sendo convertidos. Uma chamada de função sozinha na linha dentro de uma recipe indentada com espaços também deixa de ser convertida.
- **Correção**: `endif` e `else` seguidos de comentário sem espaço (`endif# fim`) são reconhecidos. Antes a condicional nunca era fechada e o restante do arquivo ficava indentado.
- **Correção**: a letra de unidade do Windows não é separador de alvo. `C:/out/a.o: a.c` virava `C: /out/a.o: a.c`. Uma única letra no início de uma palavra seguida de `:/` ou `:\` é lida como unidade.
- README: a seção sobre o comportamento específico de Makefile passa a documentar referências, comentários inline em atribuições e `define` aninhado.
- Exemplo `samples/example.complex.mk`: `$(shell ...)` e `$(subst ...)` com `#`, valores com e sem espaços antes do comentário, `$(info ...)` com URL, `$(eval $(call ...))` com `:`, `ifeq` com espaços em um argumento, `endif# ...`, `export define` com um `define` aninhado e uma regra de padrão estático sobre uma referência de substituição.
- Testes: chamadas de função com `:`, `=`, `#` e espaços, referências de substituição como alvos, chamadas dentro de condicionais, letras de unidade, `#` literal, o espaçamento antes de comentários inline (nenhum, um espaço, vários, um TAB), argumentos de `ifeq`/`ifneq`, comentários colados, `define` com cada prefixo e aninhado (incluindo as linhas que o make trata como texto do corpo), chamadas de função depois de uma regra, alinhamento com referências que contêm operadores, o formatador de seleção e o contexto da seleção.
- Validação com 282 Makefiles reais (o cache de módulos do Go, o Git, os Makefiles que acompanham uma distribuição Linux e os exemplos do projeto), comparando o banco de dados que o GNU Make 4.4.1 monta (`make -pn`) para cada original e para a saída formatada. Os valores de variáveis são comparados exatamente; regras e recipes são comparadas ignorando espaços em branco, que o formatador normaliza de propósito. Nenhum comando é executado durante a comparação.
  - Os Makefiles cujo significado o formatador alterava caíram de 15 para 10.
  - Os 5 corrigidos: `cloudflare/circl` (duas versões), em que `OPTS += -v              # Be verbose` perdia os espaços do valor; `grpc-ecosystem/go-grpc-middleware` (duas versões), em que `$(MODULES:%=test_module_%):` era quebrado e o make reportava erros; e `spf13/cobra`, em que um `$(warning ...)` com `:` virava linha de recipe.
  - Os 10 restantes já aconteciam antes desta versão e são por projeto: 5 têm espaços no fim de um valor, removidos por `trimTrailingWhitespace`; 4 são os exemplos do projeto, escritos de propósito com espaçamento inválido (o formatador os corrige); 1 tem uma linha de continuação de recipe cujos espaços iniciais viram um TAB.
  - 6 Makefiles mudaram em relação à versão anterior: os 5 acima e o `sergi/go-diff`, em que `$(eval $(ARGS):;@:)` passa a ser mantido como escrito. Todas as saídas são ponto fixo.
  - A mesma comparação com `alignAssignments` habilitado dá o mesmo resultado (15 antes, os mesmos 10 depois).
  - O bloco novo do `example.complex.mk` produz o mesmo banco de dados antes e depois da formatação.
- Sem novas opções de configuração.

## Additional Information / Informações Adicionais

- Tag: `makefile1.0.3`
- Release date / Data de lançamento: **2026-11-22**
