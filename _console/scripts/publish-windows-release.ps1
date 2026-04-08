Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-JsonValue {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  Get-Content -LiteralPath $Path -Raw | ConvertFrom-Json
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$consoleRoot = Split-Path -Parent $scriptRoot

$appPackage = Get-JsonValue -Path (Join-Path $consoleRoot 'app\package.json')
$tauriConfig = Get-JsonValue -Path (Join-Path $consoleRoot 'src-tauri\tauri.conf.json')

$versionRaw = [string]$appPackage.version
if ([string]::IsNullOrWhiteSpace($versionRaw)) {
  throw 'Could not resolve version from app/package.json.'
}

$versionTag = if ($versionRaw.StartsWith('v')) { $versionRaw } else { "v$versionRaw" }
$productName = [string]$tauriConfig.productName
if ([string]::IsNullOrWhiteSpace($productName)) {
  $productName = 'CodeWinter Operator Console'
}

$sourceExe = Join-Path $consoleRoot 'src-tauri\target\release\codewinter-operator-console.exe'
$sourceSetup = Join-Path $consoleRoot ("src-tauri\target\release\bundle\nsis\{0}_{1}_x64-setup.exe" -f $productName, $versionRaw)

if (-not (Test-Path -LiteralPath $sourceExe)) {
  throw "Missing executable: $sourceExe"
}

if (-not (Test-Path -LiteralPath $sourceSetup)) {
  throw "Missing setup bundle: $sourceSetup"
}

$releasesRoot = Join-Path $consoleRoot 'releases\windows'
$versionDir = Join-Path $releasesRoot $versionTag
$currentDir = Join-Path $releasesRoot 'current'

New-Item -ItemType Directory -Force -Path $versionDir | Out-Null
New-Item -ItemType Directory -Force -Path $currentDir | Out-Null

$versionDirResolved = (Resolve-Path -LiteralPath $versionDir).Path
$currentDirResolved = (Resolve-Path -LiteralPath $currentDir).Path

$versionExe = Join-Path $versionDirResolved 'CodeWinter-operator-console.exe'
$versionSetup = Join-Path $versionDirResolved 'CodeWinter-operator-console-setup.exe'
$currentExe = Join-Path $currentDirResolved 'CodeWinter-operator-console.exe'
$currentSetup = Join-Path $currentDirResolved 'CodeWinter-operator-console-setup.exe'

Copy-Item -LiteralPath $sourceExe -Destination $versionExe -Force
Copy-Item -LiteralPath $sourceSetup -Destination $versionSetup -Force

$currentWarning = $null
try {
  Copy-Item -LiteralPath $sourceSetup -Destination $currentSetup -Force
  Copy-Item -LiteralPath $sourceExe -Destination $currentExe -Force
} catch {
  $currentWarning = 'Current release directory could not be fully updated because one or more files are in use.'
}

$releaseNote = @"
# CodeWinter Operator Console Windows Release

- Product: $productName
- Version: $versionTag
- Built At: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## Files

- CodeWinter-operator-console.exe
- CodeWinter-operator-console-setup.exe
"@

if ($currentWarning) {
  $releaseNote += "`n`n## Current Alias`n`n- Warning: $currentWarning`n"
}

$versionReleaseNote = Join-Path $versionDirResolved 'RELEASE.md'
$currentReleaseNote = Join-Path $currentDirResolved 'RELEASE.md'

$releaseNote | Set-Content -LiteralPath $versionReleaseNote -Encoding UTF8

if (-not $currentWarning) {
  $releaseNote | Set-Content -LiteralPath $currentReleaseNote -Encoding UTF8
}

Write-Host "Published Windows release to $versionDirResolved"
if ($currentWarning) {
  Write-Warning $currentWarning
} else {
  Write-Host "Updated current release at $currentDirResolved"
}
