# Ark Format

[![CI](https://github.com/Tooark/vscode-ark-format/actions/workflows/ci.yml/badge.svg)](https://github.com/Tooark/vscode-ark-format/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-sponsor-EA4AAA?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/paulosfjunior)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-apoie-FF5E5B?logo=kofi&logoColor=white)](https://ko-fi.com/paulosfjunior)

Monorepo oficial das extensões **Ark Format** para o Visual Studio Code.
O projeto reúne formatadores para **Shell**, **PowerShell** e **Makefile**, além de um pacote agregador e bibliotecas compartilhadas.

🌍 **Idiomas:** [![USA Flag](https://flagcdn.com/w20/us.png) English](https://github.com/Tooark/vscode-ark-format/blob/main/README.md) · ![Brazil Flag](https://flagcdn.com/w20/br.png) **Português (este arquivo)**

---

<img src="https://raw.githubusercontent.com/Tooark/vscode-ark-format/main/packages/pack/assets/image.png" width="480" alt="Prévia do pacote de extensões Ark Format" />

---

## ✨ Visão Geral

- 🎯 **Formatação consistente** para Shell, PowerShell e Makefile
- 📦 **Pacotes separados por responsabilidade** (formatadores, pack e código compartilhado)
- 🧩 **Monorepo com pnpm workspaces** para build, teste e lint unificados
- ⚡ **Fluxo de desenvolvimento rápido** com tasks e debug no VS Code

---

## 📦 Pacotes

| Pacote                                               | Versão                                   | Instalações                                   | Descrição                                                                                           |
| ---------------------------------------------------- | ---------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [packages/shell](packages/shell/README.md)           | [![Versão][shell-v]][shell-mp]           | [![Instalações][shell-i]][shell-mp]           | Extensão de formatação para Shell (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`)      |
| [packages/powershell](packages/powershell/README.md) | [![Versão][powershell-v]][powershell-mp] | [![Instalações][powershell-i]][powershell-mp] | Extensão de formatação para PowerShell (`.ps1`, `.psm1`, `.psd1`)                                   |
| [packages/makefile](packages/makefile/README.md)     | [![Versão][makefile-v]][makefile-mp]     | [![Instalações][makefile-i]][makefile-mp]     | Extensão de formatação para Makefile (`Makefile`, `GNUmakefile`, `*.mk`)                            |
| [packages/pack](packages/pack/README.md)             | [![Versão][pack-v]][pack-mp]             | [![Instalações][pack-i]][pack-mp]             | Extension Pack que instala Shell + PowerShell em conjunto                                           |
| [packages/shared](packages/shared)                   | ![Interno][internal-badge]               | —                                             | Código compartilhado entre os pacotes (lexer, indentação, utilitários e processamento de documento) |

[shell-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format-shell?label=vers%C3%A3o
[shell-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format-shell?label=instala%C3%A7%C3%B5es
[shell-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-shell
[powershell-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format-powershell?label=vers%C3%A3o
[powershell-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format-powershell?label=instala%C3%A7%C3%B5es
[powershell-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-powershell
[makefile-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format-makefile?label=vers%C3%A3o
[makefile-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format-makefile?label=instala%C3%A7%C3%B5es
[makefile-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format-makefile
[pack-v]: https://img.shields.io/visual-studio-marketplace/v/tooark.ark-format?label=vers%C3%A3o
[pack-i]: https://img.shields.io/visual-studio-marketplace/i/tooark.ark-format?label=instala%C3%A7%C3%B5es
[pack-mp]: https://marketplace.visualstudio.com/items?itemName=tooark.ark-format
[internal-badge]: https://img.shields.io/badge/interno-n%C3%A3o%20publicado-lightgrey

---

## 🚀 Primeiros Passos

Instale as dependências na raiz do repositório:

```bash
pnpm install
```

Build do monorepo:

```bash
pnpm run build
```

Watch mode para desenvolvimento:

```bash
pnpm run watch
```

Lint em todos os pacotes que possuem o script:

```bash
pnpm run lint
```

---

## 🧪 Testes

Executar os testes de todo o monorepo:

```bash
pnpm run test
```

Executar os testes de um pacote específico (exemplo: PowerShell):

```bash
cd packages/powershell
pnpm test
```

Gerar cobertura de um pacote específico (exemplo: PowerShell):

```bash
cd packages/powershell
pnpm exec vitest run --coverage
```

---

## 📦 Empacotamento

Gerar o `.vsix` de todos os pacotes que possuem o script:

```bash
pnpm run package
```

---

## 🧩 Desenvolvimento no VS Code

O diretório `.vscode/` contém configurações de tasks e debug para facilitar o desenvolvimento local.

Fluxo recomendado:

1. Abra o workspace no VS Code
2. Execute a task `pnpm: watch shell`, `pnpm: watch powershell` ou `pnpm: watch makefile` para iniciar o watch mode do pacote desejado
3. Pressione `F5` para abrir o Extension Host e validar a extensão localmente

---

## 🤝 Contribuição

Contribuições são bem-vindas! Comece pelo [CONTRIBUTING.md](CONTRIBUTING.md) — ele
descreve a estrutura do repositório, o fluxo de desenvolvimento, a convenção de
commits, a exigência de sign-off (DCO) e o processo de release.

Em resumo:

- Leia o README de cada pacote antes de abrir um PR
- Siga as regras de lint compartilhadas em `configs/eslint.base.mjs`
- Rode build e testes localmente antes de enviar alterações
- Assine todos os commits (`git commit -s`) — há um check de CI que valida isso

Ao participar, você concorda com o [Código de Conduta](CODE_OF_CONDUCT.md).

---

## 🆘 Ajuda & Segurança

- ❓ **Dúvidas, bugs e ideias** — veja o [SUPPORT.md](SUPPORT.md) para escolher o canal certo
- 🔒 **Vulnerabilidades de segurança** — **não** abra issue pública; siga o [SECURITY.md](SECURITY.md)

---

## 💖 Apoie

Se este projeto ajuda no seu dia a dia, considere apoiar o desenvolvimento:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)

Cada contribuição ajuda a manter o projeto ativo e em evolução. Obrigado! 🙏

---

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
