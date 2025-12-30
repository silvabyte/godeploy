// Package paths provides XDG-compliant directory paths for the godeploy CLI.
// All CLI components should use this package instead of directly accessing xdg.
//
// Directory structure:
//
//	~/.config/godeploy/           ConfigDir - auth tokens, user settings
//	~/.local/share/godeploy/      DataDir   - persistent application data
//	~/.cache/godeploy/            CacheDir  - temporary build artifacts
//	~/.local/state/godeploy/      StateDir  - logs, runtime state
//	~/.local/state/godeploy/logs/ LogDir    - log files
package paths

import (
	"os"
	"path/filepath"

	"github.com/adrg/xdg"
)

// AppName is the application identifier used in XDG paths
const AppName = "godeploy"

// Func is a function type for getting directory paths (allows mocking in tests)
type Func func() string

var (
	// ConfigDir is the user-specific config directory (~/.config/godeploy)
	// Used for: auth tokens, user settings
	ConfigDir string

	// DataDir is the user-specific data directory (~/.local/share/godeploy)
	// Used for: persistent application data
	DataDir string

	// CacheDir is the user-specific cache directory (~/.cache/godeploy)
	// Used for: temporary build artifacts, deployment caches
	CacheDir string

	// StateDir is the user-specific state directory (~/.local/state/godeploy)
	// Used for: logs, runtime state
	StateDir string

	// LogDir is the directory for log files (~/.local/state/godeploy/logs)
	LogDir string
)

// GetConfigDir is a function variable for getting the config directory (mockable in tests)
var GetConfigDir Func = func() string {
	return ConfigDir
}

// GetDataDir is a function variable for getting the data directory (mockable in tests)
var GetDataDir Func = func() string {
	return DataDir
}

// GetCacheDir is a function variable for getting the cache directory (mockable in tests)
var GetCacheDir Func = func() string {
	return CacheDir
}

// GetStateDir is a function variable for getting the state directory (mockable in tests)
var GetStateDir Func = func() string {
	return StateDir
}

// GetLogDir is a function variable for getting the log directory (mockable in tests)
var GetLogDir Func = func() string {
	return LogDir
}

func init() {
	ConfigDir = filepath.Join(xdg.ConfigHome, AppName)
	DataDir = filepath.Join(xdg.DataHome, AppName)
	CacheDir = filepath.Join(xdg.CacheHome, AppName)
	StateDir = filepath.Join(xdg.StateHome, AppName)
	LogDir = filepath.Join(StateDir, "logs")
}

// EnsureDir creates a directory if it doesn't exist
func EnsureDir(path string) error {
	return os.MkdirAll(path, 0o755)
}

// ConfigFile returns the path to a config file, creating parent dirs if needed
func ConfigFile(name string) (string, error) {
	dir := GetConfigDir()
	if err := EnsureDir(dir); err != nil {
		return "", err
	}
	return filepath.Join(dir, name), nil
}

// DataFile returns the path to a data file, creating parent dirs if needed
func DataFile(name string) (string, error) {
	dir := GetDataDir()
	if err := EnsureDir(dir); err != nil {
		return "", err
	}
	return filepath.Join(dir, name), nil
}

// CacheFile returns the path to a cache file, creating parent dirs if needed
func CacheFile(name string) (string, error) {
	dir := GetCacheDir()
	if err := EnsureDir(dir); err != nil {
		return "", err
	}
	return filepath.Join(dir, name), nil
}

// StateFile returns the path to a state file, creating parent dirs if needed
func StateFile(name string) (string, error) {
	dir := GetStateDir()
	if err := EnsureDir(dir); err != nil {
		return "", err
	}
	return filepath.Join(dir, name), nil
}

// LogFile returns the path to a log file, creating parent dirs if needed
func LogFile(name string) (string, error) {
	dir := GetLogDir()
	if err := EnsureDir(dir); err != nil {
		return "", err
	}
	return filepath.Join(dir, name), nil
}

// DeployCacheDir returns the deployment cache subdirectory path
func DeployCacheDir() string {
	return filepath.Join(GetCacheDir(), "deploys")
}

// EnsureDeployCacheDir creates the deployment cache directory if needed
func EnsureDeployCacheDir() error {
	return EnsureDir(DeployCacheDir())
}
