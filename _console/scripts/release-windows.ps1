Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Wait-ForFreshArtifact {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [datetime]$StartedAt,
    [int]$TimeoutSeconds = 180
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  do {
    if (Test-Path -LiteralPath $Path) {
      $item = Get-Item -LiteralPath $Path
      if ($item.LastWriteTime -ge $StartedAt.AddSeconds(-1)) {
        return
      }
    }

    Start-Sleep -Milliseconds 500
  } while ((Get-Date) -lt $deadline)

  throw "Timed out waiting for fresh artifact: $Path"
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$consoleRoot = Split-Path -Parent $scriptRoot
$tauriCli = Join-Path $consoleRoot 'app\node_modules\.bin\tauri.cmd'
$appPackage = Get-Content -LiteralPath (Join-Path $consoleRoot 'app\package.json') -Raw | ConvertFrom-Json

if (-not (Test-Path -LiteralPath $tauriCli)) {
  throw "Missing local Tauri CLI: $tauriCli"
}

$versionRaw = [string]$appPackage.version
if ([string]::IsNullOrWhiteSpace($versionRaw)) {
  throw 'Could not resolve version from app/package.json.'
}

$sourceExe = Join-Path $consoleRoot 'src-tauri\target\release\codewinter-operator-console.exe'
$sourceSetup = Join-Path $consoleRoot ("src-tauri\target\release\bundle\nsis\CodeWinter Operator Console_{0}_x64-setup.exe" -f $versionRaw)
$startedAt = Get-Date

$tauriArgs = @(
  'build',
  '--config',
  'src-tauri/tauri.conf.json',
  '--bundles',
  'nsis'
)

Push-Location $consoleRoot
try {
  $process = Start-Process -FilePath $tauriCli -ArgumentList $tauriArgs -NoNewWindow -Wait -PassThru
  if ($process.ExitCode -ne 0) {
    throw "tauri build failed with exit code $($process.ExitCode)"
  }

  Wait-ForFreshArtifact -Path $sourceExe -StartedAt $startedAt
  Wait-ForFreshArtifact -Path $sourceSetup -StartedAt $startedAt

  & (Join-Path $scriptRoot 'publish-windows-release.ps1')
} finally {
  Pop-Location
}
