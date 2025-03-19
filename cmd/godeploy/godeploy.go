package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/alecthomas/kong"
	"github.com/audetic/godeploy/pkg/api"
	"github.com/audetic/godeploy/pkg/archive"
	"github.com/audetic/godeploy/pkg/auth"
	"github.com/audetic/godeploy/pkg/config"
	"github.com/audetic/godeploy/pkg/docker"
	"github.com/audetic/godeploy/pkg/nginx"
	"github.com/yarlson/pin"
)

// CLI represents the command-line interface structure
var CLI struct {
	// Global flags
	Config string `help:"Path to the SPA configuration file" default:"godeploy.config.json"`

	// Commands
	Serve   ServeCmd   `cmd:"" help:"Start a local server for testing"`
	Package PackageCmd `cmd:"" help:"Generate container files for deployment"`
	Init    InitCmd    `cmd:"" help:"Initialize a new godeploy.config.json file"`
	Auth    AuthCmd    `cmd:"" help:"Authentication commands"`
	Deploy  DeployCmd  `cmd:"" help:"Deploy your SPA to the GoDeploy service (requires authentication)"`
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
	Login  LoginCmd  `cmd:"" help:"Authenticate with the GoDeploy service" default:"1"`
	Status StatusCmd `cmd:"" help:"Check authentication status"`
	Logout LogoutCmd `cmd:"" help:"Log out from the GoDeploy service"`
}

// LoginCmd represents the auth login command
type LoginCmd struct {
	Email string `help:"Email address to authenticate with" default:""`
}

// LogoutCmd represents the logout command
type LogoutCmd struct {
}

// StatusCmd represents the status command
type StatusCmd struct {
}

// DeployCmd represents the deploy command
type DeployCmd struct {
	Project string `help:"Project name for deployment" default:""`
	Output  string `help:"Output directory for spa build files" default:"dist"`
}

// defaultConfig is the default configuration template
const defaultConfig = `{
  "apps": [
    {
      "name": "yourAppName",
      "source_dir": "dist",
      "path": "/",
      "description": "Your application description",
      "enabled": true
    }
  ]
}
`

