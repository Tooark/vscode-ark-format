# Release shell1.0.4

## Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.3` -> `1.0.4`.
- Limpeza do manifesto da extensão:
  - removidas definições de comandos não utilizados de `package.json`.
  - removidas chaves de localização associadas a esses comandos em `package.nls.json` e `package.nls.pt-br.json`.
- Correção do motor interno de indentação para cenários com blocos `if`/`else` e ramos `case` inline:
  - passa a detectar corretamente quando `if`, `elif` e `else` abrem bloco na linha seguinte.
  - passa a fechar corretamente ramos `case` terminados inline com `;;`, `;&` e `;;&`, inclusive com comentário no final da linha.
  - evita dedent incorreto quando a linha apenas termina com terminador de ramo após outros comandos.
- Adicionados testes de regressão para cobrir os novos cenários de indentação e formatação Shell.
- Manutenção de dependências do workspace: atualização de `qs` para `6.15.2` no lockfile/resolução do pnpm para corrigir alerta do Dependabot.

## Informações Adicionais

- Tag relacionada: `shell1.0.4`
- Data de lançamento: **2026-05-23**
