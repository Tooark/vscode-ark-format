Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Set-Location $PSScriptRoot

# --------------------------------------------------------------------------- #
# Job Object do Windows (KILL_ON_JOB_CLOSE): atribuindo ESTE processo ao job,
# o uvicorn --reload (processo neto) herda a associacao. Ao fechar a janela do
# terminal ou matar o script -- casos em que o finally nao roda -- o SO mata a
# arvore inteira, liberando a porta 8000.
# --------------------------------------------------------------------------- #
if (-not ('Win32Job' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class Win32Job {
[DllImport("kernel32.dll", CharSet = CharSet.Unicode)]
static extern IntPtr CreateJobObject(IntPtr a, string n);
[DllImport("kernel32.dll", SetLastError = true)]
static extern bool SetInformationJobObject(IntPtr h, int t, IntPtr i, uint c);
[DllImport("kernel32.dll", SetLastError = true)]
static extern bool AssignProcessToJobObject(IntPtr h, IntPtr p);
[StructLayout(LayoutKind.Sequential)]
struct BASIC { public long a; public long b; public uint LimitFlags;
    public UIntPtr c; public UIntPtr d; public uint e; public UIntPtr f;
    public uint g; public uint h; }
[StructLayout(LayoutKind.Sequential)]
struct IOC { public ulong a, b, c, d, e, f; }
[StructLayout(LayoutKind.Sequential)]
struct EXT { public BASIC Basic; public IOC Io; public UIntPtr a;
    public UIntPtr b; public UIntPtr c; public UIntPtr d; }
public static IntPtr CreateKillOnClose() {
    IntPtr h = CreateJobObject(IntPtr.Zero, null);
    if (h == IntPtr.Zero) throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
    var info = new EXT();
    info.Basic.LimitFlags = 0x2000; // JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
    int len = Marshal.SizeOf(info);
    IntPtr p = Marshal.AllocHGlobal(len);
    try {
        Marshal.StructureToPtr(info, p, false);
        if (!SetInformationJobObject(h, 9, p, (uint)len)) // JobObjectExtendedLimitInformation
            throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
    } finally { Marshal.FreeHGlobal(p); }
    return h;
}
public static void AssignCurrent(IntPtr h) {
    if (!AssignProcessToJobObject(h, System.Diagnostics.Process.GetCurrentProcess().Handle))
        throw new System.ComponentModel.Win32Exception(Marshal.GetLastWin32Error());
}
}
'@
}

try {
$script:killJob = [Win32Job]::CreateKillOnClose()
[Win32Job]::AssignCurrent($script:killJob)
}
catch {
Write-Warning ("Nao foi possivel ativar o Job Object ({0}). Fechar a janela pode deixar o uvicorn orfao; use Ctrl+C para encerrar." -f $_.Exception.Message)
}

$venvPath  = Join-Path $PSScriptRoot '.venv'
$pythonExe = Join-Path $venvPath 'Scripts\python.exe'

if (-not (Test-Path $venvPath -PathType Container)) {
Write-Host '==> Criando virtualenv...'
python -m venv .venv
}

if (-not (Test-Path $pythonExe -PathType Leaf)) {
throw 'Python do virtualenv nao encontrado em .venv\Scripts\python.exe. Execute primeiro .\install.ps1 na raiz.'
}

if (-not (Test-Path '.env' -PathType Leaf)) {
throw '.env nao encontrado. Execute primeiro .\install.ps1 na raiz.'
}

Write-Host '==> Subindo API em http://127.0.0.1:8000 ...'

# Start-Process -PassThru nos da o objeto do processo para limpeza. O uvicorn
# roda com --reload, entao o processo principal e um "reloader" que gera um
# worker neto. Em Ctrl+C esse neto costuma ficar orfao preso na porta 8000,
# por isso o finally mata a arvore inteira com taskkill /T.
$uvicorn = Start-Process -FilePath $pythonExe `
-ArgumentList @('-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload') `
-NoNewWindow -PassThru

try {
Wait-Process -Id $uvicorn.Id
}
finally {
if ($null -ne $uvicorn -and -not $uvicorn.HasExited) {
& taskkill.exe /PID $uvicorn.Id /T /F 2>$null | Out-Null
if ($LASTEXITCODE -ne 0 -and -not $uvicorn.HasExited) {
  Stop-Process -Id $uvicorn.Id -Force -ErrorAction SilentlyContinue
}
}
}
