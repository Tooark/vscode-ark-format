# Release shell1.0.9

## Alterações desta versão

- Bump de versão do pacote `ark-format-shell`: `1.0.8` -> `1.0.9`.
- Rodada de manutenção de segurança nas dependências (avisos do Dependabot):
  - `esbuild` atualizado para `0.28.1` (leitura arbitrária de arquivos no dev server em Windows).
  - `vite` atualizado para `>=8.0.16` (bypass de `server.fs.deny` em caminhos alternativos no Windows e divulgação de hash NTLMv2 via `launch-editor`).
  - `undici` atualizado para `>=7.28.0` (HTTP response queue poisoning, downgrade de `SameSite`, injeção de header, vazamento de cache e falhas de proxy SOCKS5).
  - `markdown-it` atualizado para `>=14.2.0` (DoS de complexidade quadrática na regra de smartquotes).
  - `tmp` atualizado para `>=0.2.7` (path traversal via type-confusion em `_assertPath`).
  - `form-data` atualizado para `>=4.0.6` (CRLF injection em nomes de campos/arquivos multipart).
- Correções aplicadas via `overrides` no workspace (dependências transitivas de `@vscode/vsce` e `vitest`).
- Sem alterações funcionais no motor de formatação; build e suíte de testes validados.

## Informações Adicionais

- Tag relacionada: `shell1.0.9`
- Data de lançamento: **2026-06-27**
