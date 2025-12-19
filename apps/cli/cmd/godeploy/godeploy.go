package main

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/alecthomas/kong"
	"github.com/charmbracelet/lipgloss"
	"github.com/silvabyte/godeploy/internal/api"
	"github.com/silvabyte/godeploy/internal/archive"
	"github.com/silvabyte/godeploy/internal/auth"
	"github.com/silvabyte/godeploy/internal/cache"
	"github.com/silvabyte/godeploy/internal/config"
	"github.com/silvabyte/godeploy/internal/theme"
	"github.com/silvabyte/godeploy/internal/version"
	"github.com/yarlson/pin"
	"golang.org/x/term"
)

// CLI represents the command-line interface structure
var CLI struct {
	// Global flags
	Config      string `help:"Path to the SPA configuration file" default:"godeploy.config.json"`
	VersionFlag bool   `name:"version" short:"v" help:"Display the version of godeploy"`

	// Commands
	Init        InitCmd          `cmd:"init" help:"Initialize a new godeploy.config.json file"`
	Auth        AuthCmd          `cmd:"auth" help:"Authentication commands"`
	Deploy      DeployCmd        `cmd:"deploy" help:"Deploy your SPA to the GoDeploy service (requires authentication)"`
	Version     VersionCmd       `cmd:"version" help:"Display the version of godeploy"`
	Projects    ProjectsCmd      `cmd:"projects" help:"List all deployed projects" aliases:"list"`
	Status      StatusProjectCmd `cmd:"status" help:"Check deployment status for a project"`
	Logs        LogsCmd          `cmd:"logs" help:"View deployment logs"`
	Deployments DeploymentsCmd   `cmd:"deployments" help:"View deployment history for a project"`
	Whoami      WhoamiCmd        `cmd:"whoami" help:"Display current user information"`
	Rollback    RollbackCmd      `cmd:"rollback" help:"Rollback project to a previous deployment"`
	Delete      DeleteCmd        `cmd:"delete" help:"Delete a deployed project"`
	Open        OpenCmd          `cmd:"open" help:"Open project URL in browser"`
	Validate    ValidateCmd      `cmd:"validate" help:"Validate configuration file"`
	Link        LinkCmd          `cmd:"link" help:"Link local directory to remote project"`
	Preview     PreviewCmd       `cmd:"preview" help:"Create a preview deployment"`
	Diff        DiffCmd          `cmd:"diff" help:"Show differences between local and deployed version"`
	Env         EnvCmd           `cmd:"env" help:"Manage environment variables"`
	CLIConfig   CLIConfigCmd     `cmd:"cli-config" help:"Manage CLI configuration"`
	Domains     DomainsCmd       `cmd:"domains" help:"Manage custom domains"`
	Aliases     AliasesCmd       `cmd:"aliases" help:"Manage URL aliases"`
	Metrics     MetricsCmd       `cmd:"metrics" help:"View project metrics"`
	Analytics   AnalyticsCmd     `cmd:"analytics" help:"Open analytics dashboard"`
	Health      HealthCmd        `cmd:"health" help:"Check project health"`
	Teams       TeamsCmd         `cmd:"teams" help:"Manage teams"`
	Tokens      TokensCmd        `cmd:"tokens" help:"Manage API tokens"`
	Promote     PromoteCmd       `cmd:"promote" help:"Promote deployment between projects"`
	Compare     CompareCmd       `cmd:"compare" help:"Compare two deployments"`
	Cache       CacheCmd         `cmd:"cache" help:"Manage CDN cache"`
	Builds      BuildsCmd        `cmd:"builds" help:"Manage build configuration"`
}

// InitCmd represents the init command
type InitCmd struct {
	Force bool `help:"Overwrite existing config file if it exists" short:"f"`
}

// AuthCmd represents the auth command
type AuthCmd struct {
	Login  LoginCmd  `cmd:"" help:"Authenticate with the GoDeploy service" default:"1"`
	SignUp SignUpCmd `cmd:"" help:"Create a new GoDeploy account"`
	Status StatusCmd `cmd:"" help:"Check authentication status"`
	Logout LogoutCmd `cmd:"" help:"Log out from the GoDeploy service"`
}

// LoginCmd represents the auth login command
type LoginCmd struct {
	Email    string `help:"Email address to authenticate with" default:""`
	Password string `help:"Password for authentication" default:""`
}

// SignUpCmd represents the auth sign-up command
type SignUpCmd struct {
	Email    string `help:"Email address for the new account" default:""`
	Password string `help:"Password for the new account" default:""`
}

// LogoutCmd represents the logout command
type LogoutCmd struct{}

// StatusCmd represents the status command
type StatusCmd struct{}

