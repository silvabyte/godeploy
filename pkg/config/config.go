package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// SpaConfig represents the configuration for multiple SPAs
type SpaConfig struct {
	Apps []App `json:"apps"`
}

// App represents a single SPA configuration
type App struct {
	Name        string `json:"name"`
	SourceDir   string `json:"source_dir"`
	Path        string `json:"path"`
	Description string `json:"description"`
	Enabled     bool   `json:"enabled"`
}

// LoadConfig loads the SPA configuration from a file
func LoadConfig(configPath string) (*SpaConfig, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config SpaConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	// Validate the configuration
	if len(config.Apps) == 0 {
		return nil, fmt.Errorf("at least one app must be defined in the configuration")
	}

	// Set default paths if not specified
	for i, app := range config.Apps {
		// If path is not specified, use the name as the default path
		if app.Path == "" {
			fmt.Printf("Setting default path for app %s to /%s\n", app.Name, app.Name)
			config.Apps[i].Path = app.Name
		}
	}

	return &config, nil
}

// SaveConfig saves the SPA configuration to a file
func SaveConfig(config *SpaConfig, configPath string) error {
	data, err := json.MarshalIndent(config, "", "    ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.MkdirAll(filepath.Dir(configPath), 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// GetEnabledApps returns a list of enabled apps
func (c *SpaConfig) GetEnabledApps() []App {
	var enabledApps []App
	for _, app := range c.Apps {
		if app.Enabled {
			enabledApps = append(enabledApps, app)
		}
	}
	return enabledApps
}

// GetAppByName returns an app by its name
func (c *SpaConfig) GetAppByName(name string) (App, bool) {
	for _, app := range c.Apps {
		if app.Name == name {
			return app, true
		}
	}
	return App{}, false
}
