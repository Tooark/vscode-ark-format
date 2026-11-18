# Release powershell1.2.2

## Notes in en-US

### Changes in this version

- Package version bumped from `1.2.1` to `1.2.2`.
- **Fix**: indented here-strings (`@' ... '@` and `@" ... "@`, for example inside an `if`, `function` or `try` block) were no longer preserved: the formatter applied the block indentation to every line of the body and also to the terminator (`'@`/`"@`). Since PowerShell requires the here-string terminator to be at **column 0**, the resulting script was invalid and the literal content (for example, C# code passed to `Add-Type -TypeDefinition`) was corrupted.
- Here-strings are now handled by the heredoc mechanism and preserved **verbatim**: the body is kept byte for byte and the terminator stays at column 0, regardless of the indentation level of the opening line.
- The fix is PowerShell-specific: the behavior of the Shell formatter (which intentionally reindents multi-line string content such as `jq` filters/`aws` commands) is unchanged.
- Here-string detection rewritten on top of `getQuoteModeAfterLine` (single source of truth), correctly recognizing the `@'`/`@"` openers that previously escaped detection.
- Tests: new regression cases for indented here-strings (`@'` and `@"`) checking verbatim content, terminator at column 0 and idempotence; `shared`, `powershell` and `shell` suites validated.
- No new settings and no behavior change in other constructs.

## Notas em pt-BR

### Alterações desta versão

- Versão do pacote atualizada de `1.2.1` para `1.2.2`.
- **Correção**: here-strings (`@' ... '@` e `@" ... "@`) declaradas indentadas (por exemplo, dentro de um bloco `if`, `function` ou `try`) deixavam de ser preservadas: o formatador aplicava a indentação do bloco a todas as linhas do corpo e também ao terminador (`'@`/`"@`). Como o PowerShell exige que o terminador da here-string fique na **coluna 0**, o script resultante ficava inválido e o conteúdo literal (por exemplo, código C# passado a `Add-Type -TypeDefinition`) era corrompido.
- Here-strings agora são tratadas pelo mecanismo de heredoc e preservadas **verbatim**: o corpo é mantido byte a byte e o terminador permanece na coluna 0, independentemente do nível de indentação da linha de abertura.
- A correção é específica do PowerShell: o comportamento do formatador de Shell (que reindenta, de propósito, conteúdo de strings multilinha como filtros `jq`/comandos `aws`) permanece inalterado.
- Detecção de here-string reescrita sobre `getQuoteModeAfterLine` (fonte única de verdade), reconhecendo corretamente as aberturas `@'`/`@"` que antes escapavam à detecção.
- Testes: novos casos de regressão para here-string indentada (`@'` e `@"`) com verificação de conteúdo verbatim, terminador na coluna 0 e idempotência; suítes de `shared`, `powershell` e `shell` validadas.
- Sem novas opções de configuração e sem mudança de comportamento nos demais construtos.

## Additional Information / Informações Adicionais

- Tag: `powershell1.2.2`
- Release date / Data de lançamento: **2026-07-20**
