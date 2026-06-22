param(
  [string]$ApiBaseUrl = "http://localhost:8080/api/v1",
  [switch]$Install
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$frontendDir = Join-Path $repoRoot "frontend"
$nodeModules = Join-Path $frontendDir "node_modules"

$env:NEXT_PUBLIC_API_BASE_URL = $ApiBaseUrl

Push-Location $frontendDir
try {
  if ($Install -or -not (Test-Path $nodeModules)) {
    npm install
  }

  npm run dev
}
finally {
  Pop-Location
}
