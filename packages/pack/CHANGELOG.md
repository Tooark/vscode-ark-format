# Changelog

Todas as mudanças relevantes do pacote `ark-format` (extension pack) estão documentadas aqui.

## 1.1.1 - 2026-07-06

- Versão do pacote atualizada de `1.1.0` para `1.1.1`.
- Campo `sponsor` adicionado ao manifesto da extensão, habilitando o botão de apoio (GitHub Sponsors) na página do Marketplace.
- Alinhamento do extension pack com a rodada de atualização das extensões (`shell1.0.12`, `powershell1.2.1`, `makefile1.0.1`): link de sponsor nos manifests e GIFs de demonstração regenerados.
- Sem alterações funcionais no extension pack.
- Detalhes: [notes/pack1.1.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.1.1.md)

## 1.1.0 - 2026-07-05

- Versão do pacote atualizada de `1.0.9` para `1.1.0`.
- Inclusão da extensão `tooark.ark-format-makefile` (versão inicial `1.0.0`) no extension pack.
- O pack agora instala os formatadores de Shell, PowerShell e Makefile em conjunto.
- Atualização de READMEs (EN/PT-BR) e keywords para refletir o suporte a Makefile.
- Seção de apoio (Support) adicionada aos READMEs (EN/PT-BR).
- Detalhes: [notes/pack1.1.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.1.0.md)

## 1.0.9 - 2026-06-27

- Versão do pacote atualizada de `1.0.8` para `1.0.9`.
- Alinhamento do extension pack com a rodada de manutenção de segurança dos formatadores (`ark-format-shell` e `ark-format-powershell` com atualização de dependências vulneráveis dos avisos do Dependabot).
- Sem alterações de configuração do extension pack além do alinhamento de release.
- Detalhes: [notes/pack1.0.9.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.9.md)

## 1.0.8 - 2026-05-31

- Versão do pacote atualizada de `1.0.7` para `1.0.8`.
- Alinhamento do extension pack com a release de manutenção dos formatadores:
  - Shell com correções de `fi` inline e `case` aninhado.
  - PowerShell com reforço de cobertura de regressão para cenários análogos.
- Sem mudanças funcionais adicionais no extension pack além do alinhamento de release.
- Detalhes: [notes/pack1.0.8.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.8.md)

## 1.0.7 - 2026-05-31

- Versão do pacote atualizada de `1.0.6` para `1.0.7`.
- Ajuste no pipeline de publicação para remover passagem explícita de token nas chamadas de `vsce` e `ovsx`, reduzindo exposição de segredos em linha de comando.
- Detalhes: [notes/pack1.0.7.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.7.md)

## 1.0.6 - 2026-05-27

- Ajuste de documentação bilíngue: links de idioma do README migrados de `raw.githubusercontent.com` para `github.com/.../blob/...`.
- Versão do pacote atualizada de `1.0.5` para `1.0.6`.
- Endurecimento de segurança no workspace de build/publicação: override de `tmp` para `>=0.2.6` no lockfile do monorepo.
- Detalhes: [notes/pack1.0.6.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.6.md)

## 1.0.5 - 2026-05-27

- Reestruturação completa do README do extension pack para o novo padrão de documentação.
- Inclusão de `README.pt-BR.md` com navegação de idiomas EN/PT-BR.
- Melhoria na apresentação dos links de instalação (VS Marketplace e Open VSX).
- Alinhamento da descrição do pacote com o objetivo do extension pack (Shell + PowerShell).
- Versão do pacote atualizada de `1.0.4` para `1.0.5`.
- Detalhes: [notes/pack1.0.5.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.5.md)

## 1.0.4 - 2026-05-23

- Alinhamento da versão do extension pack com as releases de Shell e PowerShell.
- Atualização de dependência do workspace (`qs` para `6.15.2`).
- Versão do pacote atualizada de `1.0.3` para `1.0.4`.
- Detalhes: [notes/pack1.0.4.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.4.md)

## 1.0.3 - 2026-05-22

- README atualizado com links de instalação para VS Marketplace e Open VSX.
- Adição de nota de compatibilidade entre VS Code e VSCodium/compatíveis.
- Remoção da seção Autor do README.
- Versão do pacote atualizada de `1.0.2` para `1.0.3`.
- Detalhes: [notes/pack1.0.3.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.3.md)

## 1.0.2 - 2026-05-21

- Alinhamento de versão com os pacotes relacionados (`ark-format-shell` e `ark-format-powershell`).
- Versão do pacote atualizada de `1.0.1` para `1.0.2`.
- Detalhes: [notes/pack1.0.2.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.2.md)

## 1.0.1 - 2026-05-21

- Atualização do link da imagem no README para URL absoluta no repositório.
- Ajustes visuais na seção de autor do README (avatar e espaçamento).
- Versão do pacote atualizada de `1.0.0` para `1.0.1`.
- Detalhes: [notes/pack1.0.1.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.1.md)

## 1.0.0 - 2026-05-21

- Primeira versão do extension pack Ark Format.
- Instalação conjunta dos formatadores Shell e PowerShell.
- Detalhes: [notes/pack1.0.0.md](https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/notes/pack1.0.0.md)
