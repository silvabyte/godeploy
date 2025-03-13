FROM nginx:1.13-alpine

# Install required tools
RUN apk add --no-cache bash curl jq

# Copy Nginx configuration
COPY etc/nginx/ /etc/nginx/

# Create base directory for all SPAs
RUN mkdir -p /usr/share/nginx/html

# Copy the SPAs

COPY usr/share/nginx/html/auth/ /usr/share/nginx/html/auth/


# Expose standard HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
