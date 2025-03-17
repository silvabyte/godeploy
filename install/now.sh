#!/bin/bash
set -euo pipefail

# ----------------------
# Utility Functions
# ----------------------

echoerr() { printf "%s\n" "$@" >&2; }
log_info() { printf "\033[38;5;61m==>\033[0m %s\n" "$@"; }
log_crit() { echoerr; echoerr "\033[38;5;125m$@\033[0m"; echoerr; }

is_command() { command -v "$1" >/dev/null 2>&1; }

http_download() {
  local file=$1 url=$2 header=${3:-}
  log_info "Downloading $url..."

  if is_command curl; then
    local code
    if [ -n "$header" ]; then
      code=$(curl -w '%{http_code}' -sL -H "$header" -o "$file" "$url")
    else
      code=$(curl -w '%{http_code}' -sL -o "$file" "$url")
    fi
    [ "$code" = "200" ] || { log_crit "Download failed: $code"; return 1; }
  elif is_command wget; then
    [ -n "$header" ] && header="--header=$header"
    wget -q $header -O "$file" "$url" || { log_crit "Download failed with wget"; return 1; }
  else
    log_crit "Neither curl nor wget found"
    return 1
  fi
}

uname_os() {
  case "$(uname -s | tr '[:upper:]' '[:lower:]')" in
    msys_nt*|mingw*) echo "windows" ;;
    *) echo "$(uname -s | tr '[:upper:]' '[:lower:]')" ;;
  esac
}

uname_arch() {
  case "$(uname -m)" in
    x86_64) echo "amd64" ;;
    x86|i686|i386) echo "386" ;;
    aarch64) echo "arm64" ;;
    armv5*) echo "armv5" ;;
    armv6*) echo "armv6" ;;
    armv7*) echo "armv7" ;;
    *) uname -m ;;
  esac
}

# ----------------------
# Main Installer
# ----------------------

install_godeploy() {
  local OS ARCH VERSION API_URL LATEST_VERSION EXTRACT_DIR DOWNLOAD_URL TMP_FILE ARCHIVE_TYPE GODEPLOY_BIN INSTALL_DIR

  OS=$(uname_os)
  ARCH=$(uname_arch)
  log_info "Detected OS: $OS, Architecture: $ARCH"

  [ "$OS" = "linux" ] && grep -q Microsoft /proc/version && { OS="windows"; log_info "Detected WSL, using Windows binaries"; }

  VERSION="${VERSION:-}"
  if [ -z "$VERSION" ]; then
    log_info "Fetching latest version..."
    API_URL="https://api.github.com/repos/matsilva/godeploy/releases/latest"
    LATEST_VERSION=$(curl -s "$API_URL" | grep -oP '"tag_name":\s*"\K(.*?)(?=")')
    LATEST_VERSION="${LATEST_VERSION:-v0.1.0}"
    log_info "Using version: $LATEST_VERSION"
  else
    LATEST_VERSION="$VERSION"
  fi

  EXTRACT_DIR="./godeploy-extract"
  mkdir -p "$EXTRACT_DIR"

  DOWNLOAD_URL="https://github.com/matsilva/godeploy/releases/download/${LATEST_VERSION}/godeploy-${OS}-${ARCH}"
  ARCHIVE_TYPE="tar.gz"
  [ "$OS" = "windows" ] && { DOWNLOAD_URL="${DOWNLOAD_URL}.zip"; ARCHIVE_TYPE="zip"; }

  TMP_FILE="${EXTRACT_DIR}/godeploy-${OS}-${ARCH}.${ARCHIVE_TYPE}"
  http_download "$TMP_FILE" "$DOWNLOAD_URL" || exit 1

  log_info "Extracting archive..."
  case "$ARCHIVE_TYPE" in
    zip)
      is_command unzip || { log_crit "Please install unzip."; exit 1; }
      unzip -o "$TMP_FILE" -d "$EXTRACT_DIR" || { log_crit "Failed to extract zip."; exit 1; }
      ;;
    tar.gz)
      is_command tar || { log_crit "Please install tar."; exit 1; }
      tar -xzf "$TMP_FILE" -C "$EXTRACT_DIR" || { log_crit "Failed to extract tar.gz."; exit 1; }
      ;;
  esac

  GODEPLOY_BIN=$(find "$EXTRACT_DIR" -name "godeploy*" -type f | head -n 1)
  [ -z "$GODEPLOY_BIN" ] && { log_crit "Binary not found. Extraction may have failed."; exit 1; }

  INSTALL_DIR="${PREFIX:-/usr/local/bin}"
  log_info "Installing godeploy to $INSTALL_DIR..."
  mkdir -p "$INSTALL_DIR"

  if [ -w "$INSTALL_DIR" ]; then
    cp "$GODEPLOY_BIN" "$INSTALL_DIR/godeploy"
  else
    sudo cp "$GODEPLOY_BIN" "$INSTALL_DIR/godeploy"
  fi
  chmod +x "$INSTALL_DIR/godeploy"

  log_info "Cleaning up..."
  rm -rf "$EXTRACT_DIR"

  log_info "GoDeploy installed to $INSTALL_DIR/godeploy"

  if ! command -v godeploy >/dev/null; then
    log_info "Add $INSTALL_DIR to your PATH to use godeploy globally."
    [ -f "$HOME/.bashrc" ] && log_info "echo 'export PATH=\$PATH:$INSTALL_DIR' >> ~/.bashrc"
    [ -f "$HOME/.zshrc" ] && log_info "echo 'export PATH=\$PATH:$INSTALL_DIR' >> ~/.zshrc"
  fi

  log_info "Testing installation..."
  "$INSTALL_DIR/godeploy" --help || { log_crit "Failed to run godeploy. Check installation."; exit 1; }
  log_info "Installation successful!"
}

# ----------------------
# Execute
# ----------------------

install_godeploy
