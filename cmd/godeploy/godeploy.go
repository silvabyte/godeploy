package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/alecthomas/kong"
	"github.com/audetic/godeploy/pkg/api"
	"github.com/audetic/godeploy/pkg/auth"
	"github.com/audetic/godeploy/pkg/config"
	"github.com/audetic/godeploy/pkg/docker"
	"github.com/audetic/godeploy/pkg/nginx"
)

// CLI represents the command-line interface structure
var CLI struct {
	// Global flags
	Config string `help:"Path to the SPA configuration file" default:"spa-config.json"`

	// Commands
	Serve   ServeCmd   `cmd:"" help:"Start a local server for testing"`
	Package PackageCmd `cmd:"" help:"Generate container files for deployment"`
	Init    InitCmd    `cmd:"" help:"Initialize a new spa-config.json file"`
	Auth    AuthCmd    `cmd:"" help:"Authenticate with the GoDeploy service"`
	Logout  LogoutCmd  `cmd:"" help:"Log out from the GoDeploy service"`
	Status  StatusCmd  `cmd:"" help:"Check authentication status"`
	Deploy  DeployCmd  `cmd:"" help:"Deploy your SPA to the GoDeploy service (Coming Soon)"`
}

// ServeCmd represents the serve command
type ServeCmd struct {
	Output    string `help:"Output directory for container files" default:"deploy"`
	Port      int    `help:"Port to run the server on" default:"8082"`
	ImageName string `help:"Docker image name" default:"godeploy-spa-server"`
}

// PackageCmd represents the package command
type PackageCmd struct {
	Output string `help:"Output directory for container files" default:"deploy"`
}

// InitCmd represents the init command
type InitCmd struct {
	Force bool `help:"Overwrite existing config file if it exists" short:"f"`
}

// AuthCmd represents the auth command
type AuthCmd struct {
	Email string `help:"Email address to authenticate with" required:""`
}

// LogoutCmd represents the logout command
type LogoutCmd struct {
}

// StatusCmd represents the status command
type StatusCmd struct {
}

// DeployCmd represents the deploy command
type DeployCmd struct {
	Output string `help:"Output directory for container files" default:"deploy"`
}

// defaultConfig is the default configuration template
const defaultConfig = `{
  "default_app": "yourAppName",
  "apps": [
    {
      "name": "yourAppName",
      "source_dir": "dist",
      "description": "Your application description",
      "enabled": true
    }
  ]
}
`

// Run executes the serve command
func (s *ServeCmd) Run() error {
	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		return fmt.Errorf("error loading configuration: %w", err)
	}

	// Generate container files
	if err := generateContainerFiles(spaConfig, s.Output); err != nil {
		return fmt.Errorf("error generating container files: %w", err)
	}

	// Run the server locally
	fmt.Println("Starting server with Docker...")
	if err := docker.RunLocalDocker(s.Output, s.Port, s.ImageName); err != nil {
		return fmt.Errorf("error running Docker: %w", err)
	}

	return nil
}

// Run executes the package command
func (d *PackageCmd) Run() error {
	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		return fmt.Errorf("error loading configuration: %w", err)
	}

	// Generate container files
	if err := generateContainerFiles(spaConfig, d.Output); err != nil {
		return fmt.Errorf("error generating container files: %w", err)
	}

	fmt.Printf("Container files generated in %s\n", d.Output)
	fmt.Println("You can now build and deploy this container to your cloud provider.")

	return nil
}

// Run executes the init command
func (i *InitCmd) Run() error {
	configPath := CLI.Config

	// Check if the file already exists
	if _, err := os.Stat(configPath); err == nil && !i.Force {
		return fmt.Errorf("config file %s already exists. Use --force to overwrite", configPath)
	}

	// Create the config file
	if err := os.WriteFile(configPath, []byte(defaultConfig), 0644); err != nil {
		return fmt.Errorf("failed to create config file: %w", err)
	}

	fmt.Printf("Created config file: %s\n", configPath)
	fmt.Println("You can now edit this file to configure your SPAs.")
	return nil
}

