#!/bin/bash

# Supabase Database Export Script
# This script exports your complete Supabase database with schema and data

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================

# Get these from: Supabase Dashboard → Settings → Database → Connection string
DB_HOST="your-project-ref.supabase.co"
DB_NAME="postgres"
DB_USER="postgres"
DB_PASSWORD="your-database-password"

# Or use connection URI directly (recommended)
# DB_URI="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Output directory
OUTPUT_DIR="./database_export"
DATE=$(date +%Y%m%d_%H%M%S)

# ============================================
# SCRIPT EXECUTION
# ============================================

echo "=========================================="
echo "Supabase Database Export Script"
echo "=========================================="
echo ""

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    echo "❌ Error: pg_dump is not installed"
    echo ""
    echo "Install PostgreSQL client tools:"
    echo "  Mac:    brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo "✅ Output directory created: $OUTPUT_DIR"
echo ""

# Build connection string
if [ -z "$DB_URI" ]; then
    DB_URI="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:5432/$DB_NAME"
fi

echo "📦 Starting database export..."
echo ""

# 1. Export complete schema (structure only)
echo "1️⃣  Exporting database schema..."
pg_dump "$DB_URI" \
    --schema-only \
    --no-owner \
    --no-acl \
    --file "$OUTPUT_DIR/01_schema_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Schema exported: 01_schema_$DATE.sql"
else
    echo "   ❌ Schema export failed. Check your connection details."
    exit 1
fi

# 2. Export complete database (schema + data)
echo "2️⃣  Exporting full database (schema + data)..."
pg_dump "$DB_URI" \
    --no-owner \
    --no-acl \
    --file "$OUTPUT_DIR/02_full_database_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Full database exported: 02_full_database_$DATE.sql"
else
    echo "   ❌ Full database export failed."
fi

# 3. Export data only (INSERT statements)
echo "3️⃣  Exporting data only..."
pg_dump "$DB_URI" \
    --data-only \
    --inserts \
    --no-owner \
    --no-acl \
    --file "$OUTPUT_DIR/03_data_only_$DATE.sql" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Data exported: 03_data_only_$DATE.sql"
else
    echo "   ❌ Data export failed."
fi

# 4. Export as custom format (for easy restore)
echo "4️⃣  Exporting custom format (for restore)..."
pg_dump "$DB_URI" \
    --format=custom \
    --no-owner \
    --no-acl \
    --file "$OUTPUT_DIR/04_database_$DATE.dump" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Custom format exported: 04_database_$DATE.dump"
else
    echo "   ❌ Custom format export failed."
fi

# 5. Export specific tables (if needed)
echo "5️⃣  Exporting individual tables..."
TABLES=("users" "rooms" "bookings" "blocked_dates" "facilities" "testimonials" "contact_messages")

for table in "${TABLES[@]}"; do
    pg_dump "$DB_URI" \
        --table="$table" \
        --no-owner \
        --no-acl \
        --file "$OUTPUT_DIR/table_${table}_$DATE.sql" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Table '$table' exported"
    fi
done

echo ""
echo "=========================================="
echo "✅ Export Complete!"
echo "=========================================="
echo ""
echo "📁 Files saved in: $OUTPUT_DIR"
echo ""
echo "Files created:"
ls -lh "$OUTPUT_DIR" | grep "$DATE"
echo ""
echo "💡 To restore database:"
echo "   psql \"$DB_URI\" < $OUTPUT_DIR/02_full_database_$DATE.sql"
echo ""
