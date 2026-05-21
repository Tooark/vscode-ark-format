<#
    .SYNOPSIS
        Exemplo de script PowerShell bem formatado.
    
    .DESCRIPTION
        Este script demonstra uma formatação adequada de código PowerShell
        usando a extensão Ark Format PowerShell.
    
    .PARAMETER Name
        O nome da pessoa a ser saudada.
    
    .PARAMETER Greeting
        A mensagem de saudação customizada.
    
    .EXAMPLE
        .\example.ps1 -Name "João"
    
    .EXAMPLE
        .\example.ps1 -Name "Maria" -Greeting "Bom dia"
#>

param (
    [Parameter(Mandatory = $false)]
    [string]$Name = "Mundo",
    
    [Parameter(Mandatory = $false)]
    [string]$Greeting = "Olá"
)

function Get-FormattedOutput {
    param (
        [string]$Message
    )

    $output = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Message   = $Message
    }

    return $output
}

function Test-Connection {
    [CmdletBinding()]
    param (
        [string]$Computer
    )

    try {
        if (Test-NetConnection -ComputerName $Computer -WarningAction SilentlyContinue) {
            Write-Host "Conectado a $Computer" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "Falha ao conectar a $Computer" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Error "Erro ao testar conexão: $_"
        return $false
    }
}

# Corpo principal do script
Write-Host "$Greeting, $Name!" -ForegroundColor Cyan

$output = Get-FormattedOutput -Message "Script iniciado"
Write-Host ($output | ConvertTo-Json)

# Teste de conexão
foreach ($computer in @("localhost", "127.0.0.1")) {
    Test-Connection -Computer $computer
}

Write-Host "Script finalizado" -ForegroundColor Green
