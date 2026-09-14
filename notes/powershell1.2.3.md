# Release powershell1.2.3

## Alterações desta versão

- Versão do pacote atualizada de `1.2.2` para `1.2.3`.
- **Correção**: as regras de espaçamento eram aplicadas ao trecho de código da linha inteiro, e esse trecho incluía o comentário de linha (`#`) até o fim da linha. Consequências:
  - `collapseSpaces` removia os espaços de alinhamento em colunas dentro de comentários — por exemplo, blocos `Uso:`/`Env:` de cabeçalhos de script perdiam a tabulação visual (`#   ./build.ps1 -Target Test      executa apenas os testes` virava `# ./build.ps1 -Target Test executa apenas os testes`).
  - A regra de espaço antes da chave de abertura alterava código citado em comentários: `function Test{` → `function Test {`, `if ($x){` → `if ($x) {`.
- O texto do comentário passa a ser preservado literalmente. O comportamento restante não muda:
  - As regras continuam sendo aplicadas ao código que precede o comentário (`if ($x){ # nota` → `if ($x) { # nota`).
  - O espaço entre o código e o `#` de um comentário inline continua sendo colapsado (`$x = 1    # nota` → `$x = 1 # nota`).
  - O espaço após o marcador continua sendo normalizado (`#texto` → `# texto`), sem tocar no restante do comentário; `#>` segue preservado.
  - `#` escapado por crase (`` `# ``) e shebang continuam sendo reconhecidos como não-comentário.
- Comentários em bloco (`<# ... #>`) já não passavam por essas regras e continuam regidos exclusivamente por `formatBlockComments`.
- Testes: novos casos de regressão em `applyPowerShellSpacing` (alinhamento em comentário de linha inteira e inline, código citado em comentário, regras ainda aplicadas ao código antes do `#`, espaço do marcador, `#` escapado por crase) e um caso de documento com cabeçalho `Uso:`/`Env:` verificado como ponto fixo do formatador.
- Sem novas opções de configuração. Mesma correção aplicada ao formatador de Shell na versão `1.0.13`.

## Informações Adicionais

- Tag relacionada: `powershell1.2.3`
- Data de lançamento: **2026-09-13**
