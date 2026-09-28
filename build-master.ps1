# ============================================================
# Hestia Master Package Builder
# Creates a clean, distributable ZIP for customers
# ============================================================

$projectName = "Hestia"
$version = "1.0.0"
$outputDir = "D:\Webdev\Animemanga"
$zipName = "${projectName}-v${version}-master.zip"
$zipPath = Join-Path $outputDir $zipName
$sourceDir = "D:\Webdev\Animemanga\Hestia"
$tempDir = Join-Path $env:TEMP "hestia-build-$(Get-Date -Format 'yyyyMMddHHmmss')"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  $projectName Master Package Builder v$version" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create temp directory
Write-Host "[1/5] Creating temporary build directory..." -ForegroundColor Yellow
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Step 2: Copy project files using robocopy
Write-Host "[2/5] Copying project files (excluding dev files)..." -ForegroundColor Yellow

# Robocopy with exclusions
robocopy $sourceDir $tempDir /E /NFL /NDL /NJH /NJS /NC /NS /NP `
    /XD "node_modules" ".git" ".github" ".vscode" ".idea" ".gemini" ".agent" ".agents" "tests" `
    /XF ".env" ".env.backup" "build-master.ps1" "*.log" "hot" ".phpunit.result.cache" "phpunit.xml"

# Remove uploaded manga/anime content (keep folder structure)
$contentDirs = @(
    "$tempDir\storage\app\public\manga",
    "$tempDir\storage\app\public\anime",
    "$tempDir\storage\app\public\avatars",
    "$tempDir\storage\app\public\covers",
    "$tempDir\storage\app\updates"
)
foreach ($d in $contentDirs) {
    if (Test-Path $d) { 
        Remove-Item "$d\*" -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Clean framework cache
$cacheDirs = @(
    "$tempDir\storage\framework\cache\data",
    "$tempDir\storage\framework\views",
    "$tempDir\storage\framework\sessions",
    "$tempDir\storage\logs"
)
foreach ($d in $cacheDirs) {
    if (Test-Path $d) { 
        Get-ChildItem $d -Exclude ".gitignore" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue 
    }
}

# Step 3: Ensure required directories exist
Write-Host "[3/5] Preparing directory structure..." -ForegroundColor Yellow

$requiredDirs = @(
    "$tempDir\storage\app\public",
    "$tempDir\storage\app\updates",
    "$tempDir\storage\framework\cache\data",
    "$tempDir\storage\framework\sessions",
    "$tempDir\storage\framework\views",
    "$tempDir\storage\logs",
    "$tempDir\bootstrap\cache"
)

foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $gitignorePath = Join-Path $dir ".gitignore"
    if (-not (Test-Path $gitignorePath)) {
        Set-Content -Path $gitignorePath -Value "*`n!.gitignore"
    }
}

# Remove .env but keep .env.example
$envPath = Join-Path $tempDir ".env"
if (Test-Path $envPath) { Remove-Item $envPath -Force }

# Step 4: Create ZIP
Write-Host "[4/5] Creating ZIP archive... (this may take a minute)" -ForegroundColor Yellow
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -CompressionLevel Optimal

# Step 5: Cleanup
Write-Host "[5/5] Cleaning up..." -ForegroundColor Yellow
Remove-Item $tempDir -Recurse -Force

# Summary
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Package: $zipName" -ForegroundColor White
Write-Host "  Size:    $zipSize MB" -ForegroundColor White
Write-Host "  Path:    $zipPath" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