// Run executes the auth command
func (a *AuthCmd) Run() error {
	// Check if already authenticated
	isAuth, err := auth.IsAuthenticated()
	if err != nil {
		return fmt.Errorf("error checking authentication: %w", err)
	}
	if isAuth {
		fmt.Println("You are already authenticated. To log out, run 'godeploy logout'.")
		return nil
	}

	// Create a context with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Minute)
	defer cancel()

	// Start the local server
	fmt.Println("Starting local authentication server...")
	fmt.Printf("Waiting for authentication at http://localhost:%d/callback\n", auth.DefaultPort)

	// Start the local server in a goroutine
	serverDone := make(chan struct{})
	var token string
	var serverErr error

	go func() {
		token, serverErr = auth.StartLocalServer(ctx)
		close(serverDone)
	}()

	// Initialize the authentication flow
	redirectURI := auth.GetRedirectURI()
	apiClient := api.NewClient()

	fmt.Printf("Sending authentication request for %s...\n", a.Email)
	authResp, err := apiClient.InitAuth(a.Email, redirectURI)
	if err != nil {
		cancel() // Cancel the server context
		<-serverDone
		return fmt.Errorf("failed to initialize authentication: %w", err)
	}

	fmt.Println(authResp.Message)
	fmt.Println("Waiting for you to complete authentication...")
	fmt.Println("Check your email for a login link and click it to authenticate.")

	// Wait for the server to complete
	<-serverDone
	if serverErr != nil {
		return fmt.Errorf("authentication failed: %w", serverErr)
	}

	// Save the token
	if err := auth.SetAuthToken(token); err != nil {
		return fmt.Errorf("failed to save authentication token: %w", err)
	}

	fmt.Println("✅ Authentication successful! You are now logged in.")
	return nil
}

// Run executes the logout command
func (l *LogoutCmd) Run() error {
	// Check if authenticated
	isAuth, err := auth.IsAuthenticated()
	if err != nil {
		return fmt.Errorf("error checking authentication: %w", err)
	}
	if !isAuth {
		fmt.Println("You are not currently authenticated.")
		return nil
	}

	// Clear the token
	if err := auth.ClearAuthToken(); err != nil {
		return fmt.Errorf("failed to clear authentication token: %w", err)
	}

	fmt.Println("✅ You have been successfully logged out.")
	return nil
}

// Run executes the status command
func (s *StatusCmd) Run() error {
	// Check if authenticated
	isAuth, err := auth.IsAuthenticated()
	if err != nil {
		return fmt.Errorf("error checking authentication: %w", err)
	}

	if isAuth {
		token, err := auth.GetAuthToken()
		if err != nil {
			return fmt.Errorf("error getting authentication token: %w", err)
		}

		// Only show the first 10 characters of the token for security
		tokenPreview := ""
		if len(token) > 10 {
			tokenPreview = token[:10] + "..."
		} else {
			tokenPreview = token
		}

		fmt.Println("✅ You are authenticated with GoDeploy.")
		fmt.Printf("Token: %s\n", tokenPreview)
	} else {
		fmt.Println("❌ You are not authenticated with GoDeploy.")
		fmt.Println("Run 'godeploy auth --email=your@email.com' to authenticate.")
	}

	return nil
}

// Run executes the deploy command
func (d *DeployCmd) Run() error {
	// Check if authenticated
	isAuth, err := auth.IsAuthenticated()
	if err != nil {
		return fmt.Errorf("error checking authentication: %w", err)
	}
	if !isAuth {
		return fmt.Errorf("you must be authenticated to use this command. Run 'godeploy auth --email=your@email.com' to authenticate")
	}

	fmt.Println("🚧 The deploy command is coming soon!")
	fmt.Println("This feature is currently in development and will be available in a future release.")
	fmt.Println("Stay tuned for updates!")

	return nil
}

// RunCLI parses and executes the CLI commands
func RunCLI() error {
	ctx := kong.Parse(&CLI,
		kong.Name("godeploy"),
		kong.Description("A CLI tool for bootstrapping and configuring SPA deployments using Docker and Nginx"),
		kong.UsageOnError(),
		kong.ConfigureHelp(kong.HelpOptions{
			Compact: true,
			Summary: true,
		}),
	)

	return ctx.Run()
}

// generateContainerFiles generates all the files needed for containerization
func generateContainerFiles(spaConfig *config.SpaConfig, outputDir string) error {
	// Create the output directory
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	// Generate Nginx configurations
	if err := nginx.GenerateNginxConfigs(spaConfig, outputDir); err != nil {
		return fmt.Errorf("failed to generate Nginx configurations: %w", err)
	}

	// Process each enabled SPA
	for _, app := range spaConfig.GetEnabledApps() {
		spaDir := app.SourceDir
		if !filepath.IsAbs(spaDir) {
			// If the source directory is relative, resolve it relative to the current directory
			spaDir = filepath.Join(".", spaDir)
		}

		// Check if the SPA directory exists
		if _, err := os.Stat(spaDir); os.IsNotExist(err) {
			return fmt.Errorf("SPA directory %s does not exist", spaDir)
		}

		// Process the SPA assets
		if err := nginx.ProcessSpaAssets(app, spaDir, outputDir); err != nil {
			return fmt.Errorf("failed to process SPA assets for %s: %w", app.Name, err)
		}
	}

	// Generate Docker files
	if err := docker.GenerateDockerfile(spaConfig, outputDir); err != nil {
		return fmt.Errorf("failed to generate Docker files: %w", err)
	}

	return nil
}
