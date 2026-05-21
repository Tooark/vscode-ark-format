@{
    RootModule        = 'example.psm1'
    ModuleVersion     = '1.0.0'
    GUID              = 'd3ed3f5e-6b5c-4e1d-8f9a-2b3c4d5e6f7a'
    Author            = 'Tooark'
    CompanyName       = 'Tooark'
    Description       = 'Módulo de exemplo com manifesto bem formatado'
    PowerShellVersion = '5.1'
    
    FunctionsToExport = @(
        'Get-EnvironmentInfo'
        'Invoke-Backup'
    )
    
    CmdletsToExport   = @()
    VariablesToExport = @()
    AliasesToExport   = @()
    
    PrivateData       = @{
        PSData = @{
            Tags       = @('PowerShell', 'Utility', 'Example')
            LicenseUri = 'https://github.com/Tooark/example/LICENSE'
            ProjectUri = 'https://github.com/Tooark/example'
        }
    }
}
