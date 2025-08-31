package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"

	"github.com/silvabyte/godeploy/internal/auth"
)

const (
	// DefaultAPIBaseURL is the default base URL for the API
	DefaultAPIBaseURL = "https://api.godeploy.app"

	// DefaultTimeout is the default timeout for API requests
	DefaultTimeout = 30 * time.Second
)

// Client represents an API client
type Client struct {
	BaseURL    string
	HTTPClient *http.Client
}

// NewClient creates a new API client
func NewClient() *Client {
	return &Client{
		BaseURL: DefaultAPIBaseURL,
		HTTPClient: &http.Client{
			Timeout: DefaultTimeout,
		},
	}
}

// AuthInitRequest represents a request to initialize the authentication flow
type AuthInitRequest struct {
	Email       string `json:"email"`
	RedirectURI string `json:"redirect_uri"`
}

// AuthInitResponse represents a response from the authentication initialization
type AuthInitResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// SignInRequest represents a request to sign in with email and password
type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignInResponse represents a response from the signin endpoint
type SignInResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
	User    struct {
		ID       string `json:"id"`
		Email    string `json:"email"`
		TenantID string `json:"tenant_id"`
	} `json:"user"`
	Error string `json:"error,omitempty"`
}

// SignUpRequest represents a request to sign up with email and password
type SignUpRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignUpResponse represents a response from the signup endpoint
type SignUpResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
	User    struct {
		ID       string `json:"id"`
		Email    string `json:"email"`
		TenantID string `json:"tenant_id"`
	} `json:"user"`
	Error string `json:"error,omitempty"`
}

// VerifyResponse represents a response from the token verification endpoint
type VerifyResponse struct {
	Valid bool `json:"valid"`
	User  struct {
		ID       string `json:"id"`
		Email    string `json:"email"`
		TenantID string `json:"tenant_id"`
	} `json:"user,omitempty"`
	Error string `json:"error,omitempty"`
}

// ErrorResponse represents an error response from the API
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Status  int    `json:"status"`
}

// DeployRequest represents a request to deploy a SPA
type DeployRequest struct {
	Project   string `json:"project"`
	SpaConfig []byte `json:"spa_config"`
	Archive   []byte `json:"archive"`
}

// DeployResponse represents a response from the deploy endpoint
type DeployResponse struct {
	Success bool   `json:"success"`
	URL     string `json:"url"`
	Error   string `json:"error,omitempty"`
}

// InitAuth initializes the authentication flow
func (c *Client) InitAuth(email, redirectURI string) (*AuthInitResponse, error) {
	// Create the request body
	reqBody := AuthInitRequest{
		Email:       email,
		RedirectURI: redirectURI,
	}

	// Marshal the request body
	reqData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	// Create the request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/auth/init", c.BaseURL), bytes.NewBuffer(reqData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set the headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check the status code
	if resp.StatusCode != http.StatusOK {
		// Try to parse the error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil && errResp.Error != "" {
			return nil, fmt.Errorf("API error: %s", errResp.Error)
		}
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// Decode the response
	var authResp AuthInitResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Check for errors
	if !authResp.Success {
		return nil, fmt.Errorf("authentication initialization failed: %s", authResp.Error)
	}

	return &authResp, nil
}

