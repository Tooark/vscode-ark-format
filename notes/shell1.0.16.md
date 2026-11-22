# Release shell1.0.16

## Notes in en-US

### Changes in this version

- Package version bumped from `1.0.15` to `1.0.16`.
- **Fix** ([#39](https://github.com/Tooark/vscode-ark-format/issues/39)): two defects in the script from the issue shifted the indentation, and they cancelled each other out, which is why the end of the file looked right again:
  - `${#var}` at the end of a line, such as `CURSOR=${#BUFFER}`, was read as `{` followed by a comment, so it opened a block and everything after it gained one level. An inline comment is now only recognized when there is whitespace before the `#`; `f() { # comment` still opens a block.
  - `end-of-line` in a `for ... in \` list was read as the tcsh `end` keyword and closed a block. Keywords were detected with the regex `\b`, which treats `-`, `=` and `.` as the end of a word.
- **Fix**: keywords are now delimited as shell words, which only end at whitespace or at a metacharacter (`;&|()<>`). This covers every block keyword (`if`, `elif`, `else`, `fi`, `then`, `do`, `done`, `case`, `in`, `esac`, and the tcsh `while`, `foreach`, `end`, `endif`, `switch`, `endsw`, `breaksw`). The same defect affected much more common code:
  - `end=5`, `done=1`, `done-task`, `fi-tool`, `else-x` and `end.sh` closed a block.
  - `echo foo-then`, `echo foo-do`, `to-do`, `while-x`, `switch-user` and `case-x in` opened a block.
  - Unspaced input that the spacing rules fix afterwards is still recognized: `if[ -f a ];then`, `for x in a b;do`, `done<file`, `done|sort`, `done)`, `fi;`.
- **Fix**: a line in the middle of a continued command (it follows a continuation and also ends in one, as `end \` or `done \` in a list) is an argument and no longer closes a block.
- **Fix**: after `$#` or `${#var}`, the rest of the line was treated as a comment. Two effects:
  - The spacing rules were applied inside a string that followed: `echo $# "a   b"` became `echo $# "a b"`, which changes what the script prints.
  - A multi-line string opened after it was not tracked, so its following lines were formatted as code.
  - `#` only starts a comment at the beginning of a word, as in Bash. `$#`, `${#var}`, `${var#prefix}` and `a#b` are not comments.
- **Fix**: `while` loops without `do` at the end of the line:
  - With `do` on the next line (`while read -r x` / `do`), the `while` rule (needed for tcsh, where `while (expr)` has no `do`) and the `do` rule each added a level, and only one was removed at `done`: the rest of the file stayed shifted. The `do` now stays at the level of the `while`. Blank lines and full-line comments between them are accepted.
  - A loop closed on its own line, such as `while read -r l; do echo "$l"; done < file`, opened a block that was never closed. It no longer opens a block; `while ...; do cmd` with the body continuing on the next lines still does.
  - `for` and `until` were not affected.
- **Fix**: the text of an inline comment took part in the indentation decisions. A comment ending in `do`, `then` or `{` (`exit 0 # nothing to do`) opened a block; one ending in `;;` closed a `case` branch; one ending in `|`, `&&`, `||` or `\` (`x=1 # C:\`) started a line continuation. The comment is now ignored for indentation; full-line comments and the code before the comment keep working as before. For this purpose a `#` only counts as a comment at the start of the line or after whitespace, so zsh glob flags and operators such as `(#b)`, `*(#qN)` and `(*/)#` are still read as code.
- Example `samples/example.bash`: a function with `${#var}` at the end of a line, `end=5`, `done=1` and `end-of-line` in a continued list; `$#` followed by a string; `while` with `do` on the next line, a one-line loop and comments ending in `do` and `|`.
- Tests: the script from the issue as a fixed point and rebuilt from unindented input; `${#var}` at the end of a line; words that start with or end in a keyword; keywords followed by metacharacters; keywords as items of a continued list; strings after `$#` and `${#var}`; `while` with `do` on the next line, nested, with comments in between, one-line loops and the tcsh `while`; comments ending in keywords, braces, `;;` and continuation markers; the range formatter and the context computed for a selection (`baseIndent`).
- Additional validation with 54 real scripts (Git for Windows shell scripts and project examples): output identical to the previous version, except for 3 scripts that use `while` with `do` on the next line (`ssh-copy-id`, `rebaseall` and `gawkbug`). In those, everything after the first such loop used to stay one level too deep until the end of the file; the differences are whitespace only. All outputs are fixed points. The new blocks in `example.bash` were run in Bash before and after formatting, with the same output.
- The `shfmt` engine is not affected. No new configuration options.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.0.15` para `1.0.16`.
- **Correção** ([#39](https://github.com/Tooark/vscode-ark-format/issues/39)): dois defeitos no script da issue deslocavam a indentação, e um compensava o outro, por isso o fim do arquivo voltava a parecer correto:
  - `${#var}` no fim da linha, como `CURSOR=${#BUFFER}`, era lido como `{` seguido de comentário, então abria um bloco e tudo depois ganhava um nível. Um comentário inline só é reconhecido quando há espaço antes do `#`; `f() { # comentário` continua abrindo bloco.
  - `end-of-line` em uma lista `for ... in \` era lido como a palavra-chave `end` do tcsh e fechava um bloco. As palavras-chave eram detectadas com o `\b` de regex, que trata `-`, `=` e `.` como fim de palavra.
- **Correção**: as palavras-chave passam a ser delimitadas como palavras shell, que só terminam em espaço ou em metacaractere (`;&|()<>`). Isso vale para todas as palavras-chave de bloco (`if`, `elif`, `else`, `fi`, `then`, `do`, `done`, `case`, `in`, `esac`, e as do tcsh `while`, `foreach`, `end`, `endif`, `switch`, `endsw`, `breaksw`). O mesmo defeito atingia código bem mais comum:
  - `end=5`, `done=1`, `done-task`, `fi-tool`, `else-x` e `end.sh` fechavam um bloco.
  - `echo foo-then`, `echo foo-do`, `to-do`, `while-x`, `switch-user` e `case-x in` abriam um bloco.
  - Entrada sem espaços, que as regras de espaçamento corrigem em seguida, continua reconhecida: `if[ -f a ];then`, `for x in a b;do`, `done<file`, `done|sort`, `done)`, `fi;`.
- **Correção**: uma linha no meio de um comando continuado (vem de uma continuação e também termina em uma, como `end \` ou `done \` em uma lista) é argumento e não fecha mais um bloco.
- **Correção**: depois de `$#` ou `${#var}`, o restante da linha era tratado como comentário. Dois efeitos:
  - As regras de espaçamento eram aplicadas dentro de uma string seguinte: `echo $# "a   b"` virava `echo $# "a b"`, o que muda o que o script imprime.
  - Uma string multilinha aberta depois dele não era rastreada, então as linhas seguintes dela eram formatadas como código.
  - O `#` só inicia comentário no começo de uma palavra, como no Bash. `$#`, `${#var}`, `${var#prefixo}` e `a#b` não são comentários.
- **Correção**: laços `while` sem `do` no fim da linha:
  - Com o `do` na linha seguinte (`while read -r x` / `do`), a regra do `while` (necessária para o tcsh, em que `while (expr)` não tem `do`) e a regra do `do` somavam um nível cada, e só um era removido no `done`: o restante do arquivo ficava deslocado. O `do` passa a ficar no nível do `while`. Linhas em branco e comentários de linha inteira entre os dois são aceitos.
  - Um laço fechado na própria linha, como `while read -r l; do echo "$l"; done < file`, abria um bloco que nunca era fechado. Ele não abre mais bloco; `while ...; do cmd` com o corpo continuando nas linhas seguintes ainda abre.
  - `for` e `until` não eram afetados.
- **Correção**: o texto de um comentário inline participava das decisões de indentação. Um comentário terminado em `do`, `then` ou `{` (`exit 0 # nothing to do`) abria um bloco; terminado em `;;`, fechava um ramo de `case`; terminado em `|`, `&&`, `||` ou `\` (`x=1 # C:\`), iniciava uma continuação de linha. O comentário passa a ser ignorado na indentação; comentários de linha inteira e o código antes do comentário continuam funcionando como antes. Para isso, o `#` só conta como comentário no início da linha ou após espaço, então flags e operadores de glob do zsh, como `(#b)`, `*(#qN)` e `(*/)#`, continuam lidos como código.
- Exemplo `samples/example.bash`: uma função com `${#var}` no fim da linha, `end=5`, `done=1` e `end-of-line` em uma lista continuada; `$#` seguido de string; `while` com o `do` na linha seguinte, laço de uma linha e comentários terminados em `do` e `|`.
- Testes: o script da issue como ponto fixo e reconstruído a partir da entrada sem indentação; `${#var}` no fim da linha; palavras que começam ou terminam com uma palavra-chave; palavras-chave seguidas de metacaracteres; palavras-chave como itens de uma lista continuada; strings depois de `$#` e `${#var}`; `while` com o `do` na linha seguinte, aninhado, com comentários entre eles, laços de uma linha e o `while` do tcsh; comentários terminados em palavras-chave, chaves, `;;` e marcadores de continuação; o formatador de seleção e o contexto calculado para uma seleção (`baseIndent`).
- Validação adicional com 54 scripts reais (scripts shell do Git for Windows e exemplos do projeto): saída idêntica à versão anterior, exceto em 3 scripts que usam `while` com o `do` na linha seguinte (`ssh-copy-id`, `rebaseall` e `gawkbug`). Neles, tudo depois do primeiro laço desse tipo ficava um nível além do correto até o fim do arquivo; as diferenças são apenas de espaços em branco. Todas as saídas são ponto fixo. Os blocos novos do `example.bash` foram executados no Bash antes e depois da formatação, com a mesma saída.
- O engine `shfmt` não é afetado. Sem novas opções de configuração.

## Additional Information / Informações Adicionais

- Tag: `shell1.0.16`
- Release date / Data de lançamento: **2026-11-21**
