# Changelog

Todas as mudanças relevantes do pacote `ark-format-shell` estão documentadas aqui.

## 1.0.8 - 2026-05-31

- Versão do pacote atualizada de `1.0.7` para `1.0.8`.
- Correção de indentação para fechamento inline de `if` com `fi`/`endif` na mesma linha (ex.: `return; fi`), evitando drift no próximo bloco irmão.
- Correção de contexto para `case` aninhado, preservando corretamente labels e terminadores `;;` no `case` externo após `esac` interno.
- Inclusão de testes de regressão para cenários de `fi` inline e `case` aninhado.
- Atualização de amostra complexa com cenário dedicado de `case` aninhado para validação manual.
- Detalhes: [notes/shell1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.8.md)

## 1.0.7 - 2026-05-31

- Versão do pacote atualizada de `1.0.6` para `1.0.7`.
- Endurecimento de segurança na integração com `shfmt`: configurações `arkFormatShell.shfmt.path` e `arkFormatShell.shfmt.flags` passam a ignorar escopos de `workspace` e `workspaceFolder`, priorizando apenas valores em nível de usuário.
- Remoção de log de ativação no `activate`, reduzindo ruído no host da extensão.
- Ajuste no pipeline de publicação para remover passagem explícita de token nas chamadas de `vsce` e `ovsx`.
- Detalhes: [notes/shell1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.7.md)

## 1.0.6 - 2026-05-27

- Ajuste de documentação bilíngue: links de idioma do README migrados de `raw.githubusercontent.com` para `github.com/.../blob/...`.
- Versão do pacote atualizada de `1.0.5` para `1.0.6`.
- Endurecimento de segurança no workspace de build/publicação: override de `tmp` para `>=0.2.6` no lockfile do monorepo.
- Detalhes: [notes/shell1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.6.md)

## 1.0.5 - 2026-05-27

- Reestruturação completa do README para o novo padrão de documentação.
- Inclusão de `README.pt-BR.md` com navegação de idiomas EN/PT-BR.
- Correções de consistência na documentação (`lineEnding` e dica de uso para Shell).
- Versão do pacote atualizada de `1.0.4` para `1.0.5`.
- Detalhes: [notes/shell1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.5.md)

## 1.0.4 - 2026-05-23

- Correções do motor de indentação para blocos `if/elif/else` e ramos `case` inline (`;;`, `;&`, `;;&`).
- Adição de testes de regressão para os cenários corrigidos.
- Limpeza de comandos não utilizados no manifesto e arquivos de localização.
- Atualização de dependência do workspace (`qs` para `6.15.2`).
- Versão do pacote atualizada de `1.0.3` para `1.0.4`.
- Detalhes: [notes/shell1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.4.md)

## 1.0.3 - 2026-05-22

- Revisão da documentação para refletir defaults reais da extensão.
- Remoção da seção Autor do README.
- Versão do pacote atualizada de `1.0.2` para `1.0.3`.
- Detalhes: [notes/shell1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.3.md)

## 1.0.2 - 2026-05-21

- Nova regra de formatação para comandos multilinha com `\` dentro de `"$(...)"`.
- Correção de integração com VS Code removendo `contributes.languages` (evita impacto em syntax highlighting).
- Versão do pacote atualizada de `1.0.1` para `1.0.2`.
- Detalhes: [notes/shell1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.2.md)

## 1.0.1 - 2026-05-21

- Inclusão de traduções ausentes para comandos no `package.nls.json`.
- Ajustes visuais na seção de autor do README (avatar e espaçamento).
- Versão do pacote atualizada de `1.0.0` para `1.0.1`.
- Detalhes: [notes/shell1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.1.md)

## 1.0.0 - 2026-05-21

- Primeira versão estável do formatador Shell.
- Suporte a engine interna e integração opcional com `shfmt`.
- Suporte a formatação completa e por seleção, regras de indentação e `.editorconfig`.
- Detalhes: [notes/shell1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/shell1.0.0.md)
