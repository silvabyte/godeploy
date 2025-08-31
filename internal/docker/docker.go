package docker

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"

	"github.com/audetic/godeploy/internal/config"
	"github.com/yarlson/pin"
)

// Templates for Docker files
const (
	dockerfileTemplate = `FROM nginx:1.25-alpine

# Install required tools
RUN apk add --no-cache bash 

# Copy Nginx configuration
COPY etc/nginx/ /etc/nginx/

# Create base directory for all SPAs
RUN mkdir -p /usr/share/nginx/html

# Copy the SPAs
{{range .Apps}}
COPY usr/share/nginx/html/{{.Slug}}/ /usr/share/nginx/html/{{.Slug}}/
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
	if err := os.MkdirAll(outputDir, 0o755); err != nil {
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
func RunLocalDocker(spinner *pin.Pin, outputDir string, port int, imageName string) error {
	// Check if Docker is installed
	spinner.UpdateMessage("Checking if Docker is installed...")
	if err := runCommand("docker", "--version"); err != nil {
		spinner.UpdateMessage("Docker is not installed or not in PATH")
		return fmt.Errorf("docker is not installed or not in PATH: %w", err)
	}

	// If image name is not provided, use default
	if imageName == "" {
		imageName = "godeploy-spa-server"
	}

	// Container name - derive from image name
	containerName := imageName

	// Check if the container is already running and stop/remove it
	spinner.UpdateMessage("Checking for existing container...")
	checkCmd := exec.Command("docker", "ps", "-a", "--filter", fmt.Sprintf("name=%s", containerName), "--format", "{{.ID}}")
	output, err := checkCmd.Output()
	if err == nil && len(output) > 0 {
		containerId := strings.TrimSpace(string(output))
		if containerId != "" {
			spinner.UpdateMessage("Removing existing container...")
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
	spinner.UpdateMessage("Starting Docker container...")
	if err := runCommand("docker", "build", "--no-cache", "-t", imageName, outputDir); err != nil {
		return fmt.Errorf("failed to build Docker image: %w", err)
	}

	// Run the Docker container
	cmd := exec.Command("docker", "run", "--rm", "-p", fmt.Sprintf("%d:80", port), "--name", containerName, imageName)
	// TODO: have debug logs output to the ~/.config/godeploy/logs/docker.log file
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	spinner.UpdateMessage("Container running on http://localhost:" + strconv.Itoa(port) + " (Press Ctrl+C to stop)")
	return cmd.Run()
}

// runCommand runs a command with arguments
func runCommand(command string, args ...string) error {
	cmd := exec.Command(command, args...)
	// TODO: have debug logs output to the ~/.config/godeploy/logs/docker.log file
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	return cmd.Run()
}
