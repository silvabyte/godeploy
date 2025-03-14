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
	Serve   ServeCmd   `cmd:"" help:"Start a local server for testing"`
	Package PackageCmd `cmd:"" help:"Generate container files for deployment"`
	Init    InitCmd    `cmd:"" help:"Initialize a new spa-config.json file"`
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
