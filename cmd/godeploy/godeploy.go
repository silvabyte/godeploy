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
	"github.com/silvabyte/godeploy/internal/api"
	"github.com/silvabyte/godeploy/internal/archive"
	"github.com/silvabyte/godeploy/internal/auth"
	"github.com/silvabyte/godeploy/internal/config"
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
	Init    InitCmd    `cmd:"init" help:"Initialize a new godeploy.config.json file"`
	Auth    AuthCmd    `cmd:"auth" help:"Authentication commands"`
	Deploy  DeployCmd  `cmd:"deploy" help:"Deploy your SPA to the GoDeploy service (requires authentication)"`
	Version VersionCmd `cmd:"version" help:"Display the version of godeploy"`
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
    Project string `help:"Project name for deployment" default:""`
    Output  string `help:"Output directory for spa build files" default:"dist"`
    CommitSHA     string `name:"commit-sha" help:"Commit SHA to associate with this deployment" default:""`
    CommitBranch  string `name:"commit-branch" help:"Commit branch name" default:""`
    CommitMessage string `name:"commit-message" help:"Commit message" default:""`
    CommitURL     string `name:"commit-url" help:"URL to the commit (e.g., GitHub commit link)" default:""`
    NoGit         bool   `name:"no-git" help:"Disable auto-detection of git metadata" default:"false"`
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

	// Authenticate with email and password
	apiClient := api.NewClient()
	signInResp, err := apiClient.SignIn(email, password)

	authCancel()

	if err != nil {
		authSpinner.Fail("Authentication failed")

		// Check for specific error messages
		if strings.Contains(err.Error(), "Invalid credentials") || strings.Contains(err.Error(), "Invalid email or password") {
			fmt.Println("❌ Invalid email or password. Please check your credentials and try again.")
		} else if strings.Contains(err.Error(), "User not found") {
			fmt.Println("❌ User not found. Please check your email address.")
		} else {
			fmt.Printf("❌ Authentication failed: %v\n", err)
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

	// Save the token
	if err := auth.SetAuthToken(signInResp.Token); err != nil {
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
	if signInResp.User.Email != "" {
		fmt.Printf("Logged in as: %s\n", signInResp.User.Email)
	}

	return nil
}

// Run executes the signup command
func (s *SignUpCmd) Run() error {
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

		// If we get here, the token is invalid, so we should clear it and continue with signup
		if err := auth.ClearAuthToken(); err != nil {
			return fmt.Errorf("failed to clear invalid authentication token: %w", err)
		}
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

	// Create account with email and password
	apiClient := api.NewClient()
	signUpResp, err := apiClient.SignUp(email, password)

	signUpCancel()

	if err != nil {
		signUpSpinner.Fail("Registration failed")

		// Check for specific error messages
		if strings.Contains(err.Error(), "already exists") || strings.Contains(err.Error(), "User already exists") {
			fmt.Println("❌ An account with this email already exists. Use 'godeploy auth login' to sign in.")
		} else if strings.Contains(err.Error(), "Invalid email") {
			fmt.Println("❌ Invalid email address. Please provide a valid email.")
		} else if strings.Contains(err.Error(), "Password must be at least") {
			fmt.Println("❌ Password does not meet requirements. It must be at least 8 characters long.")
		} else {
			fmt.Printf("❌ Registration failed: %v\n", err)
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

	// Save the token
	if err := auth.SetAuthToken(signUpResp.Token); err != nil {
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

	fmt.Println("✅ Account created successfully! You are now logged in.")
	if signUpResp.User.Email != "" {
		fmt.Printf("Logged in as: %s\n", signUpResp.User.Email)
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
			fmt.Println("Run 'godeploy auth login' to authenticate.")
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
			fmt.Println("Run 'godeploy auth login' to authenticate.")
		}

		// Clear the invalid token
		if err := auth.ClearAuthToken(); err != nil {
			fmt.Println("⚠️ Warning: Failed to clear invalid token:", err)
		}
	}

	return nil
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

		// Inform user they need to authenticate
		savedEmail, _ := auth.GetUserEmail()
		if savedEmail != "" {
			return fmt.Errorf("you must be authenticated to use this command. Run 'godeploy auth login' to authenticate with saved email: %s", savedEmail)
		} else {
			return fmt.Errorf("you must be authenticated to use this command. Run 'godeploy auth login' to authenticate")
		}
	}

	// We have a token, now verify it with the API
	apiClient := api.NewClient()
	verifyResp, err := apiClient.VerifyToken(token)
	// Handle API connection errors
	if err != nil {
		authCancel()
		authSpinner.Fail("Failed to verify token")

		// Clear invalid token and inform user to re-authenticate
		if clearErr := auth.ClearAuthToken(); clearErr != nil {
			fmt.Printf("Warning: Failed to clear invalid token: %v\n", clearErr)
		}

		savedEmail, _ := auth.GetUserEmail()
		if savedEmail != "" {
			return fmt.Errorf("authentication token verification failed. Run 'godeploy auth login' to re-authenticate with saved email: %s", savedEmail)
		} else {
			return fmt.Errorf("authentication token verification failed. Run 'godeploy auth login' to re-authenticate")
		}
	}

	// Check if the token is valid
	if !verifyResp.Valid {
		authCancel()
		authSpinner.Fail("Invalid authentication")

		// Clear invalid token and inform user to re-authenticate
		if clearErr := auth.ClearAuthToken(); clearErr != nil {
			fmt.Printf("Warning: Failed to clear invalid token: %v\n", clearErr)
		}

		savedEmail, _ := auth.GetUserEmail()
		if savedEmail != "" {
			return fmt.Errorf("your authentication token is invalid or expired. Run 'godeploy auth login' to re-authenticate with saved email: %s", savedEmail)
		} else {
			return fmt.Errorf("your authentication token is invalid or expired. Run 'godeploy auth login' to re-authenticate")
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
	defer func() {
		_ = os.RemoveAll(tempDir)
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
    deployResp, err := apiClient.Deploy(projectName, configData, zipData, commitSHA, commitBranch, commitMessage, commitURL)
    if err != nil {
        deployCancel()
        deploySpinner.Fail("Failed to deploy project")
        // If this was a timeout while awaiting headers, deployment may still have succeeded server-side.
        if strings.Contains(err.Error(), "Client.Timeout exceeded") || strings.Contains(err.Error(), "context deadline exceeded") {
            return fmt.Errorf("request timed out waiting for server response; your deployment may still complete. Consider increasing timeout via GODEPLOY_DEPLOY_TIMEOUT (e.g. '5m'). Underlying error: %w", err)
        }
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
