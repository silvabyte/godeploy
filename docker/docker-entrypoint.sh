#!/usr/bin/env bash

# Create app configuration directory
mkdir -p /etc/nginx/conf.d/apps

# Function to process a single SPA
process_spa() {
    local app_name=$1
    local app_dir="/usr/share/nginx/html/$app_name"
    
    echo "Processing SPA: $app_name"
    
    # Create app-specific config directory
    mkdir -p "/etc/nginx/conf.d/apps/$app_name"
    
    # Process only if the app directory exists
    if [ ! -d "$app_dir" ]; then
        echo "Warning: App directory $app_dir does not exist. Skipping."
        return
    fi
    
    # Fix the HTML file to use the correct base href and asset paths
    if [ -f "$app_dir/index.html" ]; then
        echo "Fixing asset paths in $app_dir/index.html"
        
        # Create a backup of the original file
        cp "$app_dir/index.html" "$app_dir/index.html.orig"
        
        # Update the base href to point to the app's directory
        sed -i "s|<base href=\"/\" />|<base href=\"/$app_name/\" />|g" "$app_dir/index.html"
        
        # If base href wasn't found, add it
        if ! grep -q "<base href=\"/$app_name/\"" "$app_dir/index.html"; then
            sed -i "s|<head>|<head>\n    <base href=\"/$app_name/\" />|g" "$app_dir/index.html"
        fi
        
        # Update asset paths if needed (in case base href doesn't work for some reason)
        sed -i "s|src=\"/assets/|src=\"/$app_name/assets/|g" "$app_dir/index.html"
        sed -i "s|href=\"/assets/|href=\"/$app_name/assets/|g" "$app_dir/index.html"
        
        echo "Fixed asset paths in $app_dir/index.html"
    else
        echo "Warning: No index.html found in $app_dir"
    fi
    
    # Process assets if they exist
    if [ -d "$app_dir/assets" ]; then
        pushd "$app_dir/assets" > /dev/null
        
        # Find the main JS file (Vite uses pattern like index-CgbRfOA8.js)
        local APP_JS="/$app_name/assets/index.js"
        for js in index-*.js
        do
            if [ -f "$js" ]; then
                cat > "/etc/nginx/conf.d/apps/$app_name/js.conf" <<EOF
location ~* ^/$app_name/assets/index.js([.]map)?\$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /$app_name/assets/${js}\$1;
}
location ~* ^/$app_name/assets/(index-[a-zA-Z0-9]*[.]js(?:[.]map)?)\$ {
    alias   $app_dir/assets/\$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
EOF
                APP_JS="/$app_name/assets/${js}"
                break
            fi
        done
        
        # Find any other JS files (like browser-BL8WTUeT.js)
        for js in *.js
        do
            if [[ "$js" != "index-"* ]] && [ -f "$js" ]; then
                base_name=$(echo "$js" | cut -d'-' -f1)
                cat >> "/etc/nginx/conf.d/apps/$app_name/js.conf" <<EOF
location ~* ^/$app_name/assets/${base_name}.js([.]map)?\$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /$app_name/assets/${js}\$1;
}
location ~* ^/$app_name/assets/(${base_name}-[a-zA-Z0-9]*[.]js(?:[.]map)?)\$ {
    alias   $app_dir/assets/\$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
EOF
            fi
        done
        
        # Find the CSS file (Vite uses pattern like index-D24VJHUp.css)
        local APP_CSS="/$app_name/assets/index.css"
        for css in index-*.css
        do
            if [ -f "$css" ]; then
                cat > "/etc/nginx/conf.d/apps/$app_name/css.conf" <<EOF
location ~* ^/$app_name/assets/index.css([.]map)?\$ {
    expires off;
    add_header Cache-Control "no-cache";
    return 303 /$app_name/assets/${css}\$1;
}
location ~* ^/$app_name/assets/(index-[a-zA-Z0-9]*[.]css(?:[.]map)?)\$ {
    alias   $app_dir/assets/\$1;
    expires max;
    add_header Cache-Control "public; immutable";
}
EOF
                APP_CSS="/$app_name/assets/${css}"
                break
            fi
        done
        
        popd > /dev/null
        
        # Create preload headers with only the main JS and CSS files
        cat > "/etc/nginx/conf.d/apps/$app_name/preload.headers" <<EOF
add_header Cache-Control "public; must-revalidate";
add_header Link "<${APP_CSS}>; rel=preload; as=style; type=text/css; nopush";
add_header Link "<${APP_JS}>; rel=preload; as=script; type=text/javascript; nopush";
add_header X-Frame-Options "SAMEORIGIN" always;
EOF
        
        # Create app-specific location block
        cat > "/etc/nginx/conf.d/apps/$app_name/location.conf" <<EOF
location /$app_name/ {
    alias   $app_dir/;
    try_files \$uri \$uri/ /$app_name/index.html;
    include /etc/nginx/conf.d/apps/$app_name/preload.headers;
}
EOF
        
        # Also add a fallback route for /assets/ to handle direct asset requests
        cat > "/etc/nginx/conf.d/apps/$app_name/assets_fallback.conf" <<EOF
# Fallback for direct asset requests (without app prefix)
location /assets/ {
    rewrite ^/assets/(.*) /$app_name/assets/\$1 permanent;
}
EOF

        # Handle locales directory if it exists
        if [ -d "$app_dir/locales" ]; then
            echo "Found locales directory in $app_name, setting up locales configuration"
            cat > "/etc/nginx/conf.d/apps/$app_name/locales.conf" <<EOF
# Handle locales for $app_name
location /$app_name/locales/ {
    alias $app_dir/locales/;
    add_header Cache-Control "public, max-age=3600";
}

# Fallback for direct locales requests (without app prefix)
location /locales/ {
    rewrite ^/locales/(.*) /$app_name/locales/\$1 permanent;
}
EOF
        else
            echo "No locales directory found in $app_name, creating empty directory"
            mkdir -p "$app_dir/locales"
            
            # Create a sample en.json file if it doesn't exist
            if [ ! -f "$app_dir/locales/en.json" ]; then
                echo '{"app":{"title":"'$app_name'","loading":"Loading..."}}' > "$app_dir/locales/en.json"
            fi
            
            cat > "/etc/nginx/conf.d/apps/$app_name/locales.conf" <<EOF
# Handle locales for $app_name
location /$app_name/locales/ {
    alias $app_dir/locales/;
    add_header Cache-Control "public, max-age=3600";
}

# Fallback for direct locales requests (without app prefix)
location /locales/ {
    rewrite ^/locales/(.*) /$app_name/locales/\$1 permanent;
}
EOF
        fi
        
        echo "Processed assets for $app_name"
    else
        echo "Warning: No assets directory found for $app_name"
    fi
}

