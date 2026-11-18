# Release powershell1.2.4

## Notes in en-US

### Changes in this version

- Package version bumped from `1.2.3` to `1.2.4`.
- **Fix** (PowerShell equivalent of Shell formatter issue [#34](https://github.com/Tooark/vscode-ark-format/issues/34)): the formatter deleted, or stopped formatting, the lines following a string with quotes inside a subexpression, such as `Write-Host "Nome: $($user.Name.Trim('"'))"`. Two defects combined:
  - The lexer treated the `$(...)` subexpression inside double quotes as literal text. The inner quotes closed and reopened the outer string, and the line ended "inside single quotes".
  - The lines of a multi-line string were only written to the output when the string closed (shared package). If the file ended with the string still open, those lines were discarded.
- The lexer now treats `$(...)` inside double quotes as a new quoting context, like PowerShell does:
  - Single and double quotes inside the subexpression open their own strings without closing the outer string.
  - The subexpression closes at the matching `)`: parentheses inside quotes do not count, and nested subexpressions are supported.
  - A backtick escapes the next character; `#` at the start of a token is a comment until the end of the line.
  - The state stays correct when the subexpression spans multiple lines.
  - Here-strings declared inside the subexpression (`"$(@'`) have their body and terminator preserved without reindentation, since the terminator must stay at column 0.
- **Fix**: backtick-escaped quotes outside strings (`` `" `` and `` `' ``, for example ``Write-Host it`'s``) opened a string by mistake. The backtick now escapes the next character in regular code as well. The handling of `` `# `` and of the continuation backtick at the end of a line is unchanged.
- **Data-loss protection** (shared package): if a string stays open until the end of the file — because it really is open or because the quotes were misread —, the pending lines are now preserved unchanged instead of discarded.
- Example `samples/example.complex.ps1`: new section with subexpressions containing nested quotes, on one line and across multiple lines. In the previous version, the formatter deleted 58 of the 100 lines of this sample.
- Tests: regression cases with the line repeated 1, 2 and 3 times (also checking that the output is a fixed point), a multi-line subexpression, a here-string inside a subexpression in an indented block, backtick-escaped quotes and a string left open until the end of the file; lexer tests for nested contexts, parenthesis counting, escapes, comments and nested here-strings.
- Additional validation with 176 real PowerShell scripts and modules (Windows PowerShell and PowerShell 7 modules): output identical to the previous version, with no content change beyond whitespace, and every output is a fixed point.
- The same fix was applied to the Shell formatter in version `1.0.14`. No new settings.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.2.3` para `1.2.4`.
- **Correção** (equivalente PowerShell da [#34](https://github.com/Tooark/vscode-ark-format/issues/34) do formatador Shell): o formatador apagava ou deixava de formatar as linhas seguintes a uma string com aspas dentro de uma subexpressão, como `Write-Host "Nome: $($user.Name.Trim('"'))"`. Eram dois defeitos combinados:
  - O lexer tratava a subexpressão `$(...)` dentro de aspas duplas como texto literal. As aspas internas fechavam e reabriam a string externa, e a linha terminava "dentro de aspas simples".
  - As linhas de uma string multilinha só eram gravadas na saída quando a string fechava (pacote compartilhado). Se o arquivo terminasse com a string aberta, essas linhas eram descartadas.
- O lexer passa a tratar `$(...)` dentro de aspas duplas como um novo contexto de aspas, como o PowerShell:
  - Aspas simples e duplas dentro da subexpressão abrem strings próprias, sem fechar a string externa.
  - A subexpressão fecha no `)` correspondente: parênteses entre aspas não contam, e subexpressões aninhadas são suportadas.
  - A crase escapa o próximo caractere; `#` no início de um token é comentário até o fim da linha.
  - O estado continua correto quando a subexpressão ocupa várias linhas.
  - Here-strings declaradas dentro da subexpressão (`"$(@'`) têm o corpo e o terminador preservados sem reindentação, pois o terminador precisa permanecer na coluna 0.
- **Correção**: aspas escapadas com crase fora de strings (`` `" `` e `` `' ``, por exemplo ``Write-Host it`'s``) abriam uma string por engano. A crase passa a escapar o próximo caractere também no código normal. O tratamento de `` `# `` e da crase de continuação no fim da linha não muda.
- **Proteção contra perda de dados** (pacote compartilhado): se uma string continuar aberta até o fim do arquivo — porque está realmente aberta ou por uma interpretação incorreta das aspas —, as linhas pendentes passam a ser preservadas sem alterações em vez de descartadas.
- Exemplo `samples/example.complex.ps1`: nova seção com subexpressões com aspas aninhadas, em uma linha e em várias linhas. Na versão anterior, o formatador apagava 58 das 100 linhas desse exemplo.
- Testes: casos de regressão com a linha repetida 1, 2 e 3 vezes (verificando também que a saída é ponto fixo), subexpressão multilinha, here-string dentro de subexpressão em bloco indentado, aspas escapadas com crase e string aberta até o fim do arquivo; testes do lexer para contextos aninhados, contagem de parênteses, escapes, comentários e here-strings aninhadas.
- Validação adicional com 176 scripts e módulos PowerShell reais (módulos do Windows PowerShell e do PowerShell 7): saída idêntica à versão anterior, sem alteração de conteúdo além de espaços em branco, e todas as saídas são ponto fixo.
- Mesma correção aplicada ao formatador de Shell na versão `1.0.14`. Sem novas opções de configuração.

## Additional Information / Informações Adicionais

- Tag: `powershell1.2.4`
- Release date / Data de lançamento: **2026-11-16**
