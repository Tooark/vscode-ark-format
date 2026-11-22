<#
.SYNOPSIS
    Exemplo robusto para validar formatacao de PowerShell.

.DESCRIPTION
    Este script exercita cenarios comuns e mais complexos:
    - Bloco param multilinha
    - Comentarios de linha e bloco
    - Hashtable e arrays
    - Try/Catch/Finally
    - Pipeline e filtros
    - Here-string
    - Subexpressoes "$(...)" com aspas aninhadas
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$Environment = "dev",

    [Parameter(Mandatory = $false)]
    [int]$TimeoutSeconds = 30,

    [Parameter(Mandatory = $false)]
    [string[]]$Servers = @("srv-app-01", "srv-app-02", "srv-db-01"),

    [Parameter(Mandatory = $false)]
    [switch]$Detailed
)

$config = @{
    RetryCount = 3
    DelayMs    = 250
    Owner      = "time-plataforma"
    Tags       = @("formatter", "teste", "powershell")
}

# Comentario: conteudo abaixo ajuda a validar preservacao de strings multilinha.
$banner = @"
Ambiente : $Environment
Timeout  : $TimeoutSeconds
Detalhado: $Detailed
"@

Write-Host "=== Inicio da rotina de validacao ===" -ForegroundColor Cyan
Write-Host $banner

# Comentario: aspas dentro de uma subexpressao "$(...)" formam um novo contexto e nao
# fecham a string externa (equivalente PowerShell da issue #34 do formatador Shell).
$quotedOwner = '"{0}"' -f $config.Owner
Write-Host "Responsavel: $($quotedOwner.Trim('"'))"
Write-Host "Tags: $(
    ($config.Tags | ForEach-Object { "'$_'" }) -join ', '
)"

function Invoke-ServerCheck {
    param (
        [string]$ServerName,
        [int]$Timeout,
        [hashtable]$Options
    )

    # Simula tratamento de fluxo com try/catch/finally.
    try {
        if ([string]::IsNullOrWhiteSpace($ServerName)) {
            throw "Nome de servidor invalido."
        }

        $result = [pscustomobject]@{
            Server     = $ServerName
            Reachable  = $true
            Timeout    = $Timeout
            RetryCount = $Options.RetryCount
            Timestamp  = (Get-Date)
        }

        return $result
    }
    catch {
        Write-Warning "Falha ao validar servidor '$ServerName': $_"

        return [pscustomobject]@{
            Server     = $ServerName
            Reachable  = $false
            Timeout    = $Timeout
            RetryCount = $Options.RetryCount
            Timestamp  = (Get-Date)
        }
    }
    finally {
        if ($Detailed) {
            Write-Verbose "Finalizada validacao do servidor $ServerName" -Verbose
        }
    }
}

$checks = foreach ($server in $Servers) {
    Invoke-ServerCheck -ServerName $server -Timeout $TimeoutSeconds -Options $config
}

$unreachable = $checks | Where-Object { -not $_.Reachable }

if ($unreachable.Count -gt 0) {
    Write-Host "Servidores com falha:" -ForegroundColor Yellow
    $unreachable | ForEach-Object {
        Write-Host (" - {0} (timeout: {1}s)" -f $_.Server, $_.Timeout)
    }
}
else {
    Write-Host "Todos os servidores estao acessiveis." -ForegroundColor Green
}

# Saida final para facilitar verificacao visual em testes.
$checks |
    Sort-Object Server |
    Select-Object Server, Reachable, Timeout, RetryCount, Timestamp |
    Format-Table -AutoSize

Write-Host "=== Fim da rotina de validacao ===" -ForegroundColor Cyan

# Blocos de uma linha seguidos de catch/else, # no meio de palavras e diretivas (1.2.6)
# As clausulas ficam no nivel do bloco, o # de C# e de URLs nao inicia comentario,
# ${...} e mantido como esta e #region/#endregion continuam sem espaco apos o #.
#region Blocos de uma linha
function Test-InlineBlocks {
    param([int]$Value)

    try { $result = 10 / $Value }
    catch { $result = 0 }

    if ($result -gt 1) { $label = 'alto' }
    elseif ($result -eq 1) { $label = 'um' }
    else { $label = 'baixo' }

    $map = @{
        If = 1
        Else = 2
        Catch = 3
    }

    ${total geral} = $map.If + $map.Else + $map.Catch

    $languages = @('C#', 'F#') | ForEach-Object {
        "{0}   ({1})" -f $_, $label
    }

    Write-Output C# "a   b" https://example.com/#/rota ${total geral}
    $languages
}
#endregion

Test-InlineBlocks -Value 5