# Auto-detect and process all SPAs (fallback method)
detect_and_process_spas() {
    echo "Auto-detecting SPAs..."
    local found_spas=0
    
    for app_dir in /usr/share/nginx/html/*/; do
        if [ -d "$app_dir" ]; then
            app_name=$(basename "$app_dir")
            process_spa "$app_name"
            found_spas=$((found_spas + 1))
        fi
    done
    
    echo "Found and processed $found_spas SPA(s)"
    
    if [ $found_spas -eq 0 ]; then
        echo "WARNING: No SPAs found in /usr/share/nginx/html/"
    fi
    
    # Determine default app
    if [ -d "/usr/share/nginx/html/auth" ]; then
        DEFAULT_APP="auth"
    elif [ $found_spas -gt 0 ]; then
        # Use the first app found
        for app_dir in /usr/share/nginx/html/*/; do
            if [ -d "$app_dir" ]; then
                DEFAULT_APP=$(basename "$app_dir")
                break
            fi
        done
    else
        DEFAULT_APP="auth"  # Fallback even if it doesn't exist
    fi
    
    echo "Default app is: $DEFAULT_APP"
}

# Setup SPAs from configuration file
setup_spas_from_config() {
    echo "Setting up SPAs from configuration file..."
    
    # Check if config file exists
    if [ ! -f "/etc/spa-config.json" ]; then
        echo "ERROR: SPA configuration file not found at /etc/spa-config.json"
        return 1
    fi
    
    # Get default app from config
    DEFAULT_APP=$(jq -r '.default_app // "auth"' /etc/spa-config.json)
    echo "Default app from config: $DEFAULT_APP"
    
    # Process each app in the configuration
    local app_count=$(jq '.apps | length' /etc/spa-config.json)
    local enabled_count=0
    
    for ((i=0; i<$app_count; i++)); do
        local app_enabled=$(jq -r ".apps[$i].enabled" /etc/spa-config.json)
        
        if [ "$app_enabled" = "true" ]; then
            local app_name=$(jq -r ".apps[$i].name" /etc/spa-config.json)
            local source_dir=$(jq -r ".apps[$i].source_dir" /etc/spa-config.json)
            local description=$(jq -r ".apps[$i].description" /etc/spa-config.json)
            
            echo "Setting up enabled SPA: $app_name ($description) from $source_dir"
            
            # Create directory for the app
            mkdir -p "/usr/share/nginx/html/$app_name"
            
            # Copy files from temp directory if they exist
            if [ -d "/tmp/spas/$source_dir" ]; then
                cp -r "/tmp/spas/$source_dir/"* "/usr/share/nginx/html/$app_name/"
                echo "Copied files from /tmp/spas/$source_dir to /usr/share/nginx/html/$app_name/"
            else
                echo "Warning: Source directory /tmp/spas/$source_dir not found for $app_name"
            fi
            
            # Process the SPA
            process_spa "$app_name"
            enabled_count=$((enabled_count + 1))
        else
            local app_name=$(jq -r ".apps[$i].name" /etc/spa-config.json)
            echo "Skipping disabled SPA: $app_name"
        fi
    done
    
    echo "Processed $enabled_count enabled SPAs out of $app_count total"
    
    # Verify default app exists
    if [ ! -d "/usr/share/nginx/html/$DEFAULT_APP" ]; then
        echo "Warning: Default app '$DEFAULT_APP' directory does not exist"
        
        # Find first available app to use as default
        for ((i=0; i<$app_count; i++)); do
            local app_enabled=$(jq -r ".apps[$i].enabled" /etc/spa-config.json)
            if [ "$app_enabled" = "true" ]; then
                DEFAULT_APP=$(jq -r ".apps[$i].name" /etc/spa-config.json)
                echo "Using '$DEFAULT_APP' as default app instead"
                break
            fi
        done
    fi
    
    return 0
}

# Setup SPAs from configuration
setup_spas_from_config
if [ $? -ne 0 ]; then
    echo "Failed to setup SPAs from configuration. Falling back to auto-detection."
    detect_and_process_spas
fi

# Create main nginx configuration for all apps
cat > /etc/nginx/conf.d/default.conf <<EOF
server {
    listen       80 default_server;
    server_name  _;
    absolute_redirect off;
    
    # Root location for redirecting to default app
    location = / {
        return 302 /${DEFAULT_APP}/;
    }
    
    # Include all app-specific configurations
    include /etc/nginx/conf.d/apps/*/location.conf;
    include /etc/nginx/conf.d/apps/*/js.conf;
    include /etc/nginx/conf.d/apps/*/css.conf;
    include /etc/nginx/conf.d/apps/*/assets_fallback.conf;
    include /etc/nginx/conf.d/apps/*/locales.conf;
    
    # Default static file serving
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files \$uri \$uri/ =404;
    }
}
EOF

# Test Nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Execute the command passed to docker run
exec "$@"