// Run executes the serve command
func (s *ServeCmd) Run() error {
	// Create a context
	ctx := context.Background()

	// Create a spinner for loading configuration
	configSpinner := pin.New("Loading SPA configuration...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	configCancel := configSpinner.Start(ctx)

	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		configCancel()
		configSpinner.Fail("Failed to load configuration")
		return fmt.Errorf("error loading configuration: %w", err)
	}
	configCancel()
	configSpinner.Stop("Config loaded: " + CLI.Config)

	// Create a spinner for generating container files
	genSpinner := pin.New("Generating container files...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	genCancel := genSpinner.Start(ctx)

	// Generate container files
	if err := generateContainerFiles(spaConfig, s.Output); err != nil {
		genCancel()
		genSpinner.Fail("Failed to generate container files")
		return fmt.Errorf("error generating container files: %w", err)
	}
	genCancel()
	genSpinner.Stop("Container files generated")

	// Create a spinner for starting Docker
	dockerSpinner := pin.New("Starting server with Docker...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	dockerCancel := dockerSpinner.Start(ctx)
	defer dockerCancel()

	// Run the server locally
	if err := docker.RunLocalDocker(dockerSpinner, s.Output, s.Port, s.ImageName); err != nil {
		dockerSpinner.Fail("Failed to start Docker")
		//TODO: log the error to the ~/.config/godeploy/logs/docker.log file
		return fmt.Errorf("error running Docker: %w", err)
	}
	dockerSpinner.Stop("Docker server stopped")
	return nil
}

// Run executes the package command
func (d *PackageCmd) Run() error {
	// Create a context
	ctx := context.Background()

	// Create a spinner for loading configuration
	configSpinner := pin.New("Loading SPA configuration...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	configCancel := configSpinner.Start(ctx)

	// Load the SPA configuration
	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		configCancel()
		configSpinner.Fail("Failed to load configuration")
		return fmt.Errorf("error loading configuration: %w", err)
	}
	configCancel()
	configSpinner.Stop("Configuration loaded")

	// Create a spinner for generating container files
	genSpinner := pin.New("Generating container files...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	genCancel := genSpinner.Start(ctx)

	// Generate container files
	if err := generateContainerFiles(spaConfig, d.Output); err != nil {
		genCancel()
		genSpinner.Fail("Failed to generate container files")
		return fmt.Errorf("error generating container files: %w", err)
	}
	genCancel()
	genSpinner.Stop("Container files generated")

	fmt.Printf("✅ Container files generated in %s\n", d.Output)
	fmt.Println("You can now build and deploy this container to your cloud provider.")

	return nil
}

// Run executes the init command
func (i *InitCmd) Run() error {
	// Create a context
	ctx := context.Background()
	configPath := CLI.Config

	// Create a spinner for checking existing config
	checkSpinner := pin.New(fmt.Sprintf("Checking for existing config at %s...", configPath),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	checkCancel := checkSpinner.Start(ctx)

	// Check if the file already exists
	if _, err := os.Stat(configPath); err == nil && !i.Force {
		checkCancel()
		checkSpinner.Fail("Config file already exists")
		return fmt.Errorf("config file %s already exists. Use --force to overwrite", configPath)
	}
	checkCancel()
	checkSpinner.Stop("Config check complete")

	// Create a spinner for creating the config file
	createSpinner := pin.New("Creating configuration file...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	createCancel := createSpinner.Start(ctx)

	// Create the config file
	if err := os.WriteFile(configPath, []byte(defaultConfig), 0644); err != nil {
		createCancel()
		createSpinner.Fail("Failed to create config file")
		return fmt.Errorf("failed to create config file: %w", err)
	}

	createCancel()
	createSpinner.Stop("Configuration created")
	fmt.Printf("✅ Created config file: %s\n", configPath)
	fmt.Println("You can now edit this file to configure your SPAs.")
	return nil
}

// Run executes the login command
func (l *LoginCmd) Run() error {
	// Check if already authenticated
	isAuth, err := auth.IsAuthenticated()
	if err != nil {
		return fmt.Errorf("error checking authentication: %w", err)
	}

	// Get token if it exists
	existingToken, err := auth.GetAuthToken()
	if err != nil {
		return fmt.Errorf("error retrieving authentication token: %w", err)
	}

	// Only proceed with token verification if we have a token
	if isAuth && existingToken != "" {
		// Verify the token with the API
		apiClient := api.NewClient()
		verifyResp, err := apiClient.VerifyToken(existingToken)

		// If token is valid, inform user and exit
		if err == nil && verifyResp.Valid {
			fmt.Println("You are already authenticated. To log out, run 'godeploy auth logout'.")
			return nil
		}

		// If we get here, the token is invalid, so we should clear it and continue with login
		if err := auth.ClearAuthToken(); err != nil {
			return fmt.Errorf("failed to clear invalid authentication token: %w", err)
		}
	}

	// Get email from argument or stored config
	email := l.Email
	if email == "" {
		// Try to get email from saved config
		savedEmail, err := auth.GetUserEmail()
		if err != nil {
			return fmt.Errorf("error retrieving saved email: %w", err)
		}

		if savedEmail != "" {
			email = savedEmail
			fmt.Printf("Using saved email: %s\n", email)
		} else {
			return fmt.Errorf("email is required for authentication. Please provide it with --email flag")
		}
	}

	// Create a context with a timeout
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Minute)
	defer cancel()

	// Create a spinner for starting the local server
	serverSpinner := pin.New("Starting local authentication server...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	serverCancel := serverSpinner.Start(ctx)

	// Start the local server in a goroutine
	serverDone := make(chan struct{})
	var token string
	var serverErr error

	go func() {
		token, serverErr = auth.StartLocalServer(ctx)
		close(serverDone)
	}()

	// Wait a moment for the server to start
	time.Sleep(500 * time.Millisecond)
	serverCancel()
	serverSpinner.Stop("Local server started")
	fmt.Printf("Listening for authentication at http://localhost:%d/callback\n", auth.DefaultPort)

	// Create a spinner for the authentication request
	authSpinner := pin.New(fmt.Sprintf("Sending authentication request for %s...", email),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	authCancel := authSpinner.Start(ctx)

	// Initialize the authentication flow
	redirectURI := auth.GetRedirectURI()
	apiClient := api.NewClient()

	_, err = apiClient.InitAuth(email, redirectURI)
	authCancel()
	authSpinner.Stop("Authentication request sent")

	if err != nil {
		cancel() // Cancel the server context
		<-serverDone
		return fmt.Errorf("failed to initialize authentication: %w", err)
	}

	// Create a spinner for waiting for authentication
	waitSpinner := pin.New("Waiting for you to complete authentication...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	waitCancel := waitSpinner.Start(ctx)
	fmt.Println("Check your email for a login link and click it to authenticate.")

	// Wait for the server to complete
	<-serverDone
	waitCancel()
	waitSpinner.Stop("Authentication received")

	if serverErr != nil {
		// Check if the error contains a specific error message
		if strings.Contains(serverErr.Error(), "access_denied") {
			fmt.Println("❌ Authentication was denied.")
		} else if strings.Contains(serverErr.Error(), "otp_expired") {
			fmt.Println("❌ Authentication link has expired. Please try again.")
		} else if strings.Contains(serverErr.Error(), "Email link is invalid") {
			fmt.Println("❌ The authentication link is invalid. Please try again.")
		} else {
			fmt.Println("❌ Authentication failed:", serverErr)
		}
		return serverErr
	}

	// Create a spinner for saving the token
	saveSpinner := pin.New("Saving authentication token...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	saveCancel := saveSpinner.Start(ctx)

	// Save the token and email
	if err := auth.SetAuthToken(token); err != nil {
		saveCancel()
		saveSpinner.Fail("Failed to save token")
		return fmt.Errorf("failed to save authentication token: %w", err)
	}

	// Save email for future authentication
	if err := auth.SetUserEmail(email); err != nil {
		saveCancel()
		saveSpinner.Fail("Failed to save email")
		return fmt.Errorf("failed to save email: %w", err)
	}

	saveCancel()
	saveSpinner.Stop("Token saved")
	fmt.Println("✅ Authentication successful! You are now logged in.")
	return nil
}

// Run executes the logout command
func (l *LogoutCmd) Run() error {
	// Create a context
	ctx := context.Background()

	// Check if authenticated
	isAuth, err := auth.IsAuthenticated()
	if err != nil {
		return fmt.Errorf("error checking authentication: %w", err)
	}
	if !isAuth {
		fmt.Println("You are not currently authenticated.")
		return nil
	}

	// Create a spinner for logging out
	logoutSpinner := pin.New("Logging out...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	logoutCancel := logoutSpinner.Start(ctx)

	// Clear the token but keep the email for future logins
	if err := auth.ClearAuthToken(); err != nil {
		logoutCancel()
		logoutSpinner.Fail("Failed to log out")
		return fmt.Errorf("failed to clear authentication token: %w", err)
	}

	logoutCancel()
	logoutSpinner.Stop("Logged out")

	// Get saved email for message
	savedEmail, _ := auth.GetUserEmail()
	if savedEmail != "" {
		fmt.Printf("✅ You have been successfully logged out. Your email (%s) is saved for future logins.\n", savedEmail)
	} else {
		fmt.Println("✅ You have been successfully logged out.")
	}

	return nil
}

// Run executes the status command
func (s *StatusCmd) Run() error {
	// Create a context
	ctx := context.Background()

	// Create a spinner for checking status
	statusSpinner := pin.New("Checking authentication status...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	statusCancel := statusSpinner.Start(ctx)

	// Check if we have a token locally
	token, err := auth.GetAuthToken()
	if err != nil {
		statusCancel()
		statusSpinner.Fail("Failed to check status")
		return fmt.Errorf("error checking authentication: %w", err)
	}

	// Get saved email if available
	savedEmail, _ := auth.GetUserEmail()

	// If there's no token, the user is not authenticated
	if token == "" {
		statusCancel()
		statusSpinner.Stop("Status checked")
		fmt.Println("❌ You are not authenticated with GoDeploy.")
		if savedEmail != "" {
			fmt.Printf("Run 'godeploy auth login' to authenticate with saved email: %s\n", savedEmail)
		} else {
			fmt.Println("Run 'godeploy auth login --email=your@email.com' to authenticate.")
		}
		return nil
	}

	// We have a token, now verify it with the API
	apiClient := api.NewClient()
	verifyResp, err := apiClient.VerifyToken(token)

	// Handle API connection errors
	if err != nil {
		statusCancel()
		statusSpinner.Fail("Failed to verify token")
		fmt.Println("⚠️ Could not verify authentication status with the server.")
		fmt.Println("Error:", err)
		fmt.Println("Your local token may still be valid.")
		return nil
	}

	statusCancel()
	statusSpinner.Stop("Status checked")

	// Check if the token is valid
	if verifyResp.Valid {
		fmt.Println("✅ You are authenticated with GoDeploy.")
		if verifyResp.User.Email != "" {
			fmt.Printf("Logged in as: %s\n", verifyResp.User.Email)
		} else if savedEmail != "" {
			fmt.Printf("Logged in with email: %s\n", savedEmail)
		}
	} else {
		fmt.Println("❌ Your authentication token is invalid or expired.")
		if savedEmail != "" {
			fmt.Printf("Run 'godeploy auth login' to authenticate with saved email: %s\n", savedEmail)
		} else {
			fmt.Println("Run 'godeploy auth login --email=your@email.com' to authenticate.")
		}

		// Clear the invalid token
		if err := auth.ClearAuthToken(); err != nil {
			fmt.Println("⚠️ Warning: Failed to clear invalid token:", err)
		}
	}

	return nil
}

// Run executes the deploy command
func (d *DeployCmd) Run() error {
	// Create a context
	ctx := context.Background()

	// Create a spinner for checking authentication
	authSpinner := pin.New("Checking authentication status...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	authCancel := authSpinner.Start(ctx)

	// Check if we have a token locally
	token, err := auth.GetAuthToken()
	if err != nil {
		authCancel()
		authSpinner.Fail("Failed to check authentication")
		return fmt.Errorf("error checking authentication: %w", err)
	}

	// If there's no token, the user is not authenticated
	if token == "" {
		authCancel()
		authSpinner.Fail("Not authenticated")

		// Try to automatically login if we have a saved email
		savedEmail, emailErr := auth.GetUserEmail()
		if emailErr == nil && savedEmail != "" {
			fmt.Printf("You must be authenticated to use this command.\nAttempting automatic login with saved email: %s\n", savedEmail)

			// Create and run login command with saved email
			loginCmd := &LoginCmd{Email: savedEmail}
			if loginErr := loginCmd.Run(); loginErr != nil {
				return fmt.Errorf("automatic login failed: %w", loginErr)
			}

			// Refresh token after login
			token, err = auth.GetAuthToken()
			if err != nil || token == "" {
				return fmt.Errorf("failed to retrieve authentication token after login")
			}
		} else {
			return fmt.Errorf("you must be authenticated to use this command. Run 'godeploy auth login --email=your@email.com' to authenticate")
		}
	}

	// We have a token, now verify it with the API
	apiClient := api.NewClient()
	verifyResp, err := apiClient.VerifyToken(token)

	// Handle API connection errors
	if err != nil {
		authCancel()
		authSpinner.Fail("Failed to verify token")

		// Try to automatically login if we have a saved email
		savedEmail, emailErr := auth.GetUserEmail()
		if emailErr == nil && savedEmail != "" {
			fmt.Printf("Failed to verify authentication token: %v\nAttempting automatic login with saved email: %s\n", err, savedEmail)

			// Clear the potentially invalid token
			if clearErr := auth.ClearAuthToken(); clearErr != nil {
				fmt.Printf("Warning: Failed to clear token: %v\n", clearErr)
			}

			// Create and run login command with saved email
			loginCmd := &LoginCmd{Email: savedEmail}
			if loginErr := loginCmd.Run(); loginErr != nil {
				return fmt.Errorf("automatic login failed: %w", loginErr)
			}

			// Refresh token after login
			token, err = auth.GetAuthToken()
			if err != nil || token == "" {
				return fmt.Errorf("failed to retrieve authentication token after login")
			}

			// Try to verify the new token
			verifyResp, err = apiClient.VerifyToken(token)
			if err != nil {
				return fmt.Errorf("failed to verify new authentication token: %w", err)
			}
		} else {
			return fmt.Errorf("error verifying authentication: %w", err)
		}
	}

	// Check if the token is valid
	if !verifyResp.Valid {
		authCancel()
		authSpinner.Fail("Invalid authentication")

		// Try to automatically login if we have a saved email
		savedEmail, emailErr := auth.GetUserEmail()
		if emailErr == nil && savedEmail != "" {
			fmt.Printf("Your authentication token is invalid or expired.\nAttempting automatic login with saved email: %s\n", savedEmail)

			// Clear the invalid token
			if clearErr := auth.ClearAuthToken(); clearErr != nil {
				fmt.Printf("Warning: Failed to clear invalid token: %v\n", clearErr)
			}

			// Create and run login command with saved email
			loginCmd := &LoginCmd{Email: savedEmail}
			if loginErr := loginCmd.Run(); loginErr != nil {
				return fmt.Errorf("automatic login failed: %w", loginErr)
			}

			// Refresh token after login
			token, err = auth.GetAuthToken()
			if err != nil || token == "" {
				return fmt.Errorf("failed to retrieve authentication token after login")
			}

			// Verify the new token
			verifyResp, err = apiClient.VerifyToken(token)
			if err != nil || !verifyResp.Valid {
				return fmt.Errorf("new authentication token is invalid")
			}
		} else {
			return fmt.Errorf("your authentication token is invalid or expired. Run 'godeploy auth login --email=your@email.com' to authenticate")
		}
	}

	authCancel()
	authSpinner.Stop("Authentication verified")

	// Load the SPA configuration
	configSpinner := pin.New("Loading SPA configuration...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	configCancel := configSpinner.Start(ctx)

	spaConfig, err := config.LoadConfig(CLI.Config)
	if err != nil {
		configCancel()
		configSpinner.Fail("Failed to load SPA configuration")
		return fmt.Errorf("error loading SPA configuration: %w", err)
	}

	configCancel()
	configSpinner.Stop("SPA configuration loaded")

	// Determine the project name
	projectName := d.Project
	if projectName == "" {
		// If no project is specified, use the first enabled app
		enabledApps := spaConfig.GetEnabledApps()
		if len(enabledApps) == 0 {
			return fmt.Errorf("no enabled apps found in SPA configuration")
		}
		projectName = enabledApps[0].Name
		fmt.Printf("No project specified, using first enabled app: '%s'\n", projectName)
	} else {
		fmt.Printf("Using specified project: '%s'\n", projectName)
	}

	// Validate the project name
	app, found := spaConfig.GetAppByName(projectName)
	if !found {
		return fmt.Errorf("project '%s' not found in SPA configuration", projectName)
	}

	if !app.Enabled {
		return fmt.Errorf("project '%s' is disabled in SPA configuration", projectName)
	}

	// Create a temporary directory for the zip file
	tempDir, err := os.MkdirTemp("", "godeploy-*")
	if err != nil {
		return fmt.Errorf("failed to create temporary directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Create the zip file path
	zipFilePath := filepath.Join(tempDir, projectName+".zip")

	// Create a spinner for creating the zip archive
	zipSpinner := pin.New(fmt.Sprintf("Creating zip archive for project '%s'...", projectName),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	zipCancel := zipSpinner.Start(ctx)

	// Get the absolute path of the source directory
	sourceDir := app.SourceDir
	if !filepath.IsAbs(sourceDir) {
		// If the source directory is relative, make it absolute
		// relative to the current working directory
		cwd, err := os.Getwd()
		if err != nil {
			zipCancel()
			zipSpinner.Fail("Failed to get current working directory")
			return fmt.Errorf("failed to get current working directory: %w", err)
		}
		sourceDir = filepath.Join(cwd, sourceDir)
	}

	// Check if the source directory exists
	if _, err := os.Stat(sourceDir); os.IsNotExist(err) {
		zipCancel()
		zipSpinner.Fail("Source directory not found")
		return fmt.Errorf("source directory '%s' not found", app.SourceDir)
	}

	// Create the zip archive
	err = archive.CreateZipFromDirectory(sourceDir, zipFilePath)
	if err != nil {
		zipCancel()
		zipSpinner.Fail("Failed to create zip archive")
		return fmt.Errorf("error creating zip archive: %w", err)
	}

	zipCancel()
	zipSpinner.Stop("Zip archive created")

	// Read the zip file
	zipData, err := archive.ReadZipFile(zipFilePath)
	if err != nil {
		return fmt.Errorf("error reading zip file: %w", err)
	}

	// Read the SPA configuration file
	configData, err := os.ReadFile(CLI.Config)
	if err != nil {
		return fmt.Errorf("error reading SPA configuration file: %w", err)
	}

	// Create a spinner for deploying the SPA
	deploySpinner := pin.New(fmt.Sprintf("Deploying project '%s' to GoDeploy...", projectName),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	deployCancel := deploySpinner.Start(ctx)

	// Deploy the SPA
	deployResp, err := apiClient.Deploy(projectName, configData, zipData)
	if err != nil {
		deployCancel()
		deploySpinner.Fail("Failed to deploy project")
		return fmt.Errorf("error deploying project: %w", err)
	}

	deployCancel()
	deploySpinner.Stop("Project deployed successfully")

	// Print the deployment URL
	fmt.Printf("✅ Successfully deployed project '%s'!\n", projectName)
	fmt.Printf("🌍 URL: %s\n", deployResp.URL)

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
	// Create a context
	ctx := context.Background()

	spinner := pin.New("Cleaning deploy directory",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	spinnerCancel := spinner.Start(ctx)
	defer spinnerCancel()
	spinner.Start(ctx)

	if err := nginx.CleanDeployDir(outputDir); err != nil {
		spinner.Fail("Failed to clean deploy directory")
		return fmt.Errorf("failed to clean deploy directory: %w", err)
	}

	// Create a spinner for creating the output directory
	dirSpinner := pin.New(fmt.Sprintf("Creating output directory %s...", outputDir),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	dirCancel := dirSpinner.Start(ctx)

	// Create the output directory
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		dirCancel()
		dirSpinner.Fail("Failed to create directory")
		return fmt.Errorf("failed to create output directory: %w", err)
	}
	dirCancel()
	dirSpinner.Stop("Directory created: " + outputDir)

	// Create a spinner for generating Nginx configurations
	nginxSpinner := pin.New("Generating Nginx configurations...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	nginxCancel := nginxSpinner.Start(ctx)

	// Generate Nginx configurations
	if err := nginx.GenerateNginxConfigs(ctx, spaConfig, outputDir); err != nil {
		nginxCancel()
		nginxSpinner.Fail("Failed to generate Nginx configs")
		return fmt.Errorf("failed to generate Nginx configurations: %w", err)
	}
	nginxCancel()
	nginxSpinner.Stop("Nginx configurations generated")

	// Create a spinner for generating Docker files
	dockerSpinner := pin.New("Generating Dockerfile...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	dockerCancel := dockerSpinner.Start(ctx)

	// Generate Docker files
	if err := docker.GenerateDockerfile(spaConfig, outputDir); err != nil {
		dockerCancel()
		dockerSpinner.Fail("Failed to generate Dockerfile")
		return fmt.Errorf("failed to generate Docker files: %w", err)
	}
	dockerCancel()
	dockerSpinner.Stop("Dockerfile generated")

	return nil
}
