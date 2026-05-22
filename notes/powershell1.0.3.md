# Release powershell1.0.3

## Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.0.2` -> `1.0.3`.
- Correção no formatter para preservar corretamente o fechamento de comentário em bloco PowerShell (`#>`), evitando saída inválida como `# >`.
- Adicionados testes de regressão para cobrir o cenário de fechamento `#>`:
  - `powerShellSpacing.test.ts`
  - `powerShellFormatter.test.ts`
- Ajuste de documentação:
  - revisado configurações padrão da extensão, para refletir as configurações do package.json.
  - removida a seção **Autor** do `README.md` do pacote.

## Informações Adicionais

- Tag relacionada: `powershell1.0.3`
- Data de lançamento: **2026-05-22**
