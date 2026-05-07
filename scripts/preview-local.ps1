param(
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = Split-Path -Parent $PSScriptRoot
$PreviewDir = Join-Path $RepoRoot '.preview'
$BackendPidFile = Join-Path $PreviewDir 'backend.pid'
$FrontendPidFile = Join-Path $PreviewDir 'frontend.pid'
$BackendOutLog = Join-Path $PreviewDir 'backend.out.log'
$BackendErrLog = Join-Path $PreviewDir 'backend.err.log'
$FrontendOutLog = Join-Path $PreviewDir 'frontend.out.log'
$FrontendErrLog = Join-Path $PreviewDir 'frontend.err.log'

New-Item -ItemType Directory -Force -Path $PreviewDir | Out-Null

function Stop-ManagedProcess {
  param([string]$PidFile)

  if (-not (Test-Path $PidFile)) {
    return
  }

  $rawPid = (Get-Content $PidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
  if (-not $rawPid) {
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    return
  }

  $pidValue = 0
  if (-not [int]::TryParse($rawPid, [ref]$pidValue)) {
    Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
    return
  }

  $process = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
  if ($process) {
    Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
  }

  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

function Wait-HttpReady {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Url,
    [int]$TimeoutSeconds = 30
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return $true
      }
    } catch {
    }

    Start-Sleep -Milliseconds 800
  }

  return $false
}

function Start-ManagedProcess {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$WorkingDirectory,
    [Parameter(Mandatory = $true)]
    [string]$FilePath,
    [Parameter(Mandatory = $true)]
    [string[]]$ArgumentList,
    [Parameter(Mandatory = $true)]
    [string]$PidFile,
    [Parameter(Mandatory = $true)]
    [string]$StdOutLog,
    [Parameter(Mandatory = $true)]
    [string]$StdErrLog
  )

  foreach ($logFile in @($StdOutLog, $StdErrLog)) {
    if (Test-Path $logFile) {
      Remove-Item -LiteralPath $logFile -Force
    }
  }

  $process = Start-Process `
    -FilePath $FilePath `
    -ArgumentList $ArgumentList `
    -WorkingDirectory $WorkingDirectory `
    -RedirectStandardOutput $StdOutLog `
    -RedirectStandardError $StdErrLog `
    -PassThru

  Set-Content -LiteralPath $PidFile -Value $process.Id
  Write-Host "$Name started with PID $($process.Id)" -ForegroundColor Green
}

Write-Host "Preparing local preview environment..." -ForegroundColor Yellow

Stop-ManagedProcess -PidFile $BackendPidFile
Stop-ManagedProcess -PidFile $FrontendPidFile

Write-Host "Starting PostgreSQL container..." -ForegroundColor Cyan
Push-Location $RepoRoot
try {
  & docker compose -f docker-compose.dev.yml up -d postgres
} finally {
  Pop-Location
}

Push-Location (Join-Path $RepoRoot 'backend')
try {
  Write-Host "Running Prisma migrations..." -ForegroundColor Cyan
  & npx.cmd prisma migrate deploy

  Write-Host "Generating Prisma client..." -ForegroundColor Cyan
  & npx.cmd prisma generate

  if (-not $SkipBuild) {
    Write-Host "Building backend..." -ForegroundColor Cyan
    & npm.cmd run build
  }
} finally {
  Pop-Location
}

Push-Location (Join-Path $RepoRoot 'frontend')
try {
  if (-not $SkipBuild) {
    Write-Host "Building frontend..." -ForegroundColor Cyan
    & npm.cmd run build
  }
} finally {
  Pop-Location
}

Start-ManagedProcess `
  -Name 'Backend preview' `
  -WorkingDirectory (Join-Path $RepoRoot 'backend') `
  -FilePath 'npm.cmd' `
  -ArgumentList @('run', 'start:prod') `
  -PidFile $BackendPidFile `
  -StdOutLog $BackendOutLog `
  -StdErrLog $BackendErrLog

if (-not (Wait-HttpReady -Url 'http://localhost:3001/api/v1/health' -TimeoutSeconds 40)) {
  Write-Host "Backend failed to become ready. Check $BackendOutLog and $BackendErrLog" -ForegroundColor Red
  exit 1
}

Start-ManagedProcess `
  -Name 'Frontend preview' `
  -WorkingDirectory (Join-Path $RepoRoot 'frontend') `
  -FilePath 'npm.cmd' `
  -ArgumentList @('run', 'preview', '--', '--host', '0.0.0.0', '--port', '4173') `
  -PidFile $FrontendPidFile `
  -StdOutLog $FrontendOutLog `
  -StdErrLog $FrontendErrLog

if (-not (Wait-HttpReady -Url 'http://localhost:4173' -TimeoutSeconds 20)) {
  Write-Host "Frontend preview failed to become ready. Check $FrontendOutLog and $FrontendErrLog" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Local preview is ready." -ForegroundColor Green
Write-Host "Frontend: http://localhost:4173"
Write-Host "Backend:  http://localhost:3001/api/v1/health"
Write-Host "Docs:     http://localhost:3001/api/docs"
Write-Host ""
Write-Host "Logs:"
Write-Host " - $BackendOutLog"
Write-Host " - $BackendErrLog"
Write-Host " - $FrontendOutLog"
Write-Host " - $FrontendErrLog"
