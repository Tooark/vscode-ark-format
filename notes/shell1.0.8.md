# Release shell1.0.8

## Notes in en-US

### Changes in this version

- Version bump of the `ark-format-shell` package: `1.0.7` -> `1.0.8`.
- Indentation fix for an inline `if` close:
  - The formatter now recognizes inline `fi`/`endif` (e.g. `return; fi`) without requiring a line break.
  - Prevents indentation drift in sibling `if` blocks after an inline close.
- Context fix for nested `case`:
  - The internal `case` state was adjusted to correctly preserve the outer `case` after an inner `esac`.
  - Fixes misaligned labels and `;;` in `case` structures inside a `case`.
- Regression coverage expanded with new tests for the scenarios above.
- Complex sample (`example.complex.sh`) updated with an explicit nested `case` scenario for manual validation.

## Notas em pt-BR

### Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.7` -> `1.0.8`.
- Correção de indentação para fechamento inline de `if`:
  - O formatter passa a reconhecer `fi`/`endif` inline (ex.: `return; fi`) sem exigir quebra de linha.
  - Evita drift de indentação em `if` irmãos após fechamento inline.
- Correção de contexto em `case` aninhado:
  - O estado interno de `case` foi ajustado para preservar corretamente o `case` externo após `esac` interno.
  - Corrige desalinhamento de labels e `;;` em estruturas `case` dentro de `case`.
- Cobertura de regressão ampliada com novos testes para os cenários acima.
- Atualização de amostra complexa (`example.complex.sh`) com cenário explícito de `case` aninhado para validação manual.

## Additional Information / Informações Adicionais

- Tag: `shell1.0.8`
- Release date / Data de lançamento: **2026-05-31**
