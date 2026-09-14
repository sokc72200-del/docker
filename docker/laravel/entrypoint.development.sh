#!/bin/bash
set -e

echo "Starting Laravel container..."

# Install PHP dependencies
composer install --no-interaction --prefer-dist

# Generate app key if missing
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
  php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link || true

# Start Supervisor (Octane + Queue + Schedule + Reverb)
exec supervisord -c /etc/supervisor/conf.d/supervisord.development.conf