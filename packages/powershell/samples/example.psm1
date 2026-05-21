<#
    .SYNOPSIS
        Exemplo de módulo PowerShell.
    
    .DESCRIPTION
        Módulo que contém funções utilitárias.
#>

function Get-EnvironmentInfo {
    [CmdletBinding()]
    param ()

    $info = @{
        OS       = [System.Environment]::OSVersion.Platform
        User     = [System.Environment]::UserName
        Machine  = [System.Environment]::MachineName
        PSVersion = $PSVersionTable.PSVersion.ToString()
    }

    return $info
}

function Invoke-Backup {
    param (
        [string]$SourcePath,
        [string]$DestinationPath,
        [switch]$Recursive
    )

    if (-not (Test-Path -Path $SourcePath)) {
        Write-Error "Caminho de origem não encontrado: $SourcePath"
        return $false
    }

    try {
        if ($Recursive) {
            Copy-Item -Path $SourcePath -Destination $DestinationPath -Recurse -Force
        }
        else {
            Copy-Item -Path $SourcePath -Destination $DestinationPath -Force
        }

        Write-Host "Backup concluído com sucesso" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Error "Erro durante backup: $_"
        return $false
    }
}

Export-ModuleMember -Function @('Get-EnvironmentInfo', 'Invoke-Backup')
