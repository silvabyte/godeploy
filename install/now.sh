#!/bin/bash
set -e

# Utility functions
echoerr() {
  printf "$@\n" 1>&2
}

log_info() {
  printf "\033[38;5;61m  ==>\033[0;00m $@\n"
}

log_crit() {
  echoerr
  echoerr "  \033[38;5;125m$@\033[0;00m"
  echoerr
}

is_command() {
  command -v "$1" >/dev/null
}

http_download_curl() {
  local_file=$1
  source_url=$2
  header=$3
  if [ -z "$header" ]; then
    code=$(curl -w '%{http_code}' -sL -o "$local_file" "$source_url")
  else
    code=$(curl -w '%{http_code}' -sL -H "$header" -o "$local_file" "$source_url")
  fi
  if [ "$code" != "200" ]; then
    log_crit "Error downloading, got $code response from server"
    return 1
  fi
  return 0
}

http_download_wget() {
  local_file=$1
  source_url=$2
  header=$3
  if [ -z "$header" ]; then
    wget -q -O "$local_file" "$source_url"
  else
    wget -q --header "$header" -O "$local_file" "$source_url"
  fi
}

http_download() {
  log_info "Downloading $2..."
  if is_command curl; then
    http_download_curl "$@"
    return
  elif is_command wget; then
    http_download_wget "$@"
    return
  fi
  log_crit "http_download unable to find wget or curl"
  return 1
}

uname_os() {
  os=$(uname -s | tr '[:upper:]' '[:lower:]')
  case "$os" in
    msys_nt*) os="windows" ;;
    mingw*) os="windows" ;;
  esac
  echo "$os"
}

uname_arch() {
  arch=$(uname -m)
  case $arch in
    x86_64) arch="amd64" ;;
    x86) arch="386" ;;
    i686) arch="386" ;;
    i386) arch="386" ;;
    aarch64) arch="arm64" ;;
    armv5*) arch="armv5" ;;
    armv6*) arch="armv6" ;;
    armv7*) arch="armv7" ;;
  esac
  echo ${arch}
}

mktmpdir() {
  test -z "$TMPDIR" && TMPDIR="$(mktemp -d)"
  mkdir -p "${TMPDIR}"
  echo "${TMPDIR}"
}

