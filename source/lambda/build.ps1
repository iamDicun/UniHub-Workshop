@'
# Build Lambda deployment zip for unihub-image-processor
# Run this script from source/ directory:
#   powershell -ExecutionPolicy Bypass -File lambda/build.ps1

Write-Host "[1/3] Installing dependencies in Docker (Linux x64)..." -ForegroundColor Cyan

docker run --rm `
  -v "${PWD}\lambda:/var/task" `
  -w /var/task `
  node:18-slim `
  sh -c "npm install --platform=linux --arch=x64 --omit=dev"

if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker build failed! Make sure Docker Desktop is running." -ForegroundColor Red
  exit 1
}

Write-Host "[2/3] Creating deployment zip..." -ForegroundColor Cyan

$zipPath = "${PWD}\lambda\deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath }

Push-Location "${PWD}\lambda"
try {
  Compress-Archive -Path index.mjs, package.json, node_modules -DestinationPath $zipPath -Force
} finally {
  Pop-Location
}

Write-Host "[3/3] Done!" -ForegroundColor Green
Write-Host "Deploy zip: lambda/deploy.zip" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. AWS Console > Lambda > unihub-image-processor" -ForegroundColor White
Write-Host "  2. Upload from > .zip file > lambda/deploy.zip" -ForegroundColor White
Write-Host "  3. Runtime: Node.js 18.x, Architecture: x86_64" -ForegroundColor White
Write-Host "  4. Memory: 512 MB, Timeout: 30s" -ForegroundColor White
'@
