$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backup = Join-Path $root "data\backup-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

foreach ($item in @('process_intelligence.sqlite3', 'uploads', 'runs', 'reports')) {
    $source = Join-Path $root "data\$item"
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $backup -Recurse -Force
    }
}

Write-Output "Backup created at $backup"
