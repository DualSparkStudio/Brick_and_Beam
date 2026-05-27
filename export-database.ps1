# Supabase Database Export Script (PowerShell for Windows)
# This script exports your complete Supabase database with schema and data

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================

$DB_HOST = "your-project-ref.supabase.co"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "your-database-password"

# Or use connection URI directly
# $DB_URI = "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Output directory
$OUTPUT_DIR = ".\database_export"
$DATE = Get-Date -Format "yyyyMMdd_HHmmss"

# ============================================
# SCRIPT EXECUTION
# ============================================

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Supabase Database Export Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if pg_dump is installed
$pgDumpPath = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDumpPath) {
    Write-Host "❌ Error: pg_dump is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Create output directory
New-Item -ItemType Directory -Force -Path $OUTPUT_DIR | Out-Null
Write-Host "✅ Output directory created: $OUTPUT_DIR" -ForegroundColor Green
Write-Host ""

# Build connection string
if (-not $DB_URI) {
    $DB_URI = "postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/${DB_NAME}"
}

Write-Host "📦 Starting database export..." -ForegroundColor Cyan
Write-Host ""

# 1. Export complete schema
Write-Host "1️⃣  Exporting database schema..." -ForegroundColor Yellow
$schemaFile = "$OUTPUT_DIR\01_schema_$DATE.sql"
& pg_dump $DB_URI --schema-only --no-owner --no-acl -f $schemaFile 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Schema exported: 01_schema_$DATE.sql" -ForegroundColor Green
} else {
    Write-Host "   ❌ Schema export failed. Check your connection details." -ForegroundColor Red
    exit 1
}

# 2. Export complete database
Write-Host "2️⃣  Exporting full database (schema + data)..." -ForegroundColor Yellow
$fullFile = "$OUTPUT_DIR\02_full_database_$DATE.sql"
& pg_dump $DB_URI --no-owner --no-acl -f $fullFile 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Full database exported: 02_full_database_$DATE.sql" -ForegroundColor Green
} else {
    Write-Host "   ❌ Full database export failed." -ForegroundColor Red
}

# 3. Export data only
Write-Host "3️⃣  Exporting data only..." -ForegroundColor Yellow
$dataFile = "$OUTPUT_DIR\03_data_only_$DATE.sql"
& pg_dump $DB_URI --data-only --inserts --no-owner --no-acl -f $dataFile 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Data exported: 03_data_only_$DATE.sql" -ForegroundColor Green
} else {
    Write-Host "   ❌ Data export failed." -ForegroundColor Red
}

# 4. Export custom format
Write-Host "4️⃣  Exporting custom format (for restore)..." -ForegroundColor Yellow
$customFile = "$OUTPUT_DIR\04_database_$DATE.dump"
& pg_dump $DB_URI --format=custom --no-owner --no-acl -f $customFile 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Custom format exported: 04_database_$DATE.dump" -ForegroundColor Green
} else {
    Write-Host "   ❌ Custom format export failed." -ForegroundColor Red
}

# 5. Export individual tables
Write-Host "5️⃣  Exporting individual tables..." -ForegroundColor Yellow
$tables = @("users", "rooms", "bookings", "blocked_dates", "facilities", "testimonials", "contact_messages")

foreach ($table in $tables) {
    $tableFile = "$OUTPUT_DIR\table_${table}_$DATE.sql"
    & pg_dump $DB_URI --table=$table --no-owner --no-acl -f $tableFile 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Table '$table' exported" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Export Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Files saved in: $OUTPUT_DIR" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files created:" -ForegroundColor Yellow
Get-ChildItem $OUTPUT_DIR | Where-Object { $_.Name -like "*$DATE*" } | Format-Table Name, Length -AutoSize
Write-Host ""
Write-Host "💡 To restore database:" -ForegroundColor Yellow
Write-Host "   psql `"$DB_URI`" < $OUTPUT_DIR\02_full_database_$DATE.sql" -ForegroundColor Gray
Write-Host ""
