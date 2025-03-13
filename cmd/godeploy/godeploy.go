package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/alecthomas/kong"
	"github.com/audetic/godeploy/pkg/config"
	"github.com/audetic/godeploy/pkg/docker"
	"github.com/audetic/godeploy/pkg/nginx"
)

// CLI represents the command-line interface structure
var CLI struct {
	// Global flags
	Config string `help:"Path to the SPA configuration file" default:"spa-config.json"`

	// Commands
	Serve  ServeCmd  `cmd:"" help:"Start a local server for testing"`
	Deploy DeployCmd `cmd:"" help:"Generate deployment files"`
}

// ServeCmd represents the serve command
type ServeCmd struct {
	Output string `help:"Output directory for deployment files" default:"deploy"`
}

// DeployCmd represents the deploy command
type DeployCmd struct {
	Output string `help:"Output directory for deployment files" default:"deploy"`
}

// Run executes the serve command
func (s *ServeCmd) Run() error {
	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		return fmt.Errorf("error loading configuration: %w", err)
	}

	// Generate deployment files
	if err := generateDeploymentFiles(spaConfig, s.Output); err != nil {
		return fmt.Errorf("error generating deployment files: %w", err)
	}

	// Run the server locally
	fmt.Println("Starting server with Docker...")
	if err := docker.RunLocalDocker(s.Output); err != nil {
		return fmt.Errorf("error running Docker: %w", err)
	}

	return nil
}

// Run executes the deploy command
func (d *DeployCmd) Run() error {
	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		return fmt.Errorf("error loading configuration: %w", err)
	}

	// Generate deployment files
	if err := generateDeploymentFiles(spaConfig, d.Output); err != nil {
		return fmt.Errorf("error generating deployment files: %w", err)
	}

	fmt.Printf("Deployment files generated in %s\n", d.Output)
	fmt.Println("You can now deploy these files to your cloud provider.")

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

// generateDeploymentFiles generates all the files needed for deployment
func generateDeploymentFiles(spaConfig *config.SpaConfig, outputDir string) error {
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
