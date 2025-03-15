package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/audetic/godeploy/pkg/auth"
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

// ErrorResponse represents an error response from the API
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
	Status  int    `json:"status"`
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
