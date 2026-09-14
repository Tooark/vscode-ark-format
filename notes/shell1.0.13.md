# Release shell1.0.13

## Alterações desta versão

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

## Informações Adicionais

- Tag relacionada: `shell1.0.13`
- Data de lançamento: **2026-09-13**
