$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = Split-Path -Parent $PSScriptRoot
$PreviewDir = Join-Path $RepoRoot '.preview'
$BackendPidFile = Join-Path $PreviewDir 'backend.pid'
$FrontendPidFile = Join-Path $PreviewDir 'frontend.pid'

function Stop-ManagedProcess {
  param([string]$PidFile)

  if (-not (Test-Path $PidFile)) {
    return
  }

  $rawPid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  $pidValue = 0
  if ($rawPid -and [int]::TryParse($rawPid, [ref]$pidValue)) {
    $process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
    if ($process) {
      Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped PID $pidValue" -ForegroundColor Green
    }
  }

  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

Stop-ManagedProcess -PidFile $BackendPidFile
Stop-ManagedProcess -PidFile $FrontendPidFile

Write-Host "Local preview processes have been stopped." -ForegroundColor Green
