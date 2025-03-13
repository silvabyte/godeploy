FROM nginx:1.13-alpine

# Install required tools
RUN apk add --no-cache bash curl jq

# Copy Nginx configuration and entrypoint script
COPY docker/ /

# Copy the SPA configuration file
COPY spa-config.json /etc/spa-config.json

# Create base directory for all SPAs and temp directories
RUN mkdir -p /usr/share/nginx/html /tmp/spas

# Copy the auth SPA (always required)
COPY dist/ /tmp/spas/dist/

# Create empty directories for optional SPAs
# The entrypoint script will check if they exist in the config
RUN mkdir -p /tmp/spas/dashboard-dist /tmp/spas/admin-dist

# Copy optional SPAs if they exist (done in entrypoint script)
# ONBUILD COPY dashboard-dist/ /tmp/spas/dashboard-dist/
# ONBUILD COPY admin-dist/ /tmp/spas/admin-dist/

# Copy package.json for version info
COPY package.json /

# Expose standard HTTP port
EXPOSE 80

# Run the entrypoint script that will configure Nginx for all SPAs
CMD ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]