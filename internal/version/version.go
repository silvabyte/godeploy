package version

// These variables are set during build time using ldflags
var (
	// Version is the current version of the application
	// If not set at build time, a default "0.0.0-development" value is used
	Version = "0.0.0-development"
)

// GetVersion returns the current version of the application
func GetVersion() (string, error) {
	return Version, nil
}
