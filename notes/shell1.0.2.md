# Release shell1.0.2

## Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.1` -> `1.0.2`.
- Nova regra de formatação para comandos multilinha com continuação (`\`) dentro de substituição de comando entre aspas (`"$(...)"`):
  - Passa a aplicar recuo nas linhas continuadas do comando.
  - Cenário validado com teste de regressão para `aws stepfunctions create-state-machine`.
- Correção de integração com o VS Code para não afetar a coloração/syntax highlighting:
  - Removido o bloco `contributes.languages` do manifesto do pacote.
  - Evita sobrescrever associação de extensões de arquivo sem prover grammar.

## Informações Adicionais

- Tag relacionada: `shell1.0.2`
- Data de lançamento: **2026-05-21**
