# Release powershell1.2.6

## Notes in en-US

### Changes in this version

- Package version bumped from `1.2.5` to `1.2.6`.
- These fixes come from an audit of the PowerShell formatter for the same family of defects fixed in the Shell formatter for [#39](https://github.com/Tooark/vscode-ark-format/issues/39): ordinary text read as a keyword, a comment or a block delimiter.
- **Fix**: clauses after a one-line block. Inside a function, `try { Get-Item x }` followed by `catch { Write-Host err }` (or `if ($a) { 1 }` followed by `else { 2 }`) sent the clause one level to the left and left the rest of the function shifted. The formatter only counted `{` at the end of a line and `}` at the start, and compensated with a rule that dedented every `else`/`elseif`/`catch`/`finally` line.
  - Indentation now follows the balance of `{` and `}` on each line, as it already did for parentheses. A one-line block does not change the level, `function f { param($a)` opens a block and `Write-Host 1 }` closes one.
  - The balance also counts on lines that end in a continuation (a backtick or `|`), so a block opened on such a line and closed on a later one keeps the rest of the function in place. Continued lines inside a block opened that way get one more level than before.
  - The clause rule is gone, so commands and hashtable keys that start with a clause keyword (`Catch-Errors $x`, `Finally-Cleanup`, `Else = 2`, `Catch = 3`) are no longer dedented.
  - `})` and `}}` at the start of a line are aligned with the line that opened the blocks, and a line such as `) -join (` keeps the following lines indented.
- **Fix**: `#Requires`, `#region` and `#endregion` no longer get a space after the `#`.
  - `# Requires -Version 7.0` is a plain comment: the PowerShell parser reports no requirement for it, so the script lost its requirement without any warning.
  - `# region` and `# endregion` do not match the folding markers of VS Code (`^\s*#[rR]egion\b`), so the regions stopped folding.
  - Other comments still get the space (`#note` becomes `# note`), including words that only start like a directive (`#regional`).
- **Fix**: `#` only starts a comment at the beginning of a token, as in PowerShell. In the middle of a word (`C#`, `a#b`, `https://host/#/path`, `--color=#fff`) it is part of the argument. Previously everything after it was a comment, with three effects:
  - Spaces inside a string that followed were collapsed: `dotnet new console -lang C# -o "My   App"` became `"My App"`.
  - A `{` at the end of the line was not seen, so the block body was not indented and the rest of the file shifted.
  - A here-string opened on that line was not detected: its body was reformatted and the `"@` terminator was moved away from column 0, which breaks the script.
  - A `#` glued to a closing quote, parenthesis, bracket or brace, or after `,`, `;`, `|` and `&`, is still a comment. The escaped `` `# `` is not.
- **Fix**: braced variables (`${name}`) are kept exactly as written, since the name accepts any character. Previously `${#CANCAPTUREARGS#}` became `${# CANCAPTUREARGS#}` and `${a  b}` became `${a b}`, which are different variables, and braces or parentheses in the name counted as block delimiters. Repeated spaces around the variable are still collapsed.
- **Fix**: inline block comments. `if ($a) <# why #> {` and `if ($a) { <# why #>` did not open the block, because the comment hid the rest of the line. A `<# ... #>` closed on the same line is now skipped and kept as written; without the `#>`, the rest of the line is a comment.
- **Fix** (selection formatting and the context computed for a selection): the text of a multi-line `<# ... #>` block was read as code. An apostrophe in the help text (`Don't`) opened a string and froze the rest of the selection, and braces or parentheses in it changed the indentation of the selected code. The block is now preserved as written, as document formatting does with `formatBlockComments` disabled.
- Example `samples/example.complex.ps1`: a function with one-line `try`/`catch` and `if`/`elseif`/`else` blocks, a hashtable with keys named `If`, `Else` and `Catch`, a braced variable with a space in its name, `C#` and a URL with `#` as arguments, inside `#region`/`#endregion`.
- Tests: clauses after one-line and multi-line blocks (inside a function, where the shift is visible), commands and hashtable keys named like clauses, blocks that open or close in the middle of a line, `})`, `}}` and `) -join (`, `#` in the middle of a word followed by a string, a block or a here-string, comments glued to a token, the three directives, braced variables, inline block comments, and block comments in selection formatting and in the selection context.
- Validation with 361 real scripts (the modules shipped with Windows PowerShell and PowerShell 7, Pester and the project examples), using the PowerShell parser to compare each original with its formatted output (parse errors, non-comment tokens and `#Requires`):
  - Scripts whose meaning the formatter changed went from 3 to 1. `Appx.psm1` lost its `#Requires` and Pester's `Mock.ps1` had `${#CANCAPTUREARGS#}` renamed; both are fixed.
  - The remaining one already happened before this version and is not addressed here: in `StorageBusCache.psm1`, a line ends in a backtick glued to a word and the next line is a `}` that moves to column 0.
  - 18 scripts changed compared with the previous version, in whitespace only, and every difference was read: directives without the extra space, clauses after one-line blocks, blocks opened in the middle of a line and `})` aligned with its opener. All outputs are fixed points.
  - On the previous version, 2 scripts ended with the rest of the file shifted (`SamplePSReadLineProfile.ps1` from PSReadLine and Pester's `Mock.ps1`); none does now.
  - The comment rule was checked against the tokenizer: of 29,446 comments, none is read as code, and no code is read as a comment.
  - The new block in `example.complex.ps1` was run in PowerShell before and after formatting, with the same output.
- Known limits, not addressed here: a block comment opened in the middle of a line and closed on a later one still has its following lines read as code; after a pipeline or backtick continuation, the body of a block stays at the level of the line that opened it.
- No new configuration options.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.2.5` para `1.2.6`.
- Estas correções vêm de uma auditoria do formatador PowerShell atrás da mesma família de defeitos corrigida no formatador Shell para a [#39](https://github.com/Tooark/vscode-ark-format/issues/39): texto comum lido como palavra-chave, comentário ou delimitador de bloco.
- **Correção**: cláusulas depois de um bloco de uma linha. Dentro de uma função, `try { Get-Item x }` seguido de `catch { Write-Host err }` (ou `if ($a) { 1 }` seguido de `else { 2 }`) jogava a cláusula um nível para a esquerda e deixava o restante da função deslocado. O formatador só contava `{` no fim da linha e `}` no início, e compensava com uma regra que dedentava toda linha `else`/`elseif`/`catch`/`finally`.
  - A indentação passa a seguir o saldo de `{` e `}` de cada linha, como já fazia com parênteses. Um bloco de uma linha não muda o nível, `function f { param($a)` abre um bloco e `Write-Host 1 }` fecha um.
  - O saldo vale também em linhas que terminam em continuação (crase ou `|`), então um bloco aberto em uma linha dessas e fechado em outra mantém o restante da função no lugar. As linhas continuadas dentro de um bloco aberto assim ganham um nível a mais que antes.
  - A regra das cláusulas foi removida, então comandos e chaves de hashtable que começam com uma palavra-chave de cláusula (`Catch-Errors $x`, `Finally-Cleanup`, `Else = 2`, `Catch = 3`) não são mais dedentados.
  - `})` e `}}` no início da linha ficam alinhados com a linha que abriu os blocos, e uma linha como `) -join (` mantém as linhas seguintes indentadas.
- **Correção**: `#Requires`, `#region` e `#endregion` não recebem mais espaço depois do `#`.
  - `# Requires -Version 7.0` é um comentário comum: o parser do PowerShell não reporta requisito para ele, então o script perdia o requisito sem nenhum aviso.
  - `# region` e `# endregion` não casam com os marcadores de dobra do VS Code (`^\s*#[rR]egion\b`), então as regiões deixavam de dobrar.
  - Os demais comentários continuam recebendo o espaço (`#nota` vira `# nota`), incluindo palavras que só começam como uma diretiva (`#regional`).
- **Correção**: o `#` só inicia comentário no começo de um token, como no PowerShell. No meio de uma palavra (`C#`, `a#b`, `https://host/#/rota`, `--cor=#fff`) ele faz parte do argumento. Antes, tudo depois dele era comentário, com três efeitos:
  - Os espaços dentro de uma string seguinte eram colapsados: `dotnet new console -lang C# -o "My   App"` virava `"My App"`.
  - Um `{` no fim da linha não era visto, então o corpo do bloco não era indentado e o restante do arquivo ficava deslocado.
  - Uma here-string aberta naquela linha não era detectada: o corpo era reformatado e o terminador `"@` saía da coluna 0, o que quebra o script.
  - O `#` colado a aspas, parêntese, colchete ou chave de fechamento, ou depois de `,`, `;`, `|` e `&`, continua sendo comentário. O `` `# `` escapado não é.
- **Correção**: variáveis entre chaves (`${nome}`) são mantidas exatamente como escritas, pois o nome aceita qualquer caractere. Antes, `${#CANCAPTUREARGS#}` virava `${# CANCAPTUREARGS#}` e `${a  b}` virava `${a b}`, que são outras variáveis, e chaves ou parênteses no nome contavam como delimitadores de bloco. Os espaços repetidos ao redor da variável continuam sendo colapsados.
- **Correção**: comentários de bloco no meio da linha. `if ($a) <# motivo #> {` e `if ($a) { <# motivo #>` não abriam o bloco, porque o comentário escondia o restante da linha. Um `<# ... #>` fechado na mesma linha passa a ser pulado e mantido como escrito; sem o `#>`, o restante da linha é comentário.
- **Correção** (formatação de seleção e contexto calculado para uma seleção): o texto de um bloco `<# ... #>` de várias linhas era lido como código. Um apóstrofo no texto de ajuda (`Don't`) abria uma string e congelava o restante da seleção, e chaves ou parênteses nele alteravam a indentação do código selecionado. O bloco passa a ser preservado como escrito, como a formatação de documento faz com `formatBlockComments` desabilitado.
- Exemplo `samples/example.complex.ps1`: uma função com blocos `try`/`catch` e `if`/`elseif`/`else` de uma linha, uma hashtable com chaves `If`, `Else` e `Catch`, uma variável entre chaves com espaço no nome, `C#` e uma URL com `#` como argumentos, dentro de `#region`/`#endregion`.
- Testes: cláusulas depois de blocos de uma linha e de várias linhas (dentro de uma função, onde o deslocamento aparece), comandos e chaves de hashtable com nome de cláusula, blocos que abrem ou fecham no meio da linha, `})`, `}}` e `) -join (`, `#` no meio de uma palavra seguido de string, de bloco ou de here-string, comentários colados a um token, as três diretivas, variáveis entre chaves, comentários de bloco no meio da linha e blocos de comentário na formatação de seleção e no contexto da seleção.
- Validação com 361 scripts reais (os módulos que acompanham o Windows PowerShell e o PowerShell 7, o Pester e os exemplos do projeto), usando o parser do PowerShell para comparar cada original com a saída formatada (erros de parse, tokens que não são comentário e `#Requires`):
  - Os scripts cujo significado o formatador alterava caíram de 3 para 1. O `Appx.psm1` perdia o `#Requires` e o `Mock.ps1` do Pester tinha `${#CANCAPTUREARGS#}` renomeada; os dois estão corrigidos.
  - O que resta já acontecia antes desta versão e não é tratado aqui: no `StorageBusCache.psm1`, uma linha termina em crase colada a uma palavra e a linha seguinte é um `}` que vai para a coluna 0.
  - 18 scripts mudaram em relação à versão anterior, apenas em espaços em branco, e todas as diferenças foram lidas: diretivas sem o espaço extra, cláusulas depois de blocos de uma linha, blocos abertos no meio da linha e `})` alinhado com a linha que o abriu. Todas as saídas são ponto fixo.
  - Na versão anterior, 2 scripts terminavam com o restante do arquivo deslocado (`SamplePSReadLineProfile.ps1`, do PSReadLine, e `Mock.ps1`, do Pester); agora nenhum.
  - A regra de comentário foi conferida contra o tokenizador: de 29.446 comentários, nenhum é lido como código, e nenhum código é lido como comentário.
  - O bloco novo do `example.complex.ps1` foi executado no PowerShell antes e depois da formatação, com a mesma saída.
- Limites conhecidos, não tratados aqui: um comentário de bloco aberto no meio de uma linha e fechado em outra ainda tem as linhas seguintes lidas como código; depois de uma continuação por pipeline ou crase, o corpo de um bloco fica no nível da linha que o abriu.
- Sem novas opções de configuração.

## Additional Information / Informações Adicionais

- Tag: `powershell1.2.6`
- Release date / Data de lançamento: **2026-11-21**
