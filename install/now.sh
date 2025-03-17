#!/bin/bash
set -e

LATEST_VERSION=$(curl -s https://api.github.com/repos/matsilva/godeploy/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Convert architecture naming
if [ "$ARCH" == "x86_64" ]; then
  ARCH="amd64"
elif [ "$ARCH" == "aarch64" ]; then
  ARCH="arm64"
fi

# Handle Windows via WSL
if [ "$OS" == "linux" ] && grep -q Microsoft /proc/version; then
  OS="windows"
fi

# Updated URL format without version in filename
DOWNLOAD_URL="https://github.com/audetic/godeploy/releases/download/${LATEST_VERSION}/godeploy-${OS}-${ARCH}"
if [ "$OS" == "windows" ]; then
  DOWNLOAD_URL="${DOWNLOAD_URL}.zip"
else
  DOWNLOAD_URL="${DOWNLOAD_URL}.tar.gz"
fi

INSTALL_DIR="/usr/local/bin"
if [ ! -w "$INSTALL_DIR" ]; then
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
fi

echo "Downloading GoDeploy ${LATEST_VERSION} for ${OS}-${ARCH}..."
TMP_DIR=$(mktemp -d)

if [ "$OS" == "windows" ]; then
  curl -L "$DOWNLOAD_URL" -o "$TMP_DIR/godeploy.zip"
  unzip "$TMP_DIR/godeploy.zip" -d "$TMP_DIR"
else
  curl -L "$DOWNLOAD_URL" -o "$TMP_DIR/godeploy.tar.gz"
  tar -xzf "$TMP_DIR/godeploy.tar.gz" -C "$TMP_DIR"
fi

# Install the binary
mv "$TMP_DIR/godeploy" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/godeploy"

# Clean up
rm -rf "$TMP_DIR"

echo "GoDeploy successfully installed to $INSTALL_DIR/godeploy"

# Add to PATH if needed
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  echo "NOTE: Add $INSTALL_DIR to your PATH to use godeploy from any directory."
  if [ -f "$HOME/.bashrc" ]; then
    echo "You can do this by running: echo 'export PATH=\$PATH:$INSTALL_DIR' >> ~/.bashrc"
  elif [ -f "$HOME/.zshrc" ]; then
    echo "You can do this by running: echo 'export PATH=\$PATH:$INSTALL_DIR' >> ~/.zshrc"
  fi
fi

# Verify installation
echo "Testing installation..."
"$INSTALL_DIR/godeploy" --version