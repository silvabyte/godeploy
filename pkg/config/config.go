package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// SpaConfig represents the configuration for multiple SPAs
type SpaConfig struct {
	DefaultApp string `json:"default_app"`
	Apps       []App  `json:"apps"`
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
	if config.DefaultApp == "" {
		return nil, fmt.Errorf("default_app is required in the configuration")
	}

	// Check if the default app is in the list of apps and is enabled
	defaultAppFound := false
	for i, app := range config.Apps {
		// If path is not specified, use the name as the default path
		if app.Path == "" {
			config.Apps[i].Path = app.Name
		}

		if app.Name == config.DefaultApp && app.Enabled {
			defaultAppFound = true
		}
	}

	if !defaultAppFound {
		return nil, fmt.Errorf("default app '%s' not found or not enabled in the configuration", config.DefaultApp)
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
