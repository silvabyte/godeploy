package auth

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	"github.com/silvabyte/godeploy/internal/paths"
)

// Config represents the authentication configuration stored on disk
type Config struct {
	AuthToken    string `json:"auth_token"`
	RefreshToken string `json:"refresh_token"`
	Email        string `json:"email"`
}

// ConfigDirFunc is a function type for getting the config directory
type ConfigDirFunc func() (string, error)

// GetConfigDir returns the directory where the config file should be stored
// using XDG Base Directory specification via the paths package
var GetConfigDir ConfigDirFunc = func() (string, error) {
	return paths.GetConfigDir(), nil
}

// GetLegacyConfigDir returns the legacy (pre-XDG) config directory path
// This is used for automatic migration of existing configurations
// Exported as a variable to allow mocking in tests
var GetLegacyConfigDir ConfigDirFunc = func() (string, error) {
	var configDir string

	switch runtime.GOOS {
	case "windows":
		// Windows: %APPDATA%/godeploy
		appData := os.Getenv("APPDATA")
		if appData == "" {
			return "", fmt.Errorf("APPDATA environment variable not set")
		}
		configDir = filepath.Join(appData, "godeploy")
	case "darwin", "linux":
		// macOS/Linux: ~/.config/godeploy
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user home directory: %w", err)
		}
		configDir = filepath.Join(homeDir, ".config", "godeploy")
	default:
		return "", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	return configDir, nil
}

// GetConfigFilePath returns the full path to the auth config file
func GetConfigFilePath() (string, error) {
	configDir, err := GetConfigDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(configDir, "config.json"), nil
}

// migrateFromLegacyLocation migrates the config file from the legacy location
// to the XDG-compliant location. This is called automatically and is idempotent.
func migrateFromLegacyLocation() error {
	// Get the XDG config path
	xdgConfigPath, err := GetConfigFilePath()
	if err != nil {
		return err
	}

	// If XDG config already exists, no migration needed
	if _, err := os.Stat(xdgConfigPath); err == nil {
		return nil
	}

	// Get the legacy config directory
	legacyConfigDir, err := GetLegacyConfigDir()
	if err != nil {
		// If we can't determine legacy location, just return nil
		// This allows the system to work on unsupported platforms
		return nil
	}

	legacyConfigPath := filepath.Join(legacyConfigDir, "config.json")

	// Check if legacy config exists
	if _, err := os.Stat(legacyConfigPath); os.IsNotExist(err) {
		// No legacy config to migrate
		return nil
	}

	// Read the legacy config
	data, err := os.ReadFile(legacyConfigPath)
	if err != nil {
		return fmt.Errorf("failed to read legacy config file: %w", err)
	}

	// Create the XDG config directory
	xdgConfigDir, err := GetConfigDir()
	if err != nil {
		return err
	}

	if err := os.MkdirAll(xdgConfigDir, 0o755); err != nil {
		return fmt.Errorf("failed to create XDG config directory: %w", err)
	}

	// Write the config to the XDG location
	if err := os.WriteFile(xdgConfigPath, data, 0o644); err != nil {
		return fmt.Errorf("failed to write config to XDG location: %w", err)
	}

	// Migration successful - we don't delete the legacy file for safety
	// Users can manually remove it if they wish
	return nil
}

// LoadAuthConfig loads the authentication configuration from the config file
// It automatically migrates from legacy locations to XDG-compliant paths
func LoadAuthConfig() (*Config, error) {
	// Attempt migration from legacy location if needed
	if err := migrateFromLegacyLocation(); err != nil {
		// Log migration error but don't fail - we can still try to load
		// from the current location
		fmt.Fprintf(os.Stderr, "Warning: failed to migrate config from legacy location: %v\n", err)
	}

	configPath, err := GetConfigFilePath()
	if err != nil {
		return nil, err
	}

	// If the file doesn't exist, return a default config
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return &Config{}, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read auth config file: %w", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse auth config file: %w", err)
	}

	return &config, nil
}

// SaveAuthConfig saves the authentication configuration to the config file
func SaveAuthConfig(config *Config) error {
	configDir, err := GetConfigDir()
	if err != nil {
		return err
	}

	// Create the config directory if it doesn't exist
	if err := os.MkdirAll(configDir, 0o755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	configPath, err := GetConfigFilePath()
	if err != nil {
		return err
	}

	data, err := json.MarshalIndent(config, "", "    ")
	if err != nil {
		return fmt.Errorf("failed to marshal auth config: %w", err)
	}

	if err := os.WriteFile(configPath, data, 0o644); err != nil {
		return fmt.Errorf("failed to write auth config file: %w", err)
	}

	return nil
}

// IsAuthenticated checks if the user has an authentication token
// Note: This only checks if a token exists, not if it's valid.
// To verify token validity, use the API client's VerifyToken method.
func IsAuthenticated() (bool, error) {
	config, err := LoadAuthConfig()
	if err != nil {
		return false, err
	}

	// If there's no token, the user is not authenticated
	if config.AuthToken == "" {
		return false, nil
	}

	// We have a token, but this function doesn't verify it with the API
	// That should be done separately to avoid circular dependencies
	return true, nil
}

// GetAuthToken returns the authentication token
func GetAuthToken() (string, error) {
	config, err := LoadAuthConfig()
	if err != nil {
		return "", err
	}
	return config.AuthToken, nil
}

// GetUserEmail returns the user's email from the config file
func GetUserEmail() (string, error) {
	config, err := LoadAuthConfig()
	if err != nil {
		return "", err
	}
	return config.Email, nil
}

// SetUserEmail sets the user's email and saves it to the config file
func SetUserEmail(email string) error {
	config, err := LoadAuthConfig()
	if err != nil {
		return err
	}
	config.Email = email
	return SaveAuthConfig(config)
}

// SetAuthToken sets the authentication token and saves it to the config file
func SetAuthToken(token string) error {
	config, err := LoadAuthConfig()
	if err != nil {
		return err
	}
	config.AuthToken = token
	return SaveAuthConfig(config)
}

// ClearAuthToken clears the authentication token and saves the config file
func ClearAuthToken() error {
	config, err := LoadAuthConfig()
	if err != nil {
		return err
	}
	config.AuthToken = ""
	config.RefreshToken = ""
	return SaveAuthConfig(config)
}

// GetRefreshToken returns the refresh token
func GetRefreshToken() (string, error) {
	config, err := LoadAuthConfig()
	if err != nil {
		return "", err
	}
	return config.RefreshToken, nil
}

// SetTokens sets both access and refresh tokens and saves to config file
func SetTokens(accessToken, refreshToken string) error {
	config, err := LoadAuthConfig()
	if err != nil {
		return err
	}
	config.AuthToken = accessToken
	config.RefreshToken = refreshToken
	return SaveAuthConfig(config)
}
