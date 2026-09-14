#!/bin/sh
set -e

echo "Starting Vue container..."

# Install dependencies (keep package-lock.json)
npm install

# Start Vite dev server
exec npm run dev -- --host=0.0.0.0 --port=5173