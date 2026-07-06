# Ark Format

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

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

| Pacote                                               | Descrição                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [packages/shell](packages/shell/README.md)           | Extensão de formatação para Shell (`.sh`, `.bash`, `.zsh`, `.ksh`, `.tcsh`, `.azcli`, `.bats`)      |
| [packages/powershell](packages/powershell/README.md) | Extensão de formatação para PowerShell (`.ps1`, `.psm1`, `.psd1`)                                   |
| [packages/makefile](packages/makefile/README.md)     | Extensão de formatação para Makefile (`Makefile`, `GNUmakefile`, `*.mk`)                            |
| [packages/pack](packages/pack/README.md)             | Extension Pack que instala Shell + PowerShell em conjunto                                           |
| [packages/shared](packages/shared)                   | Código compartilhado entre os pacotes (lexer, indentação, utilitários e processamento de documento) |

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
2. Execute a task `pnpm: watch shell` ou `pnpm: watch powershell`
3. Pressione `F5` para abrir o Extension Host e validar a extensão localmente

---

## 🤝 Contribuição

- Leia o README de cada pacote antes de abrir um PR
- Siga as regras de lint compartilhadas em `configs/eslint.base.mjs`
- Rode build e testes localmente antes de enviar alterações

---

## 💖 Apoie

Se este projeto ajuda no seu dia a dia, considere apoiar o desenvolvimento:

- 💙 [GitHub Sponsors](https://github.com/sponsors/paulosfjunior)
- ☕ [Ko-fi](https://ko-fi.com/paulosfjunior)
- 💸 [PayPal](https://www.paypal.com/donate/?business=62KETU4PXBWZC&no_recurring=0&item_name=Ol%C3%A1%21+Sou+o+fundador+e+mantenedor+da+Tooark+%28tooark.com%29+%E2%80%94%0Aum+ecossistema+de+projetos+open+source.%0AObrigado+pelo+apoio%21+%F0%9F%92%9A&currency_code=BRL)

Cada contribuição ajuda a manter o projeto ativo e em evolução. Obrigado! 🙏

---

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
