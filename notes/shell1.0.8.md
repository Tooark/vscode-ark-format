# Release shell1.0.8

## Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.7` -> `1.0.8`.
- Correção de indentação para fechamento inline de `if`:
  - O formatter passa a reconhecer `fi`/`endif` inline (ex.: `return; fi`) sem exigir quebra de linha.
  - Evita drift de indentação em `if` irmãos após fechamento inline.
- Correção de contexto em `case` aninhado:
  - O estado interno de `case` foi ajustado para preservar corretamente o `case` externo após `esac` interno.
  - Corrige desalinhamento de labels e `;;` em estruturas `case` dentro de `case`.
- Cobertura de regressão ampliada com novos testes para os cenários acima.
- Atualização de amostra complexa (`example.complex.sh`) com cenário explícito de `case` aninhado para validação manual.

## Informações Adicionais

- Tag relacionada: `shell1.0.8`
- Data de lançamento: **2026-05-31**
