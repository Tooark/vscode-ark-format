# Release shell1.0.14

## Notes in en-US

### Changes in this version

- Package version bumped from `1.0.13` to `1.0.14`.
- **Fix** ([#34](https://github.com/Tooark/vscode-ark-format/issues/34)): the formatter deleted every line following a line such as `x="$(echo '"Hello"' | tr -d '"')"`. Two defects combined:
  - The lexer treated single quotes inside a double-quoted `$(...)` command substitution as literal text. As a result, the double quotes inside them closed and reopened the outer string, and the line ended "inside single quotes". That is why the problem depended on parity: with an even number of identical lines, the quotes cancelled each other out.
  - The lines of a multi-line string were only written to the output when the string closed. If the file ended with the string still open, those lines were discarded.
- The lexer now treats `$(...)` inside double quotes as a new quoting context, as Bash does:
  - Single quotes, double quotes, `$'...'` and backticks inside the substitution open their own strings without closing the outer string.
  - The substitution closes at the matching `)`: parentheses inside quotes don't count, and nested `$((...))` is supported.
  - A backslash escapes the next character; `#` at the start of a word is a comment (`$#` and `${#var}` are not).
  - In heredocs declared inside the substitution (`"$(cat <<'EOF'`), quote tracking skips the body up to the delimiter: apostrophes and quotes in the body don't open strings. `<<` in arithmetic expansion and the here-string `<<<` are not treated as heredocs.
  - The state stays correct when the substitution spans several lines.
- **Fix**: escaped quotes outside strings (`it\'s`, `\"texto\"`, `case` patterns such as `(*\'*)`) opened a string by mistake, with the same effect: the rest of the file was deleted or left unformatted. The backslash now escapes the next character in regular code as well.
- **Fix**: the content of a multi-line string, including `"$(...)"` spanning several lines, is reindented as a block according to the level of the surrounding code. A heredoc declared inside `"$(...)"` in an indented block (function, `if`, etc.) also had its body and delimiter reindented, which changed the heredoc text and prevented Bash from recognizing the `<<EOF` delimiter — the script broke. The body and delimiter of these heredocs are now preserved exactly as in the original and don't affect the reindentation of the other lines in the block.
- **Fix**: heredoc detection in regular code (outside strings) rewritten on top of the same lexer:
  - The delimiter is now the whole word, with quotes and escapes removed, as in Bash: `<<END-MSG`, `<<END.txt`, `<<'END MSG'`, `<<E"O"F`, `<<\EOF` and `<<\/EOS`. Previously, delimiters with a hyphen or a dot were truncated (`END`) and the rest of the file was left unformatted; delimiters with a space, backslash or quotes in the middle were not recognized, so the heredoc body was formatted as code and the delimiter was reindented, which corrupted the content and broke the script.
  - The here-string `<<<`, the `<<` shift in arithmetic expressions (`$(( 1 << 2 ))`, `(( x << n ))`) and `<<` in comments are no longer treated as heredocs. Previously, they left the rest of the file unformatted.
- **Data-loss protection** (shared package): if a string stays open until the end of the file — because it really is open or because the quotes were misinterpreted — the pending lines are now preserved unchanged instead of discarded. The same protection applies to PowerShell (`powershell1.2.4`).
- Example `samples/example.bash`: the issue cases (including the `\042` variant and the repetitions), each followed by code to format, and a function with a heredoc inside `"$(...)"`. The example's process substitution was also fixed (`done < <(...)`; previously `done <(...)`, invalid syntax in Bash).
- Tests: regression cases with the issue line repeated 1, 2 and 3 times (also checking that the output is a fixed point), the `\042` variant, multi-line substitution, a heredoc with an apostrophe, heredocs (`<<` and `<<-`) inside `"$(...)"` in an indented block, here-strings and arithmetic in a multi-line substitution, escaped quotes outside strings, a string left open until the end of the file and selection formatting (with and without reindentation); lexer tests for nested contexts, parenthesis counting, escapes, comments, heredocs (`<<`, `<<-`, several on the same line), here-strings and arithmetic expansion.
- Additional validation with 53 real scripts (Git for Windows shell scripts and project examples): output identical to the previous version, except for 4 scripts. In 2 of them, which use escaped quotes outside strings, the formatter no longer loses lines (in `zgrep`, the previous version reduced 253 non-empty lines to 211) or interprets code as a string. In the other 2, which use `cat <<\/EOS`, the heredoc body is no longer reformatted and is now identical to the original. No output changes the content beyond whitespace, and all outputs are fixed points. The new block in `example.bash` was run in Bash before and after formatting, with the same output.
- The `shfmt` engine is not affected. No new configuration options.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.0.13` para `1.0.14`.
- **Correção** ([#34](https://github.com/Tooark/vscode-ark-format/issues/34)): o formatador apagava todas as linhas seguintes a uma linha como `x="$(echo '"Hello"' | tr -d '"')"`. Eram dois defeitos combinados:
  - O lexer tratava as aspas simples dentro de uma substituição de comando `$(...)` entre aspas duplas como texto literal. Com isso, as aspas duplas dentro delas fechavam e reabriam a string externa, e a linha terminava "dentro de aspas simples". Por isso o problema dependia da paridade: com um número par de linhas iguais, as aspas se compensavam.
  - As linhas de uma string multilinha só eram gravadas na saída quando a string fechava. Se o arquivo terminasse com a string aberta, essas linhas eram descartadas.
- O lexer passa a tratar `$(...)` dentro de aspas duplas como um novo contexto de aspas, como o Bash:
  - Aspas simples, aspas duplas, `$'...'` e crases dentro da substituição abrem strings próprias, sem fechar a string externa.
  - A substituição fecha no `)` correspondente: parênteses entre aspas não contam, e `$((...))` aninhado é suportado.
  - Barra invertida escapa o próximo caractere; `#` no início de uma palavra é comentário (`$#` e `${#var}` não são).
  - Em heredocs declarados dentro da substituição (`"$(cat <<'EOF'`), o rastreamento de aspas ignora o corpo até o delimitador: apóstrofos e aspas no corpo não abrem strings. `<<` em expansão aritmética e o here-string `<<<` não são tratados como heredoc.
  - O estado continua correto quando a substituição ocupa várias linhas.
- **Correção**: aspas escapadas fora de strings (`it\'s`, `\"texto\"`, padrões de `case` como `(*\'*)`) abriam uma string por engano, com o mesmo efeito de apagar ou deixar de formatar o restante do arquivo. A barra invertida passa a escapar o próximo caractere também no código normal.
- **Correção**: o conteúdo de uma string multilinha, incluindo `"$(...)"` em várias linhas, é reindentado como bloco conforme o nível do código ao redor. Um heredoc declarado dentro de `"$(...)"` em um bloco indentado (função, `if` etc.) também tinha o corpo e o delimitador reindentados, o que alterava o texto do heredoc e impedia o Bash de reconhecer o delimitador de `<<EOF` — o script quebrava. O corpo e o delimitador desses heredocs passam a ser preservados exatamente como no original e não influenciam a reindentação das demais linhas do bloco.
- **Correção**: detecção de heredoc no código normal (fora de strings) reescrita sobre o mesmo lexer:
  - O delimitador passa a ser a palavra inteira, com remoção de aspas e escapes, como no Bash: `<<END-MSG`, `<<END.txt`, `<<'END MSG'`, `<<E"O"F`, `<<\EOF` e `<<\/EOS`. Antes, delimitadores com hífen ou ponto eram truncados (`END`) e o restante do arquivo ficava sem formatar; delimitadores com espaço, barra invertida ou aspas no meio não eram reconhecidos, então o corpo do heredoc era formatado como código e o delimitador era reindentado, o que corrompia o conteúdo e quebrava o script.
  - O here-string `<<<`, o deslocamento `<<` em expressões aritméticas (`$(( 1 << 2 ))`, `(( x << n ))`) e `<<` em comentários deixam de ser tratados como heredoc. Antes, deixavam o restante do arquivo sem formatar.
- **Proteção contra perda de dados** (pacote compartilhado): se uma string continuar aberta até o fim do arquivo — porque está realmente aberta ou por uma interpretação incorreta das aspas —, as linhas pendentes passam a ser preservadas sem alterações em vez de descartadas. A mesma proteção vale para o PowerShell (`powershell1.2.4`).
- Exemplo `samples/example.bash`: casos da issue (incluindo a variante com `\042` e as repetições), cada um seguido de código a formatar, e uma função com heredoc dentro de `"$(...)"`. Também foi corrigida a substituição de processo do exemplo (`done < <(...)`; antes `done <(...)`, sintaxe inválida no Bash).
- Testes: casos de regressão com a linha da issue repetida 1, 2 e 3 vezes (verificando também que a saída é ponto fixo), a variante com `\042`, substituição multilinha, heredoc com apóstrofo, heredoc (`<<` e `<<-`) dentro de `"$(...)"` em bloco indentado, here-strings e aritmética em substituição multilinha, aspas escapadas fora de strings, string aberta até o fim do arquivo e formatação de seleção (com e sem reindentação); testes do lexer para contextos aninhados, contagem de parênteses, escapes, comentários, heredocs (`<<`, `<<-`, vários na mesma linha), here-strings e expansão aritmética.
- Validação adicional com 53 scripts reais (scripts shell do Git for Windows e exemplos do projeto): saída idêntica à versão anterior, exceto em 4 scripts. Em 2 deles, que usam aspas escapadas fora de strings, o formatador deixou de perder linhas (no `zgrep`, a versão anterior reduzia 253 linhas não vazias a 211) e de interpretar código como string. Nos outros 2, que usam `cat <<\/EOS`, o corpo do heredoc deixou de ser reformatado e passou a ser idêntico ao original. Nenhuma saída altera o conteúdo além de espaços em branco, e todas são ponto fixo. O bloco novo do `example.bash` foi executado no Bash antes e depois da formatação, com a mesma saída.
- O engine `shfmt` não é afetado. Sem novas opções de configuração.

## Additional Information / Informações Adicionais

- Tag: `shell1.0.14`
- Release date / Data de lançamento: **2026-11-16**
