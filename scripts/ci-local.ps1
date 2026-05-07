param(
  [ValidateSet('safe', 'full')]
  [string]$Mode = 'safe'
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$RepoRoot = Split-Path -Parent $PSScriptRoot
$CompletedSteps = New-Object System.Collections.Generic.List[string]

function Invoke-Step {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,
    [Parameter(Mandatory = $true)]
    [string]$WorkingDirectory,
    [Parameter(Mandatory = $true)]
    [scriptblock]$Action
  )

  Write-Host ""
  Write-Host "==> $Name" -ForegroundColor Cyan

  Push-Location $WorkingDirectory
  try {
    & $Action
    $CompletedSteps.Add($Name) | Out-Null
    Write-Host "<== $Name passed" -ForegroundColor Green
  }
  finally {
    Pop-Location
  }
}

Write-Host "Running local CI ($Mode mode) from $RepoRoot" -ForegroundColor Yellow

Invoke-Step -Name 'Backend lint' -WorkingDirectory (Join-Path $RepoRoot 'backend') -Action {
  & npm.cmd run lint
}

Invoke-Step -Name 'Backend typecheck' -WorkingDirectory (Join-Path $RepoRoot 'backend') -Action {
  & npx.cmd tsc --noEmit
}

Invoke-Step -Name 'Backend build' -WorkingDirectory (Join-Path $RepoRoot 'backend') -Action {
  & npm.cmd run build
}

if ($Mode -eq 'full') {
  Invoke-Step -Name 'Backend tests' -WorkingDirectory (Join-Path $RepoRoot 'backend') -Action {
    & npm.cmd test -- --passWithNoTests --runInBand
  }
} else {
  Invoke-Step -Name 'Backend focused tests' -WorkingDirectory (Join-Path $RepoRoot 'backend') -Action {
    & npm.cmd test -- --runInBand src/modules/note/note.service.spec.ts
  }
}

Invoke-Step -Name 'Frontend lint' -WorkingDirectory (Join-Path $RepoRoot 'frontend') -Action {
  & npm.cmd run lint
}

Invoke-Step -Name 'Frontend typecheck' -WorkingDirectory (Join-Path $RepoRoot 'frontend') -Action {
  & npx.cmd tsc --noEmit
}

if ($Mode -eq 'full') {
  Invoke-Step -Name 'Frontend unit tests' -WorkingDirectory (Join-Path $RepoRoot 'frontend') -Action {
    & npm.cmd test -- --run
  }

  Invoke-Step -Name 'Frontend build' -WorkingDirectory (Join-Path $RepoRoot 'frontend') -Action {
    & npm.cmd run build
  }
}

Write-Host ""
Write-Host "Local CI completed successfully." -ForegroundColor Green
Write-Host "Steps:" -ForegroundColor Green
$CompletedSteps | ForEach-Object { Write-Host " - $_" }

if ($Mode -eq 'safe') {
  Write-Host ""
  Write-Host "Tip: use -Mode full to include frontend tests and frontend build." -ForegroundColor DarkYellow
}
