# Release powershell1.2.2

## Alterações desta versão

- Versão do pacote atualizada de `1.2.1` para `1.2.2`.
- **Correção**: here-strings (`@' ... '@` e `@" ... "@`) declaradas indentadas (por exemplo, dentro de um bloco `if`, `function` ou `try`) deixavam de ser preservadas: o formatador aplicava a indentação do bloco a todas as linhas do corpo e também ao terminador (`'@`/`"@`). Como o PowerShell exige que o terminador da here-string fique na **coluna 0**, o script resultante ficava inválido e o conteúdo literal (por exemplo, código C# passado a `Add-Type -TypeDefinition`) era corrompido.
- Here-strings agora são tratadas pelo mecanismo de heredoc e preservadas **verbatim**: o corpo é mantido byte a byte e o terminador permanece na coluna 0, independentemente do nível de indentação da linha de abertura.
- A correção é específica do PowerShell: o comportamento do formatador de Shell (que reindenta, de propósito, conteúdo de strings multilinha como filtros `jq`/comandos `aws`) permanece inalterado.
- Detecção de here-string reescrita sobre `getQuoteModeAfterLine` (fonte única de verdade), reconhecendo corretamente as aberturas `@'`/`@"` que antes escapavam à detecção.
- Testes: novos casos de regressão para here-string indentada (`@'` e `@"`) com verificação de conteúdo verbatim, terminador na coluna 0 e idempotência; suítes de `shared`, `powershell` e `shell` validadas.
- Sem novas opções de configuração e sem mudança de comportamento nos demais construtos.

## Informações Adicionais

- Tag relacionada: `powershell1.2.2`
- Data de lançamento: **2026-07-20**