// DeployCmd represents the deploy command
type DeployCmd struct {
	Project       string `help:"Project name for deployment" default:""`
	Output        string `help:"Output directory for spa build files" default:"dist"`
	CommitSHA     string `name:"commit-sha" help:"Commit SHA to associate with this deployment" default:""`
	CommitBranch  string `name:"commit-branch" help:"Commit branch name" default:""`
	CommitMessage string `name:"commit-message" help:"Commit message" default:""`
	CommitURL     string `name:"commit-url" help:"URL to the commit (e.g., GitHub commit link)" default:""`
	NoGit         bool   `name:"no-git" help:"Disable auto-detection of git metadata" default:"false"`
	ClearCache    bool   `name:"clear-cache" help:"Clear CDN cache after deployment" default:"false"`
	DryRun        bool   `name:"dry-run" help:"Preview deployment without actually deploying" default:"false"`
	Wait          bool   `name:"wait" help:"Wait for deployment to complete" default:"false"`
	Timeout       string `name:"timeout" help:"Timeout for wait (e.g., 5m, 10m)" default:"10m"`
	JSON          bool   `name:"json" help:"Output in JSON format for CI/CD" default:"false"`
}

// VersionCmd represents the version command
type VersionCmd struct{}

// Run executes the version command
func (v *VersionCmd) Run() error {
	// Get the version from package.json
	ver, err := version.GetVersion()
	if err != nil {
		return fmt.Errorf("error retrieving version: %w", err)
	}

	// Display the version
	fmt.Printf("godeploy version %s\n", ver)
	return nil
}