# Main installation function
install_godeploy() {
  # Get OS and architecture
  OS=$(uname_os)
  ARCH=$(uname_arch)
  
  log_info "Detected OS: $OS, Architecture: $ARCH"
  
  # Handle Windows via WSL
  if [ "$OS" == "linux" ] && grep -q Microsoft /proc/version; then
    OS="windows"
    log_info "Detected WSL, using Windows binaries"
  fi
  
  # Check if VERSION is provided as an environment variable
  if [ -n "$VERSION" ]; then
    log_info "Using specified version: $VERSION"
    LATEST_VERSION="$VERSION"
  else
    # Get the latest version from GitHub API
    log_info "Fetching latest version information..."
    
    # Debug the GitHub API response
    GITHUB_API_RESPONSE=$(curl -s https://api.github.com/repos/matsilva/godeploy/releases/latest)
    if [ -z "$GITHUB_API_RESPONSE" ]; then
      log_crit "Empty response from GitHub API"
      exit 1
    fi
    
    # Try different methods to extract the version
    LATEST_VERSION=$(echo "$GITHUB_API_RESPONSE" | grep -o '"tag_name": *"[^"]*"' | grep -o '"[^"]*"$' | tr -d '"')
    
    if [ -z "$LATEST_VERSION" ]; then
      # Alternative method
      LATEST_VERSION=$(echo "$GITHUB_API_RESPONSE" | grep -o '"tag_name":"[^"]*"' | cut -d':' -f2 | tr -d '"')
    fi
    
    if [ -z "$LATEST_VERSION" ]; then
      log_crit "Failed to determine latest version from GitHub API"
      log_info "GitHub API response excerpt:"
      echo "$GITHUB_API_RESPONSE" | head -20
      log_info "Falling back to hardcoded version v0.1.0"
      LATEST_VERSION="v0.1.0"
    fi
    
    log_info "Using version: $LATEST_VERSION"
  fi
  
  # Create extraction directory in current working directory
  EXTRACT_DIR="./godeploy-extract"
  mkdir -p "$EXTRACT_DIR"
  log_info "Using extraction directory: $EXTRACT_DIR"
  
  # Construct the correct download URL for the asset
  DOWNLOAD_URL="https://github.com/matsilva/godeploy/releases/download/${LATEST_VERSION}/godeploy-${OS}-${ARCH}"
  if [ "$OS" == "windows" ]; then
    DOWNLOAD_URL="${DOWNLOAD_URL}.zip"
    ARCHIVE_TYPE="zip"
  else
    DOWNLOAD_URL="${DOWNLOAD_URL}.tar.gz"
    ARCHIVE_TYPE="tar.gz"
  fi
  
  # Download the archive to current directory
  TMP_FILE="${EXTRACT_DIR}/godeploy-${OS}-${ARCH}.${ARCHIVE_TYPE}"
  
  # Download the archive
  http_download "$TMP_FILE" "$DOWNLOAD_URL" || exit 1
  
  # Extract the archive
  log_info "Extracting archive..."
  
  if [ "$ARCHIVE_TYPE" == "zip" ]; then
    if ! is_command unzip; then
      log_crit "unzip command not found. Please install unzip."
      exit 1
    fi
    log_info "Running: unzip -o \"$TMP_FILE\" -d \"$EXTRACT_DIR\""
    unzip -o "$TMP_FILE" -d "$EXTRACT_DIR" || { log_crit "Failed to extract zip archive"; exit 1; }
  else
    if ! is_command tar; then
      log_crit "tar command not found. Please install tar."
      exit 1
    fi
    log_info "Running: tar -xvzf \"$TMP_FILE\" -C \"$EXTRACT_DIR\""
    tar -xvzf "$TMP_FILE" -C "$EXTRACT_DIR" || { 
      log_crit "Failed to extract tar.gz archive"
      log_info "Archive file details:"
      ls -la "$TMP_FILE"
      log_info "Archive file type:"
      file "$TMP_FILE"
      exit 1
    }
  fi
  
  # Find the godeploy binary in the extracted files
  log_info "Locating binary..."
  GODEPLOY_BIN=$(find "$EXTRACT_DIR" -name "godeploy" -type f)
  
  if [ -z "$GODEPLOY_BIN" ]; then
    log_crit "Could not find godeploy binary in the extracted files"
    log_info "Contents of extract directory:"
    ls -la "$EXTRACT_DIR"
    
    # Try direct binary download as fallback
    log_info "Attempting direct binary download as fallback..."
    DIRECT_URL="https://github.com/matsilva/godeploy/releases/download/${LATEST_VERSION}/godeploy-${OS}-${ARCH}"
    if [ "$OS" == "windows" ]; then
      DIRECT_URL="${DIRECT_URL}.exe"
    fi
    
    GODEPLOY_BIN="${EXTRACT_DIR}/godeploy"
    http_download "$GODEPLOY_BIN" "$DIRECT_URL" || {
      log_crit "Direct binary download failed"
      exit 1
    }
    
    # Make the binary executable
    chmod +x "$GODEPLOY_BIN" || {
      log_crit "Failed to make binary executable"
      exit 1
    }
  fi
  
  # Determine install directory
  INSTALL_DIR=${PREFIX:-"/usr/local/bin"}
  
  # Install the binary
  log_info "Installing godeploy to $INSTALL_DIR..."
  if [ -w "$INSTALL_DIR" ]; then
    cp "$GODEPLOY_BIN" "$INSTALL_DIR/godeploy" && chmod +x "$INSTALL_DIR/godeploy" || { 
      log_crit "Failed to install binary"
      exit 1
    }
  else
    log_info "Permissions required for installation to $INSTALL_DIR — alternatively specify a new directory with:"
    log_info "  $ curl -sSL https://install.godeploy.app/now.sh | PREFIX=\$HOME/.local/bin bash"
    sudo cp "$GODEPLOY_BIN" "$INSTALL_DIR/godeploy" && sudo chmod +x "$INSTALL_DIR/godeploy" || { 
      log_crit "Failed to install binary"
      exit 1
    }
  fi
  
  # Clean up
  log_info "Cleaning up..."
  rm -rf "$EXTRACT_DIR"
  
  log_info "GoDeploy successfully installed to $INSTALL_DIR/godeploy"
  
  # Add to PATH if needed
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    log_info "NOTE: Add $INSTALL_DIR to your PATH to use godeploy from any directory"
    if [ -f "$HOME/.bashrc" ]; then
      log_info "You can do this by running: echo 'export PATH=\$PATH:$INSTALL_DIR' >> ~/.bashrc"
    elif [ -f "$HOME/.zshrc" ]; then
      log_info "You can do this by running: echo 'export PATH=\$PATH:$INSTALL_DIR' >> ~/.zshrc"
    fi
  fi
  
  # Verify installation
  log_info "Testing installation..."
  if is_command "$INSTALL_DIR/godeploy"; then
    "$INSTALL_DIR/godeploy" --help
    log_info "Installation complete!"
  else
    log_crit "Installation verification failed. Please check your PATH."
    exit 1
  fi
}

# Run the installation
install_godeploy