// VerifyToken verifies the authentication token with the API
func (c *Client) VerifyToken(token string) (*VerifyResponse, error) {
	// Create the request
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/auth/verify", c.BaseURL), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Add the auth token to the request
	c.AuthenticatedRequest(req, token)

	// Send the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Decode the response
	var verifyResp VerifyResponse
	if err := json.Unmarshal(body, &verifyResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// If the status code is 401, the token is invalid
	if resp.StatusCode == http.StatusUnauthorized {
		return &verifyResp, nil
	}

	// Check the status code for other errors
	if resp.StatusCode != http.StatusOK {
		// Try to parse the error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil && errResp.Error != "" {
			return nil, fmt.Errorf("API error: %s", errResp.Error)
		}
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	return &verifyResp, nil
}

// AuthenticatedRequest adds authentication headers to a request
func (c *Client) AuthenticatedRequest(req *http.Request, token string) {
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
}

// DoAuthenticatedRequest performs an authenticated request
func (c *Client) DoAuthenticatedRequest(req *http.Request) (*http.Response, error) {
	// Get the auth token
	token, err := c.GetAuthToken()
	if err != nil {
		return nil, fmt.Errorf("failed to get auth token: %w", err)
	}

	// Add the auth token to the request
	c.AuthenticatedRequest(req, token)

	// Send the request
	return c.HTTPClient.Do(req)
}

// GetAuthToken gets the auth token from the auth package
func (c *Client) GetAuthToken() (string, error) {
	return auth.GetAuthToken()
}

// SignIn authenticates a user with email and password
func (c *Client) SignIn(email, password string) (*SignInResponse, error) {
	// Create the request body
	reqBody := SignInRequest{
		Email:    email,
		Password: password,
	}

	// Marshal the request body
	reqData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	// Create the request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/auth/signin", c.BaseURL), bytes.NewBuffer(reqData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set the headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check the status code (401 for invalid credentials)
	if resp.StatusCode == http.StatusUnauthorized {
		// Try to parse the error response
		var errResp struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
		}
		if err := json.Unmarshal(body, &errResp); err == nil && errResp.Error != "" {
			return nil, fmt.Errorf("%s", errResp.Error)
		}
		return nil, fmt.Errorf("invalid email or password")
	}

	if resp.StatusCode != http.StatusOK {
		// Try to parse the error response
		var errResp ErrorResponse
		if err := json.Unmarshal(body, &errResp); err == nil && errResp.Error != "" {
			return nil, fmt.Errorf("%s", errResp.Error)
		}
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// Decode the response
	var signInResp SignInResponse
	if err := json.Unmarshal(body, &signInResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Check for errors
	if !signInResp.Success {
		return nil, fmt.Errorf("authentication failed: %s", signInResp.Error)
	}

	return &signInResp, nil
}

// SignUp creates a new account with email and password
func (c *Client) SignUp(email, password string) (*SignUpResponse, error) {
	// Create the request body
	reqBody := SignUpRequest{
		Email:    email,
		Password: password,
	}

	// Marshal the request body
	reqData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request body: %w", err)
	}

	// Create the request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/auth/signup", c.BaseURL), bytes.NewBuffer(reqData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set the headers
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check the status code (201 for created)
	if resp.StatusCode != http.StatusCreated {
		// Try to parse the error response
		var errResp struct {
			Success bool   `json:"success"`
			Error   string `json:"error"`
		}
		if err := json.Unmarshal(body, &errResp); err == nil && errResp.Error != "" {
			return nil, fmt.Errorf("%s", errResp.Error)
		}
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(body))
	}

	// Decode the response
	var signUpResp SignUpResponse
	if err := json.Unmarshal(body, &signUpResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Check for errors
	if !signUpResp.Success {
		return nil, fmt.Errorf("sign up failed: %s", signUpResp.Error)
	}

	return &signUpResp, nil
}

// Deploy deploys a SPA to the GoDeploy service
func (c *Client) Deploy(project string, spaConfigData []byte, archiveData []byte) (*DeployResponse, error) {
	// Create a new multipart writer
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Add the project field
	if err := writer.WriteField("project", project); err != nil {
		return nil, fmt.Errorf("failed to write project field: %w", err)
	}

	// Add the spa_config file
	spaConfigPart, err := writer.CreateFormFile("spa_config", "godeploy.config.json")
	if err != nil {
		return nil, fmt.Errorf("failed to create spa_config form file: %w", err)
	}
	if _, err := spaConfigPart.Write(spaConfigData); err != nil {
		return nil, fmt.Errorf("failed to write spa_config data: %w", err)
	}

	// Add the archive file
	archivePart, err := writer.CreateFormFile("archive", project+".zip")
	if err != nil {
		return nil, fmt.Errorf("failed to create archive form file: %w", err)
	}
	if _, err := archivePart.Write(archiveData); err != nil {
		return nil, fmt.Errorf("failed to write archive data: %w", err)
	}

	// Close the writer
	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Create the request
	req, err := http.NewRequest("POST", fmt.Sprintf("%s/api/deploy?project=%s", c.BaseURL, project), body)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set the content type
	req.Header.Set("Content-Type", writer.FormDataContentType())

	// Send the authenticated request
	resp, err := c.DoAuthenticatedRequest(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read the response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check the status code
	if resp.StatusCode != http.StatusOK {
		// Try to parse the error response
		var errResp ErrorResponse
		if err := json.Unmarshal(respBody, &errResp); err == nil && errResp.Error != "" {
			return nil, fmt.Errorf("API error: %s", errResp.Error)
		}
		return nil, fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, string(respBody))
	}

	// Decode the response
	var deployResp DeployResponse
	if err := json.Unmarshal(respBody, &deployResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w, body: %s", err, string(respBody))
	}

	return &deployResp, nil
}
