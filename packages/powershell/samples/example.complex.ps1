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
