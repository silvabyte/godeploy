package auth

import (
	"os"
	"path/filepath"
	"testing"
)

func TestConfigPath(t *testing.T) {
	// Test that the config directory path is correctly generated
	configDir, err := GetConfigDir()
	if err != nil {
		t.Fatalf("Failed to get config directory: %v", err)
	}

	// Check that the path is not empty
	if configDir == "" {
		t.Fatal("Config directory path is empty")
	}

	// Test that the config file path is correctly generated
	configPath, err := GetConfigFilePath()
	if err != nil {
		t.Fatalf("Failed to get config file path: %v", err)
	}

	// Check that the path is not empty
	if configPath == "" {
		t.Fatal("Config file path is empty")
	}

	// Check that the path ends with config.json
	if filepath.Base(configPath) != "config.json" {
		t.Fatalf("Expected config file path to end with config.json, got %s", configPath)
	}
}

func TestAuthConfig(t *testing.T) {
	// Create a temporary directory for testing
	tempDir, err := os.MkdirTemp("", "godeploy-test")
	if err != nil {
		t.Fatalf("Failed to create temporary directory: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Create a test config
	testConfig := &AuthConfig{
		AuthToken: "test-token",
	}

	// Save the original function and restore it after the test
	origGetConfigDir := GetConfigDir
	defer func() {
		GetConfigDir = origGetConfigDir
	}()

	// Mock the GetConfigDir function
	GetConfigDir = func() (string, error) {
		return tempDir, nil
	}

	// Test saving the config
	if err := SaveAuthConfig(testConfig); err != nil {
		t.Fatalf("Failed to save auth config: %v", err)
	}

	// Test loading the config
	loadedConfig, err := LoadAuthConfig()
	if err != nil {
		t.Fatalf("Failed to load auth config: %v", err)
	}

	// Check that the loaded config matches the saved config
	if loadedConfig.AuthToken != testConfig.AuthToken {
		t.Fatalf("Expected auth token %s, got %s", testConfig.AuthToken, loadedConfig.AuthToken)
	}

	// Test setting the auth token
	if err := SetAuthToken("new-token"); err != nil {
		t.Fatalf("Failed to set auth token: %v", err)
	}

	// Test getting the auth token
	token, err := GetAuthToken()
	if err != nil {
		t.Fatalf("Failed to get auth token: %v", err)
	}
	if token != "new-token" {
		t.Fatalf("Expected auth token new-token, got %s", token)
	}

	// Test clearing the auth token
	if err := ClearAuthToken(); err != nil {
		t.Fatalf("Failed to clear auth token: %v", err)
	}

	// Test that the auth token is cleared
	token, err = GetAuthToken()
	if err != nil {
		t.Fatalf("Failed to get auth token: %v", err)
	}
	if token != "" {
		t.Fatalf("Expected empty auth token, got %s", token)
	}

	// Test IsAuthenticated
	isAuth, err := IsAuthenticated()
	if err != nil {
		t.Fatalf("Failed to check if authenticated: %v", err)
	}
	if isAuth {
		t.Fatal("Expected not to be authenticated")
	}

	// Set the auth token and test IsAuthenticated again
	if err := SetAuthToken("test-token"); err != nil {
		t.Fatalf("Failed to set auth token: %v", err)
	}
	isAuth, err = IsAuthenticated()
	if err != nil {
		t.Fatalf("Failed to check if authenticated: %v", err)
	}
	if !isAuth {
		t.Fatal("Expected to be authenticated")
	}
}
