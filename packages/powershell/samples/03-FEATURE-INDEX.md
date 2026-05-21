# 🗺️ Exemplos da Extensão — Índice Completo

**Ordem sugerida:** 3 de 7 (essencial)  
**Anterior:** [`02-USER-GUIDE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/02-USER-GUIDE.md)  
**Próximo:** [`04-TECHNICAL-SUMMARY.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/04-TECHNICAL-SUMMARY.md)

Índice completo de features e casos de uso demonstrados pelos exemplos.

## 🎯 Mapa Rápido

### Por Nível de Complexidade

#### **Básico (Iniciante)**

```plaintext
1. example.ps1              ← if/else, switch, funções, cmdlets comuns
```

#### **Intermediário**

```plaintext
2. example.psm1             ← Módulo PowerShell, Export-ModuleMember
3. example.psd1             ← Manifesto de módulo, hashtables e metadados
```

#### **Avançado**

```plaintext
4. example.complex.ps1      ← Param multilinha, try/catch/finally, pipelines
```

### Por Caso de Uso

| Caso                    | Arquivo               | Quando Usar                                                       |
| ----------------------- | --------------------- | ----------------------------------------------------------------- |
| **Scripts Genéricos**   | `example.ps1`         | Scripts PowerShell comuns, sem estrutura de módulo                |
| **Módulos PowerShell**  | `example.psm1`        | Desenvolvimento de módulos, organização de funções                |
| **Manifests de Módulo** | `example.psd1`        | Criação de manifestos, hashtables complexas                       |
| **Scripts Complexos**   | `example.complex.ps1` | Scripts com bloco param, validação, logging e tratamento de erros |

## ✨ Features Demonstradas

### Estruturas de Controle

```plaintext
✓ if/elseif/else
✓ switch com condições e default
✓ foreach/for/while
✓ try/catch/finally
✓ funções com blocos param
```

### Variáveis e Tipos

```plaintext
✓ Variáveis tipadas ([string], [int], [switch])
✓ Arrays e coleções de strings
✓ Hashtables (@{})
✓ PSCustomObject para dados estruturados
✓ Subexpressões e interpolação em strings
✓ Valores padrão em parâmetros
```

### I/O e Redirecionamento

```plaintext
✓ Here-strings (@"..."@ e @'...'@)
✓ Pipeline com Where-Object/ForEach-Object
✓ Saída com Write-Host/Write-Error/Write-Warning
✓ Conversão e serialização (ConvertTo-Json)
✓ Formatação tabular (Format-Table)
```

### Features Avançadas

```plaintext
✓ CmdletBinding e parâmetros opcionais
✓ Tratamento de erro com exceções
✓ Relatórios com objetos e seleção de propriedades
✓ Bloco param multilinha com atributos [Parameter]
✓ Testes de comportamento do formatter por cenário real
✓ Organização de exemplos por script, módulo e manifesto
```

## 🚀 Como Começar

Para instruções passo a passo, consulte [`01-QUICK-START.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/01-QUICK-START.md).

## 🔗 Recursos Externos

Consulte [`02-USER-GUIDE.md`](https://github.com/Tooark/vscode-ark-format/blob/main/packages/powershell/samples/02-USER-GUIDE.md) para links de recursos e documentação externa.

## 📝 Notas de Compatibilidade

| Ambiente                            | Compatível | Notas                                          |
| ----------------------------------- | ---------- | ---------------------------------------------- |
| PowerShell 5.1 (Windows PowerShell) | ✅ Sim     | Compatível com scripts tradicionais em Windows |
| PowerShell 7+ (pwsh)                | ✅ Sim     | Compatível e recomendado para multiplataforma  |
| Arquivos `.ps1`                     | ✅ Sim     | Scripts gerais                                 |
| Arquivos `.psm1`                    | ✅ Sim     | Módulos PowerShell                             |
| Arquivos `.psd1`                    | ✅ Sim     | Manifestos de módulo                           |

## ❓ Troubleshooting

| Problema                                          | Solução                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- |
| Arquivo `.ps1` não formata                        | Defina `tooark.ark-format-powershell` como formatter padrão para PowerShell |
| Indentação em seleção ficou diferente do esperado | Ative `arkFormatPowerShell.rangeFormatting.useDocumentContext`              |
| Bloco `param (...)` não indentou                  | Verifique se está em formato multilinha com `param (` e fechamento em `)`   |
| Diferença de quebra de linha entre arquivos       | Ajuste `arkFormatPowerShell.lineEnding` para `LF`, `CRLF` ou `Auto`         |
