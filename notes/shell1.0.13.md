# Release shell1.0.13

## Notes in en-US

### Changes in this version

- Package version bumped from `1.0.12` to `1.0.13`.
- **Fix**: the internal engine's spacing rules were applied to the whole code part of the line, and that part included the comment (`#`) up to the end of the line. Consequences:
  - `collapseSpaces` removed column-alignment spaces inside comments — for example, `Usage:`/`Env:` blocks in script headers lost their visual alignment (`#   scripts/check.sh --all      everything above` became `# scripts/check.sh --all everything above`).
  - The keyword and function rules changed code quoted in comments: `for(` → `for (`, `if[` → `if [`, `;then` → `; then`, `name(){` → `name() {`.
- Comment text is now preserved verbatim. The rest of the behavior is unchanged:
  - The rules still apply to the code before the comment (`if[ x ];then # nota` → `if [ x ]; then # nota`).
  - The space between the code and the `#` of an inline comment is still collapsed (`echo ok    # nota` → `echo ok # nota`).
  - The space after the marker is still normalized (`#texto` → `# texto`), without touching the rest of the comment.
  - Shebang, `${#var}` and `${var##padrão}` are still recognized as non-comments.
- Tests: new regression cases in `applyShellSpacing` (alignment in full-line and inline comments, code quoted in a comment, rules still applied to the code before the `#`, marker spacing) and a document case with a `Usage:`/`Env:` header verified as a fixed point of the formatter.
- The `shfmt` engine is not affected. No new configuration options.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.0.12` para `1.0.13`.
- **Correção**: as regras de espaçamento do motor interno eram aplicadas ao trecho de código da linha inteiro, e esse trecho incluía o comentário (`#`) até o fim da linha. Consequências:
  - `collapseSpaces` removia os espaços de alinhamento em colunas dentro de comentários — por exemplo, blocos `Usage:`/`Env:` de cabeçalhos de script perdiam a tabulação visual (`#   scripts/check.sh --all      everything above` virava `# scripts/check.sh --all everything above`).
  - As regras de palavras-chave e de função alteravam código citado em comentários: `for(` → `for (`, `if[` → `if [`, `;then` → `; then`, `name(){` → `name() {`.
- O texto do comentário passa a ser preservado literalmente. O comportamento restante não muda:
  - As regras continuam sendo aplicadas ao código que precede o comentário (`if[ x ];then # nota` → `if [ x ]; then # nota`).
  - O espaço entre o código e o `#` de um comentário inline continua sendo colapsado (`echo ok    # nota` → `echo ok # nota`).
  - O espaço após o marcador continua sendo normalizado (`#texto` → `# texto`), sem tocar no restante do comentário.
  - Shebang, `${#var}` e `${var##padrão}` continuam sendo reconhecidos como não-comentário.
- Testes: novos casos de regressão em `applyShellSpacing` (alinhamento em comentário de linha inteira e inline, código citado em comentário, regras ainda aplicadas ao código antes do `#`, espaço do marcador) e um caso de documento com cabeçalho `Usage:`/`Env:` verificado como ponto fixo do formatador.
- O engine `shfmt` não é afetado. Sem novas opções de configuração.

## Additional Information / Informações Adicionais

- Tag: `shell1.0.13`
- Release date / Data de lançamento: **2026-09-13**
