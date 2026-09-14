FROM php:8.4-cli

WORKDIR /var/www/html

# Install system dependencies + PHP extensions
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    curl \
    supervisor \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    default-mysql-client \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring bcmath gd zip pcntl sockets \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2.9 /usr/bin/composer /usr/bin/composer

# Install RoadRunner binary (required for Octane)
COPY --from=ghcr.io/roadrunner-server/roadrunner:2024.3 /usr/bin/rr /usr/local/bin/rr

# Copy entrypoint and supervisor config
COPY docker/laravel/*.sh /usr/local/bin/
COPY docker/laravel/supervisord.*.conf /etc/supervisor/conf.d/supervisord.conf

# Make scripts executable
RUN chmod +x /usr/local/bin/*.sh

# Create necessary directories
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache \
    && chown -R www-data:www-data /var/www/html

EXPOSE 8000 8080

# The entrypoint will handle the rest
CMD ["bash", "/usr/local/bin/entrypoint.development.sh"]