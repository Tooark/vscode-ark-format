# Release powershell1.0.3

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-powershell` package: `1.0.2` -> `1.0.3`.
- Formatter fix to correctly preserve the PowerShell block comment closer (`#>`), avoiding invalid output such as `# >`.
- Added regression tests covering the `#>` closer scenario:
  - `powerShellSpacing.test.ts`
  - `powerShellFormatter.test.ts`
- Documentation adjustment:
  - reviewed the extension's default settings to reflect the settings in package.json.
  - removed the **Author** section from the package's `README.md`.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-powershell`: `1.0.2` -> `1.0.3`.
- Correção no formatter para preservar corretamente o fechamento de comentário em bloco PowerShell (`#>`), evitando saída inválida como `# >`.
- Adicionados testes de regressão para cobrir o cenário de fechamento `#>`:
  - `powerShellSpacing.test.ts`
  - `powerShellFormatter.test.ts`
- Ajuste de documentação:
  - revisado configurações padrão da extensão, para refletir as configurações do package.json.
  - removida a seção **Autor** do `README.md` do pacote.

## Additional Information / Informações Adicionais

- Tag: `powershell1.0.3`
- Release date / Data de lançamento: **2026-05-22**
