package docker

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/audetic/godeploy/pkg/config"
)

// Templates for Docker files
const (
	dockerfileTemplate = `FROM nginx:1.13-alpine

# Install required tools
RUN apk add --no-cache bash curl jq

# Copy Nginx configuration
COPY etc/nginx/ /etc/nginx/

# Create base directory for all SPAs
RUN mkdir -p /usr/share/nginx/html

# Copy the SPAs
{{range .Apps}}
COPY usr/share/nginx/html/{{.Name}}/ /usr/share/nginx/html/{{.Name}}/
{{end}}

# Expose standard HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
`
)

// GenerateDockerfile generates a Dockerfile for the SPA server
func GenerateDockerfile(spaConfig *config.SpaConfig, outputDir string) error {
	// Create output directory
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		return fmt.Errorf("failed to create output directory: %w", err)
	}

	// Generate Dockerfile
	tmpl, err := template.New("Dockerfile").Parse(dockerfileTemplate)
	if err != nil {
		return fmt.Errorf("failed to parse Dockerfile template: %w", err)
	}

	dockerfilePath := filepath.Join(outputDir, "Dockerfile")
	dockerfileFile, err := os.Create(dockerfilePath)
	if err != nil {
		return fmt.Errorf("failed to create Dockerfile: %w", err)
	}
	defer dockerfileFile.Close()

	data := struct {
		Apps []config.App
	}{
		Apps: spaConfig.GetEnabledApps(),
	}

	if err := tmpl.Execute(dockerfileFile, data); err != nil {
		return fmt.Errorf("failed to execute Dockerfile template: %w", err)
	}

	return nil
}

// RunLocalDocker runs the SPA server locally using Docker
func RunLocalDocker(outputDir string) error {
	// Check if Docker is installed
	if err := runCommand("docker", "--version"); err != nil {
		return fmt.Errorf("Docker is not installed or not in PATH: %w", err)
	}

	// Container name
	containerName := "audetic-spa-server"

	// Check if the container is already running and stop/remove it
	fmt.Println("Checking for existing container...")
	checkCmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", containerName), "--format", "{{.ID}}")
	output, err := checkCmd.Output()
	if err == nil && len(output) > 0 {
		containerId := strings.TrimSpace(string(output))
		if containerId != "" {
			fmt.Printf("Found existing container %s, stopping and removing it...\n", containerName)
			// Stop the container if it's running
			stopCmd := exec.Command("docker", "stop", containerId)
			stopCmd.Run() // Ignore errors, as the container might not be running

			// Remove the container
			if err := runCommand("docker", "rm", containerId); err != nil {
				return fmt.Errorf("failed to remove existing container: %w", err)
			}
		}
	}

	// Build the Docker image
	fmt.Println("Building Docker image...")
	if err := runCommand("docker", "build", "-t", "audetic-spa-server", outputDir); err != nil {
		return fmt.Errorf("failed to build Docker image: %w", err)
	}

	// Run the Docker container
	fmt.Println("Running Docker container on http://localhost:8082")
	fmt.Println("Press Ctrl+C to stop the server")
	cmd := exec.Command("docker", "run", "--rm", "-p", "8082:80", "--name", containerName, "audetic-spa-server")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

// runCommand runs a command with arguments
func runCommand(command string, args ...string) error {
	cmd := exec.Command(command, args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}