// defaultConfig is the default configuration template
const defaultConfig = `{
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
	if err := os.WriteFile(configPath, []byte(defaultConfig), 0o644); err != nil {
		createCancel()
		createSpinner.Fail("Failed to create config file")
		return fmt.Errorf("failed to create config file: %w", err)
	}

	createCancel()
	createSpinner.Stop("Configuration created")
	fmt.Println(theme.SuccessMsg(fmt.Sprintf("Created config file: %s", configPath)))
	fmt.Println(theme.MutedMsg("You can now edit this file to configure your SPAs."))
	return nil
}

// Run executes the login command
func (l *LoginCmd) Run() error {
	// Check if already authenticated with a simple token check using TokenManager
	apiClient := api.NewClient()
	tokenManager := createTokenManager(apiClient)
	if token, err := tokenManager.EnsureValidToken(); err == nil && token != "" {
		fmt.Println("You are already authenticated. To log out, run 'godeploy auth logout'.")
		return nil
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
			// Prompt for email if not provided
			fmt.Print("Email: ")
			reader := bufio.NewReader(os.Stdin)
			emailInput, err := reader.ReadString('\n')
			if err != nil {
				return fmt.Errorf("failed to read email: %w", err)
			}
			email = strings.TrimSpace(emailInput)
			if email == "" {
				return fmt.Errorf("email is required for authentication")
			}
		}
	}

	// Get password from argument or prompt
	password := l.Password
	if password == "" {
		fmt.Print("Password: ")
		passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			return fmt.Errorf("failed to read password: %w", err)
		}
		fmt.Println() // Add newline after password input
		password = string(passwordBytes)
		if password == "" {
			return fmt.Errorf("password is required for authentication")
		}
	}

	// Create a context with a timeout
	ctx := context.Background()

	// Create a spinner for authentication
	authSpinner := pin.New(fmt.Sprintf("Authenticating %s...", email),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	authCancel := authSpinner.Start(ctx)

	// Authenticate with email and password (reuse apiClient from above)
	signInResp, err := apiClient.SignIn(email, password)

	authCancel()

	if err != nil {
		authSpinner.Fail("Authentication failed")

		// Check for specific error messages
		if strings.Contains(err.Error(), "Invalid credentials") || strings.Contains(err.Error(), "Invalid email or password") {
			fmt.Println(theme.ErrorMsg("Invalid email or password. Please check your credentials and try again."))
		} else if strings.Contains(err.Error(), "User not found") {
			fmt.Println(theme.ErrorMsg("User not found. Please check your email address."))
		} else {
			fmt.Println(theme.ErrorMsg(fmt.Sprintf("Authentication failed: %v", err)))
		}
		return err
	}

	authSpinner.Stop("Authentication successful")

	// Create a spinner for saving the token
	saveSpinner := pin.New("Saving authentication token...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	saveCancel := saveSpinner.Start(ctx)

	// Save both tokens
	if err := auth.SetTokens(signInResp.Token, signInResp.RefreshToken); err != nil {
		saveCancel()
		saveSpinner.Fail("Failed to save tokens")
		return fmt.Errorf("failed to save authentication tokens: %w", err)
	}

	// Save email for future authentication
	if err := auth.SetUserEmail(email); err != nil {
		saveCancel()
		saveSpinner.Fail("Failed to save email")
		return fmt.Errorf("failed to save email: %w", err)
	}

	saveCancel()
	saveSpinner.Stop("Token saved")

	fmt.Println(theme.SuccessMsg("Authentication successful! You are now logged in."))
	if signInResp.User.Email != "" {
		fmt.Println(theme.MutedMsg(fmt.Sprintf("Logged in as: %s", signInResp.User.Email)))
	}

	return nil
}

// Run executes the signup command
func (s *SignUpCmd) Run() error {
	// Check if already authenticated with a simple token check using TokenManager
	apiClient := api.NewClient()
	tokenManager := createTokenManager(apiClient)
	if token, err := tokenManager.EnsureValidToken(); err == nil && token != "" {
		fmt.Println("You are already authenticated. To log out, run 'godeploy auth logout'.")
		return nil
	}

	// Get email
	email := s.Email
	if email == "" {
		// Prompt for email if not provided
		fmt.Print("Email: ")
		reader := bufio.NewReader(os.Stdin)
		emailInput, err := reader.ReadString('\n')
		if err != nil {
			return fmt.Errorf("failed to read email: %w", err)
		}
		email = strings.TrimSpace(emailInput)
		if email == "" {
			return fmt.Errorf("email is required for registration")
		}
	}

	// Get password from argument or prompt
	password := s.Password
	if password == "" {
		fmt.Print("Password (min 8 characters): ")
		passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			return fmt.Errorf("failed to read password: %w", err)
		}
		fmt.Println() // Add newline after password input
		password = string(passwordBytes)
		if password == "" {
			return fmt.Errorf("password is required for registration")
		}

		// Confirm password
		fmt.Print("Confirm password: ")
		confirmBytes, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			return fmt.Errorf("failed to read password confirmation: %w", err)
		}
		fmt.Println() // Add newline after password input

		if string(confirmBytes) != password {
			return fmt.Errorf("passwords do not match")
		}
	}

	// Validate password length
	if len(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters long")
	}

	// Create a context
	ctx := context.Background()

	// Create a spinner for registration
	signUpSpinner := pin.New(fmt.Sprintf("Creating account for %s...", email),
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	signUpCancel := signUpSpinner.Start(ctx)

	// Create account with email and password (reuse apiClient from above)
	signUpResp, err := apiClient.SignUp(email, password)

	signUpCancel()

	if err != nil {
		signUpSpinner.Fail("Registration failed")

		// Check for specific error messages
		if strings.Contains(err.Error(), "already exists") || strings.Contains(err.Error(), "User already exists") {
			fmt.Println(theme.ErrorMsg("An account with this email already exists. Use 'godeploy auth login' to sign in."))
		} else if strings.Contains(err.Error(), "Invalid email") {
			fmt.Println(theme.ErrorMsg("Invalid email address. Please provide a valid email."))
		} else if strings.Contains(err.Error(), "Password must be at least") {
			fmt.Println(theme.ErrorMsg("Password does not meet requirements. It must be at least 8 characters long."))
		} else {
			fmt.Println(theme.ErrorMsg(fmt.Sprintf("Registration failed: %v", err)))
		}
		return err
	}

	signUpSpinner.Stop("Account created successfully")

	// Create a spinner for saving the token
	saveSpinner := pin.New("Saving authentication token...",
		pin.WithSpinnerColor(pin.ColorMagenta),
		pin.WithTextColor(pin.ColorMagenta),
	)
	saveCancel := saveSpinner.Start(ctx)

	// Save both tokens
	if err := auth.SetTokens(signUpResp.Token, signUpResp.RefreshToken); err != nil {
		saveCancel()
		saveSpinner.Fail("Failed to save tokens")
		return fmt.Errorf("failed to save authentication tokens: %w", err)
	}

	// Save email for future authentication
	if err := auth.SetUserEmail(email); err != nil {
		saveCancel()
		saveSpinner.Fail("Failed to save email")
		return fmt.Errorf("failed to save email: %w", err)
	}

	saveCancel()
	saveSpinner.Stop("Token saved")

	fmt.Println(theme.SuccessMsg("Account created successfully! You are now logged in."))
	if signUpResp.User.Email != "" {
		fmt.Println(theme.MutedMsg(fmt.Sprintf("Logged in as: %s", signUpResp.User.Email)))
	}

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
		fmt.Println(theme.SuccessMsg(fmt.Sprintf("You have been successfully logged out. Your email (%s) is saved for future logins.", savedEmail)))
	} else {
		fmt.Println(theme.SuccessMsg("You have been successfully logged out."))
	}

	return nil
}

// Run executes the status command
func (s *StatusCmd) Run() error {
	// Get saved email if available
	savedEmail, _ := auth.GetUserEmail()

	// Check authentication using TokenManager (which handles refresh automatically)
	apiClient := api.NewClient()
	tokenManager := createTokenManager(apiClient)
	token, err := tokenManager.EnsureValidToken()

	if err != nil || token == "" {
		// Not authenticated or token refresh failed
		fmt.Println(theme.ErrorMsg("You are not authenticated with GoDeploy."))
		if savedEmail != "" {
			fmt.Println(theme.MutedMsg(fmt.Sprintf("Run 'godeploy auth login' to authenticate with saved email: %s", savedEmail)))
		} else {
			fmt.Println(theme.MutedMsg("Run 'godeploy auth login' to authenticate."))
		}
		return nil
	}

	// Token is valid (automatically refreshed if it was expiring)
	fmt.Println(theme.SuccessMsg("You are authenticated with GoDeploy."))
	if savedEmail != "" {
		fmt.Println(theme.MutedMsg(fmt.Sprintf("Logged in as: %s", savedEmail)))
	}

	return nil
}

// createTokenManager creates a TokenManager with the given API client
func createTokenManager(apiClient *api.Client) *auth.TokenManager {
	return auth.NewTokenManager(func(refreshToken string) (string, string, error) {
		resp, err := apiClient.RefreshToken(refreshToken)
		if err != nil {
			return "", "", err
		}
		return resp.Token, resp.RefreshToken, nil
	})
}

// gitOutput runs a git command and returns its trimmed string output.
func gitOutput(args ...string) string {
	cmd := exec.Command("git", args...)
	out, err := cmd.Output()
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(out))
}

// formatBytes converts bytes to human readable format
func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// formatZipStats creates a nicely formatted output for zip statistics
func formatZipStats(stats *archive.ZipStats) string {
	// Build the content using theme helpers
	ratioStyle := theme.CompressionRatioStyle(stats.CompressionRatio)

	content := lipgloss.JoinVertical(lipgloss.Left,
		theme.KeyValue("Files", fmt.Sprintf("%d", stats.FileCount)),
		theme.KeyValue("Original Size", formatBytes(stats.TotalSize)),
		theme.KeyValue("Compressed", formatBytes(stats.CompressedSize)),
		lipgloss.JoinHorizontal(lipgloss.Left,
			theme.KeyStyle.Render("Ratio:"),
			" ",
			ratioStyle.Render(fmt.Sprintf("%.1f%%", stats.CompressionRatio)),
		),
		theme.KeyValue("Duration", stats.Duration.String()),
	)

	// Use theme title and box styles
	titleStyle := theme.TitleStyle.Margin(1, 0)
	boxStyle := theme.BoxStyle.Margin(1, 0)

	return lipgloss.JoinVertical(lipgloss.Left,
		titleStyle.Render("Archive Details"),
		boxStyle.Render(content),
	)
}

// formatDeploymentSuccess creates a nicely formatted success message
func formatDeploymentSuccess(projectName, url string, zipStats *archive.ZipStats) string {
	// Build the content using theme helpers
	content := lipgloss.JoinVertical(lipgloss.Left,
		theme.KeyValueSuccess("Project", projectName),
		theme.KeyValueSuccess("Files", fmt.Sprintf("%d", zipStats.FileCount)),
		theme.KeyValueSuccess("Size", formatBytes(zipStats.CompressedSize)),
		"",
		theme.KeyValueURL("URL", url),
	)

	// Use theme title and box styles
	titleStyle := theme.TitleSuccessStyle.Margin(1, 0)
	boxStyle := theme.BoxSuccessStyle.Margin(1, 0)

	return lipgloss.JoinVertical(lipgloss.Left,
		titleStyle.Render(" "+theme.SuccessIcon+" Deployment Successful "),
		boxStyle.Render(content),
	)
}

// formatDeploymentError creates a nicely formatted error message
func formatDeploymentError(projectName string, err error, zipStats *archive.ZipStats) string {
	// Build the content using theme helpers
	content := lipgloss.JoinVertical(lipgloss.Left,
		theme.KeyValueError("Project", projectName),
		theme.KeyValueError("Files", fmt.Sprintf("%d", zipStats.FileCount)),
		theme.KeyValueError("Size", formatBytes(zipStats.CompressedSize)),
		"",
		theme.KeyValueError("Error", err.Error()),
	)

	// Use theme title and box styles
	titleStyle := theme.TitleErrorStyle.Margin(1, 0)
	boxStyle := theme.BoxErrorStyle.Margin(1, 0)

	return lipgloss.JoinVertical(lipgloss.Left,
		titleStyle.Render(" "+theme.ErrorIcon+" Deployment Failed "),
		boxStyle.Render(content),
	)
}

// buildCommitURL tries to construct a commit URL based on remote and SHA (supports GitHub remotes).
func buildCommitURL(remoteURL, sha string) string {
	if remoteURL == "" || sha == "" {
		return ""
	}
	// Normalize GitHub remotes
	if strings.Contains(remoteURL, "github.com") {
		u := remoteURL
		// Convert SSH form to HTTPS: git@github.com:owner/repo.git -> https://github.com/owner/repo
		if strings.HasPrefix(u, "git@github.com:") {
			u = strings.TrimPrefix(u, "git@github.com:")
			u = "https://github.com/" + u
		}
		// Remove .git suffix if present
		u = strings.TrimSuffix(u, ".git")
		// If still missing scheme but contains github.com, add https://
		if strings.HasPrefix(u, "github.com/") {
			u = "https://" + u
		}
		return u + "/commit/" + sha
	}
	// Optionally extend for other providers in future
	return ""
}

// Run executes the deploy command
func (d *DeployCmd) Run() error {
	// Create a context
	ctx := context.Background()

	// Quick authentication check - token refresh will happen automatically during deploy
	apiClient := api.NewClient()
	tokenManager := createTokenManager(apiClient)
	if _, err := tokenManager.EnsureValidToken(); err != nil {
		savedEmail, _ := auth.GetUserEmail()
		if savedEmail != "" {
			return fmt.Errorf("you must be authenticated to use this command. Run 'godeploy auth login' to authenticate with saved email: %s", savedEmail)
		}
		return fmt.Errorf("you must be authenticated to use this command. Run 'godeploy auth login' to authenticate")
	}

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

	// Create a cache directory for the deployment using XDG Base Directory
	tempDir, err := cache.GetDeploymentCacheDir(projectName)
	if err != nil {
		return fmt.Errorf("failed to create deployment cache directory: %w", err)
	}
	defer func() {
		_ = cache.RemoveDeploymentCache(tempDir)
	}()

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
	zipStats, err := archive.CreateZipFromDirectory(sourceDir, zipFilePath)
	if err != nil {
		zipCancel()
		zipSpinner.Fail("Failed to create zip archive")
		return fmt.Errorf("error creating zip archive: %w", err)
	}

	zipCancel()
	zipSpinner.Stop("Zip archive created")

	// Display formatted zip statistics
	fmt.Println(formatZipStats(zipStats))

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

	// Prepare commit metadata (from flags or auto-detected via git)
	commitSHA := d.CommitSHA
	commitBranch := d.CommitBranch
	commitMessage := d.CommitMessage
	commitURL := d.CommitURL

	if !d.NoGit {
		if commitSHA == "" {
			commitSHA = gitOutput("rev-parse", "HEAD")
		}
		if commitBranch == "" {
			commitBranch = gitOutput("rev-parse", "--abbrev-ref", "HEAD")
			if commitBranch == "HEAD" { // detached head; leave as-is or empty
				// keep as HEAD to indicate detached, unless user provided override
			}
		}
		if commitMessage == "" {
			// Full subject/body; server will receive URL-encoded value
			commitMessage = gitOutput("log", "-1", "--pretty=%B")
		}
		if commitURL == "" {
			remote := gitOutput("config", "--get", "remote.origin.url")
			commitURL = buildCommitURL(remote, commitSHA)
		}
	}

	// Deploy the SPA
	deployResp, err := apiClient.Deploy(projectName, configData, zipData, commitSHA, commitBranch, commitMessage, commitURL, d.ClearCache)
	if err != nil {
		deployCancel()
		deploySpinner.Fail("Failed to deploy project")

		// Display formatted error message
		fmt.Println(formatDeploymentError(projectName, err, zipStats))

		// If this was a timeout while awaiting headers, deployment may still have succeeded server-side.
		if strings.Contains(err.Error(), "Client.Timeout exceeded") || strings.Contains(err.Error(), "context deadline exceeded") {
			return fmt.Errorf("request timed out waiting for server response; your deployment may still complete. Consider increasing timeout via GODEPLOY_DEPLOY_TIMEOUT (e.g. '5m')")
		}
		return fmt.Errorf("deployment failed")
	}

	deployCancel()
	deploySpinner.Stop("Project deployed successfully")

	// Display formatted success message
	fmt.Println(formatDeploymentSuccess(projectName, deployResp.URL, zipStats))

	return nil
}

// ProjectsCmd lists all deployed projects
type ProjectsCmd struct {
	Filter string `help:"Filter projects (enabled/disabled/all)" default:"all"`
	JSON   bool   `help:"Output in JSON format" default:"false"`
}

func (p *ProjectsCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc("projects", "This will list all your deployed projects with their URLs and status"))
	return nil
}

// StatusProjectCmd checks deployment status for a project
type StatusProjectCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (s *StatusProjectCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("status %s", s.Project),
		"This will show deployment state, last deployment info, and current URL",
	))
	return nil
}

// LogsCmd views deployment logs
type LogsCmd struct {
	Project      string `arg:"" help:"Project name" required:"true"`
	Follow       bool   `help:"Follow log output" short:"f" default:"false"`
	Lines        int    `help:"Number of lines to show" short:"n" default:"100"`
	DeploymentID string `help:"Specific deployment ID" default:""`
}

func (l *LogsCmd) Run() error {
	desc := "This will display deployment logs for the project"
	if l.Follow {
		desc = "This will stream logs in real-time"
	}
	fmt.Println(theme.NotImplementedWithDesc(fmt.Sprintf("logs %s", l.Project), desc))
	return nil
}

// DeploymentsCmd views deployment history
type DeploymentsCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Limit   int    `help:"Number of deployments to show" default:"10"`
	JSON    bool   `help:"Output in JSON format" default:"false"`
}

func (d *DeploymentsCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("deployments %s", d.Project),
		"This will show past deployments with timestamps, commit info, and status",
	))
	return nil
}

// WhoamiCmd displays current user information
type WhoamiCmd struct {
	JSON bool `help:"Output in JSON format" default:"false"`
}

func (w *WhoamiCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc("whoami", "This will show your email, tenant ID, and subscription status"))
	return nil
}

// RollbackCmd rolls back to a previous deployment
type RollbackCmd struct {
	Project      string `arg:"" help:"Project name" required:"true"`
	DeploymentID string `help:"Deployment ID to rollback to (defaults to last successful)" default:""`
	Force        bool   `help:"Skip confirmation prompt" short:"f" default:"false"`
}

func (r *RollbackCmd) Run() error {
	desc := "This will rollback to the last successful deployment"
	if r.DeploymentID != "" {
		desc = fmt.Sprintf("This will rollback to deployment: %s", r.DeploymentID)
	}
	fmt.Println(theme.NotImplementedWithDesc(fmt.Sprintf("rollback %s", r.Project), desc))
	return nil
}

// DeleteCmd deletes a deployed project
type DeleteCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Force   bool   `help:"Skip confirmation prompt" short:"f" default:"false"`
}

func (d *DeleteCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("delete %s", d.Project),
		"This will remove the project from the platform with confirmation",
	))
	return nil
}

// OpenCmd opens project URL in browser
type OpenCmd struct {
	Project   string `arg:"" help:"Project name" required:"true"`
	Dashboard bool   `help:"Open dashboard page instead of project URL" default:"false"`
}

func (o *OpenCmd) Run() error {
	desc := "This will open the project URL in your browser"
	if o.Dashboard {
		desc = "This will open the dashboard page in your browser"
	}
	fmt.Println(theme.NotImplementedWithDesc(fmt.Sprintf("open %s", o.Project), desc))
	return nil
}

// ValidateCmd validates configuration file
type ValidateCmd struct {
	Verbose bool `help:"Show detailed validation output" default:"false"`
}

func (v *ValidateCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		"validate",
		"This will check config syntax, verify source directories, and validate file sizes",
	))
	return nil
}

// LinkCmd links local directory to remote project
type LinkCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (l *LinkCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("link %s", l.Project),
		"This will associate this directory with the remote project",
	))
	return nil
}

// PreviewCmd creates a preview deployment
type PreviewCmd struct {
	Name string `help:"Preview name" default:""`
	TTL  string `help:"Time to live (e.g., 7d)" default:"7d"`
}

func (p *PreviewCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc("preview", "This will create a temporary deployment with auto-cleanup"))
	return nil
}

// DiffCmd shows differences between local and deployed
type DiffCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (d *DiffCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("diff %s", d.Project),
		"This will compare local build with deployed version",
	))
	return nil
}

// EnvCmd manages environment variables
type EnvCmd struct {
	List  EnvListCmd  `cmd:"list" help:"List environment variables"`
	Set   EnvSetCmd   `cmd:"set" help:"Set an environment variable"`
	Unset EnvUnsetCmd `cmd:"unset" help:"Remove an environment variable"`
	Pull  EnvPullCmd  `cmd:"pull" help:"Download environment variables to .env file"`
}

type EnvListCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (e *EnvListCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("env list %s", e.Project)))
	return nil
}

type EnvSetCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Key     string `arg:"" help:"Variable name" required:"true"`
	Value   string `arg:"" help:"Variable value" required:"true"`
}

func (e *EnvSetCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("env set %s=%s for %s", e.Key, e.Value, e.Project)))
	return nil
}

type EnvUnsetCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Key     string `arg:"" help:"Variable name" required:"true"`
}

func (e *EnvUnsetCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("env unset %s for %s", e.Key, e.Project)))
	return nil
}

type EnvPullCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Output  string `help:"Output file" default:".env"`
}

func (e *EnvPullCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("env pull %s --output %s", e.Project, e.Output)))
	return nil
}

// CLIConfigCmd manages CLI configuration
type CLIConfigCmd struct {
	Get    CLIConfigGetCmd    `cmd:"get" help:"Get a configuration value"`
	Set    CLIConfigSetCmd    `cmd:"set" help:"Set a configuration value"`
	List   CLIConfigListCmd   `cmd:"list" help:"List all configuration values"`
	APIUrl CLIConfigAPIUrlCmd `cmd:"api-url" help:"Set API URL"`
}

type CLIConfigGetCmd struct {
	Key string `arg:"" help:"Configuration key" required:"true"`
}

func (c *CLIConfigGetCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("cli-config get %s", c.Key)))
	return nil
}

type CLIConfigSetCmd struct {
	Key   string `arg:"" help:"Configuration key" required:"true"`
	Value string `arg:"" help:"Configuration value" required:"true"`
}

func (c *CLIConfigSetCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("cli-config set %s=%s", c.Key, c.Value)))
	return nil
}

type CLIConfigListCmd struct{}

func (c *CLIConfigListCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg("cli-config list"))
	return nil
}

type CLIConfigAPIUrlCmd struct {
	URL string `arg:"" help:"API URL" required:"true"`
}

func (c *CLIConfigAPIUrlCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("cli-config api-url %s", c.URL)))
	return nil
}

// DomainsCmd manages custom domains
type DomainsCmd struct {
	List   DomainsListCmd   `cmd:"list" help:"List domains for a project"`
	Add    DomainsAddCmd    `cmd:"add" help:"Add a custom domain"`
	Remove DomainsRemoveCmd `cmd:"remove" help:"Remove a custom domain"`
	Verify DomainsVerifyCmd `cmd:"verify" help:"Verify DNS configuration"`
}

type DomainsListCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (d *DomainsListCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("domains list %s", d.Project)))
	return nil
}

type DomainsAddCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Domain  string `arg:"" help:"Domain name" required:"true"`
}

func (d *DomainsAddCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("domains add %s %s", d.Project, d.Domain)))
	return nil
}

type DomainsRemoveCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Domain  string `arg:"" help:"Domain name" required:"true"`
}

func (d *DomainsRemoveCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("domains remove %s %s", d.Project, d.Domain)))
	return nil
}

type DomainsVerifyCmd struct {
	Domain string `arg:"" help:"Domain name" required:"true"`
}

func (d *DomainsVerifyCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("domains verify %s", d.Domain)))
	return nil
}

// AliasesCmd manages URL aliases
type AliasesCmd struct {
	List   AliasesListCmd   `cmd:"list" help:"List aliases for a project"`
	Create AliasesCreateCmd `cmd:"create" help:"Create an alias"`
	Remove AliasesRemoveCmd `cmd:"remove" help:"Remove an alias"`
}

type AliasesListCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (a *AliasesListCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("aliases list %s", a.Project)))
	return nil
}

type AliasesCreateCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Alias   string `arg:"" help:"Alias name" required:"true"`
}

func (a *AliasesCreateCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("aliases create %s %s", a.Project, a.Alias)))
	return nil
}

type AliasesRemoveCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Alias   string `arg:"" help:"Alias name" required:"true"`
}

func (a *AliasesRemoveCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("aliases remove %s %s", a.Project, a.Alias)))
	return nil
}

// MetricsCmd views project metrics
type MetricsCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Period  string `help:"Time period (e.g., 7d, 30d)" default:"7d"`
	JSON    bool   `help:"Output in JSON format" default:"false"`
}

func (m *MetricsCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("metrics %s --period %s", m.Project, m.Period)))
	return nil
}

// AnalyticsCmd opens analytics dashboard
type AnalyticsCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (a *AnalyticsCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("analytics %s", a.Project),
		"This will open the analytics dashboard in your browser",
	))
	return nil
}

// HealthCmd checks project health
type HealthCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Verbose bool   `help:"Show detailed health information" default:"false"`
}

func (h *HealthCmd) Run() error {
	fmt.Println(theme.NotImplementedWithDesc(
		fmt.Sprintf("health %s", h.Project),
		"This will ping deployment, check CDN, and verify SSL certificate",
	))
	return nil
}

// TeamsCmd manages teams
type TeamsCmd struct {
	List   TeamsListCmd   `cmd:"list" help:"List teams"`
	Switch TeamsSwitchCmd `cmd:"switch" help:"Switch team context"`
	Create TeamsCreateCmd `cmd:"create" help:"Create a new team"`
	Invite TeamsInviteCmd `cmd:"invite" help:"Invite a team member"`
}

type TeamsListCmd struct{}

func (t *TeamsListCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg("teams list"))
	return nil
}

type TeamsSwitchCmd struct {
	Team string `arg:"" help:"Team name" required:"true"`
}

func (t *TeamsSwitchCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("teams switch %s", t.Team)))
	return nil
}

type TeamsCreateCmd struct {
	Name string `arg:"" help:"Team name" required:"true"`
}

func (t *TeamsCreateCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("teams create %s", t.Name)))
	return nil
}

type TeamsInviteCmd struct {
	Email string `arg:"" help:"Email address" required:"true"`
}

func (t *TeamsInviteCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("teams invite %s", t.Email)))
	return nil
}

// TokensCmd manages API tokens
type TokensCmd struct {
	List   TokensListCmd   `cmd:"list" help:"List API tokens"`
	Create TokensCreateCmd `cmd:"create" help:"Create a new API token"`
	Revoke TokensRevokeCmd `cmd:"revoke" help:"Revoke an API token"`
}

type TokensListCmd struct{}

func (t *TokensListCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg("tokens list"))
	return nil
}

type TokensCreateCmd struct {
	Name    string `help:"Token name" default:""`
	Expires string `help:"Expiration duration (e.g., 90d)" default:"90d"`
}

func (t *TokensCreateCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("tokens create --expires %s", t.Expires)))
	return nil
}

type TokensRevokeCmd struct {
	ID string `arg:"" help:"Token ID" required:"true"`
}

func (t *TokensRevokeCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("tokens revoke %s", t.ID)))
	return nil
}

// PromoteCmd promotes deployment between projects
type PromoteCmd struct {
	Source string `arg:"" help:"Source project name" required:"true"`
	Target string `arg:"" help:"Target project name" required:"true"`
	Force  bool   `help:"Skip confirmation prompt" short:"f" default:"false"`
}

func (p *PromoteCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("promote %s %s", p.Source, p.Target)))
	return nil
}

// CompareCmd compares two deployments
type CompareCmd struct {
	DeploymentA string `arg:"" help:"First deployment ID" required:"true"`
	DeploymentB string `arg:"" help:"Second deployment ID" required:"true"`
}

func (c *CompareCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("compare %s %s", c.DeploymentA, c.DeploymentB)))
	return nil
}

// CacheCmd manages CDN cache
type CacheCmd struct {
	Clear CacheClearCmd `cmd:"clear" help:"Clear CDN cache for a project"`
	Purge CachePurgeCmd `cmd:"purge" help:"Purge specific path from cache"`
	Stats CacheStatsCmd `cmd:"stats" help:"View cache statistics"`
}

type CacheClearCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (c *CacheClearCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("cache clear %s", c.Project)))
	return nil
}

type CachePurgeCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
	Path    string `arg:"" help:"Path to purge" required:"true"`
}

func (c *CachePurgeCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("cache purge %s %s", c.Project, c.Path)))
	return nil
}

type CacheStatsCmd struct {
	Project string `arg:"" help:"Project name" required:"true"`
}

func (c *CacheStatsCmd) Run() error {
	fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("cache stats %s", c.Project)))
	return nil
}

// BuildsCmd manages build configuration
type BuildsCmd struct {
	Run    BuildsRunCmd    `cmd:"run" help:"Run build before deploy"`
	Config BuildsConfigCmd `cmd:"config" help:"Configure build settings"`
}

type BuildsRunCmd struct {
	BuildCmd string `help:"Build command to run" default:""`
}

func (b *BuildsRunCmd) Run() error {
	if b.BuildCmd != "" {
		fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("builds run --build-cmd %s", b.BuildCmd)))
	} else {
		fmt.Println(theme.NotImplementedWithDesc("builds run", "This will auto-detect and run your build command"))
	}
	return nil
}

type BuildsConfigCmd struct {
	Command string `help:"Set build command" default:""`
}

func (b *BuildsConfigCmd) Run() error {
	if b.Command != "" {
		fmt.Println(theme.NotImplementedMsg(fmt.Sprintf("builds config --command %s", b.Command)))
	} else {
		fmt.Println(theme.NotImplementedMsg("builds config"))
	}
	return nil
}

// RunCLI parses and executes the CLI commands
func RunCLI() error {
	// Check for version flag early
	for _, arg := range os.Args[1:] {
		if arg == "--version" || arg == "-v" {
			ver, err := version.GetVersion()
			if err != nil {
				return fmt.Errorf("error retrieving version: %w", err)
			}
			fmt.Printf("godeploy version %s\n", ver)
			return nil
		}
	}

	// Check for help as first argument (help command)
	if len(os.Args) > 1 && os.Args[1] == "help" {
		// Remove "help" from args so Kong doesn't process it as a command
		// and instead shows the general usage
		if len(os.Args) == 2 {
			os.Args = []string{os.Args[0], "--help"}
		} else {
			// If there are more args after help, show help for that command
			// e.g., "godeploy help auth" -> "godeploy auth --help"
			newArgs := []string{os.Args[0]}
			newArgs = append(newArgs, os.Args[2:]...)
			newArgs = append(newArgs, "--help")
			os.Args = newArgs
		}
	}

	ctx := kong.Parse(&CLI,
		kong.Name("godeploy"),
		kong.Description("A CLI tool for deploying SPAs to the GoDeploy cloud service"),
		kong.UsageOnError(),
		kong.ConfigureHelp(kong.HelpOptions{
			Compact: true,
			Summary: true,
		}),
		kong.Vars{
			"version": func() string {
				ver, _ := version.GetVersion()
				return ver
			}(),
		},
	)

	return ctx.Run()
}
