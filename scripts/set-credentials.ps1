# Get the absolute path to the service account file
$serviceAccountPath = Join-Path $PSScriptRoot ".." "service-account.json"
$absolutePath = Resolve-Path $serviceAccountPath

# Set the environment variable
$env:GOOGLE_APPLICATION_CREDENTIALS = $absolutePath.Path

Write-Host "GOOGLE_APPLICATION_CREDENTIALS set to: $($env:GOOGLE_APPLICATION_CREDENTIALS)" 