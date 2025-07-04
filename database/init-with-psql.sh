#!/bin/bash

# Load environment variables
source .env

# Set PostgreSQL connection variables
export PGHOST="${POSTGRES_HOST:-localhost}"
export PGPORT="${POSTGRES_PORT:-5432}"
export PGUSER="${POSTGRES_USER:-postgres}"
export PGPASSWORD="${POSTGRES_PASSWORD}"
export PGDATABASE="${POSTGRES_DB:-product_portal}"

echo "Initializing PostgreSQL database..."
echo "Host: $PGHOST:$PGPORT"
echo "Database: $PGDATABASE"
echo "User: $PGUSER"

# Check if database exists, create if not
psql -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$PGDATABASE'" | grep -q 1 || {
    echo "Creating database: $PGDATABASE"
    psql -d postgres -c "CREATE DATABASE \"$PGDATABASE\""
}

# Execute schema
echo "Executing schema..."
psql -d "$PGDATABASE" -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Schema executed successfully!"
    
    # Show created tables
    echo -e "\nCreated tables:"
    psql -d "$PGDATABASE" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name;"
else
    echo "❌ Schema execution failed!"
    exit 1
fi