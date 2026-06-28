# Changelog

Todas as mudanças relevantes do pacote `ark-format-powershell` estão documentadas aqui.

## 1.1.0 - 2026-06-27

- Nova opção `arkFormatPowerShell.formatBlockComments` (padrão `false`) para controlar a formatação de comentários de bloco (`<# ... #>`).
  - Desabilitada: o comentário de bloco é preservado sem alteração na indentação interna.
  - Habilitada: o conteúdo é reindentado com base no `indentSize` (delimitadores no nível do código, palavras-chave da comment-based help com um nível e o conteúdo abaixo com dois).
- Comentários de bloco passam a ser tratados como bloco opaco no motor de formatação, evitando que a indentação interna seja achatada.
- Inclusão de testes de regressão para os modos habilitado/desabilitado, indentação aninhada e comentário de bloco em linha única.
- Versão do pacote atualizada de `1.0.9` para `1.1.0`.
- Detalhes: [notes/powershell1.1.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.1.0.md)

## 1.0.9 - 2026-06-27

- Versão do pacote atualizada de `1.0.8` para `1.0.9`.
- Rodada de manutenção de segurança nas dependências (avisos do Dependabot) aplicada via `overrides` no workspace.
- Atualização dos GIFs de demonstração (`media/powershell-settings.gif` e `media/powershell-using.gif`).
- Sem alterações funcionais no motor de formatação.
- Detalhes: [notes/powershell1.0.9.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.9.md)

## 1.0.8 - 2026-05-31

- Versão do pacote atualizada de `1.0.7` para `1.0.8`.
- Auditoria dos cenários equivalentes às regressões corrigidas no Shell (`inline blocks` e blocos aninhados) sem identificação de impacto funcional no formatter de PowerShell.
- Inclusão de cobertura de regressão para `switch` aninhado e `if/else` em uma linha, evitando drift de indentação em futuras mudanças.
- Detalhes: [notes/powershell1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.8.md)

## 1.0.7 - 2026-05-31

- Versão do pacote atualizada de `1.0.6` para `1.0.7`.
- Remoção de log de ativação no `activate`, reduzindo ruído no host da extensão.
- Ajuste no pipeline de publicação para remover passagem explícita de token nas chamadas de `vsce` e `ovsx`.
- Detalhes: [notes/powershell1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.7.md)

## 1.0.6 - 2026-05-27

- Ajuste de documentação bilíngue: links de idioma do README migrados de `raw.githubusercontent.com` para `github.com/.../blob/...`.
- Versão do pacote atualizada de `1.0.5` para `1.0.6`.
- Endurecimento de segurança no workspace de build/publicação: override de `tmp` para `>=0.2.6` no lockfile do monorepo.
- Detalhes: [notes/powershell1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.6.md)

## 1.0.5 - 2026-05-27

- Reestruturação completa do README para o novo padrão de documentação.
- Inclusão de `README.pt-BR.md` com navegação de idiomas EN/PT-BR.
- Correções de consistência na documentação (`lineEnding` alinhado com o default real).
- Versão do pacote atualizada de `1.0.4` para `1.0.5`.
- Detalhes: [notes/powershell1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.5.md)

## 1.0.4 - 2026-05-23

- Limpeza de comandos não utilizados no manifesto e arquivos de localização.
- Atualização de dependência do workspace (`qs` para `6.15.2`).
- Versão do pacote atualizada de `1.0.3` para `1.0.4`.
- Detalhes: [notes/powershell1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.4.md)

## 1.0.3 - 2026-05-22

- Correção de formatação para preservar fechamento de comentário em bloco `#>`.
- Inclusão de testes de regressão para o cenário corrigido.
- Revisão de defaults no README e remoção da seção Autor.
- Versão do pacote atualizada de `1.0.2` para `1.0.3`.
- Detalhes: [notes/powershell1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.3.md)

## 1.0.2 - 2026-05-21

- Correção de integração com VS Code removendo `contributes.languages` (evita impacto em syntax highlighting).
- Versão do pacote atualizada de `1.0.1` para `1.0.2`.
- Detalhes: [notes/powershell1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.2.md)

## 1.0.1 - 2026-05-21

- Ajustes visuais na seção de autor do README (avatar e espaçamento).
- Versão do pacote atualizada de `1.0.0` para `1.0.1`.
- Detalhes: [notes/powershell1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.1.md)

## 1.0.0 - 2026-05-21

- Primeira versão estável do formatador PowerShell.
- Suporte a formatação completa e por seleção, indentação inteligente e `.editorconfig`.
- Detalhes: [notes/powershell1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/powershell1.0.0.md)
