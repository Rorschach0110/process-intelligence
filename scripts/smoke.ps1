$ErrorActionPreference = 'Stop'

$base = 'http://127.0.0.1:8765'
$health = Invoke-RestMethod "$base/api/health"
if ($health.status -ne 'ok') {
    throw 'Health check failed'
}

$datasets = Invoke-RestMethod "$base/api/datasets"
$runs = Invoke-RestMethod "$base/api/runs"

Write-Output "health=ok datasets=$($datasets.datasets.Count) runs=$($runs.runs.Count)"
