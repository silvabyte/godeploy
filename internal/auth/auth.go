package auth

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// AuthConfig represents the authentication configuration
type AuthConfig struct {
	AuthToken string `json:"auth_token"`
	Email     string `json:"email"`
}

// ConfigDirFunc is a function type for getting the config directory
type ConfigDirFunc func() (string, error)

// GetConfigDir returns the directory where the config file should be stored
// based on the user's operating system
var GetConfigDir ConfigDirFunc = func() (string, error) {
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

// LoadAuthConfig loads the authentication configuration from the config file
func LoadAuthConfig() (*AuthConfig, error) {
	configPath, err := GetConfigFilePath()
	if err != nil {
		return nil, err
	}

	// If the file doesn't exist, return a default config
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		return &AuthConfig{}, nil
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read auth config file: %w", err)
	}

	var config AuthConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse auth config file: %w", err)
	}

	return &config, nil
}

// SaveAuthConfig saves the authentication configuration to the config file
func SaveAuthConfig(config *AuthConfig) error {
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
	return SaveAuthConfig(config)
}
