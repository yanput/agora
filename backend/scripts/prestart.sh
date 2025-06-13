#!/usr/bin/env bash

set -e
set -x

# Remove old SQLite database if it exists
rm -f /app/app/database/scientists.db

# Create and populate a new SQLite database
python /app/scripts/fetch_and_create_scientists_db.py
