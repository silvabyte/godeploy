package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/audetic/godeploy/pkg/config"
	"github.com/audetic/godeploy/pkg/docker"
	"github.com/audetic/godeploy/pkg/nginx"
)

const (
	defaultConfigPath = "spa-config.json"
	defaultOutputDir  = "deploy"
)

func main() {
	// Define command-line flags
	configPath := flag.String("config", defaultConfigPath, "Path to the SPA configuration file")
	outputDir := flag.String("output", defaultOutputDir, "Output directory for deployment files")

	// Define custom usage function
	flag.Usage = func() {
		printUsage()
	}

	// Define subcommands
	serveCmd := flag.NewFlagSet("serve", flag.ExitOnError)

	deployCmd := flag.NewFlagSet("deploy", flag.ExitOnError)
	deployOutput := deployCmd.String("output", defaultOutputDir, "Output directory for deployment files")

	// Parse the main flags
	flag.Parse()

	// Check if a subcommand is provided
	if len(flag.Args()) < 1 {
		printUsage()
		os.Exit(1)
	}

	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error loading configuration: %v\n", err)
		os.Exit(1)
	}

	// Process the subcommand
	switch flag.Args()[0] {
	case "serve":
		// Parse the serve subcommand flags
		serveCmd.Parse(flag.Args()[1:])

		// Generate deployment files
		if err := generateDeploymentFiles(spaConfig, *outputDir); err != nil {
			fmt.Fprintf(os.Stderr, "Error generating deployment files: %v\n", err)
			os.Exit(1)
		}

		// Run the server locally
		fmt.Println("Starting server with Docker...")
		if err := docker.RunLocalDocker(*outputDir); err != nil {
			fmt.Fprintf(os.Stderr, "Error running Docker: %v\n", err)
			os.Exit(1)
		}

	case "deploy":
		// Parse the deploy subcommand flags
		deployCmd.Parse(flag.Args()[1:])

		// Generate deployment files
		if err := generateDeploymentFiles(spaConfig, *deployOutput); err != nil {
			fmt.Fprintf(os.Stderr, "Error generating deployment files: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("Deployment files generated in %s\n", *deployOutput)
		fmt.Println("You can now deploy these files to your cloud provider.")

	default:
		fmt.Fprintf(os.Stderr, "Unknown subcommand: %s\n", flag.Args()[0])
		printUsage()
		os.Exit(1)
	}
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

// printUsage prints the usage information
func printUsage() {
	fmt.Println("Usage: godeploy [options] <command>")
	fmt.Println()
	fmt.Println("Options:")
	flag.PrintDefaults()
	fmt.Println()
	fmt.Println("Commands:")
	fmt.Println("  serve    Start a local server for testing")
	fmt.Println("  deploy   Generate deployment files")
	fmt.Println()
	fmt.Println("For command-specific help, run: godeploy <command> -h")
}
