package auth

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/audetic/godeploy/internal/auth/templates"
)

const (
	// DefaultPort is the default port for the local auth server
	DefaultPort = 38389

	// DefaultTimeout is the default timeout for the local auth server
	DefaultTimeout = 10 * time.Minute
)

// AuthResult represents the result of the authentication process
type AuthResult struct {
	Token        string
	Error        error
	ErrorDetails map[string]string
}

// StartLocalServer starts a local HTTP server to handle the authentication callback
func StartLocalServer(ctx context.Context) (string, error) {
	// Create a channel to receive the authentication result
	resultCh := make(chan AuthResult, 1)

	// Create a new server
	server := &http.Server{
		Addr: fmt.Sprintf("localhost:%d", DefaultPort),
	}

	// Create a listener
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", DefaultPort))
	if err != nil {
		return "", fmt.Errorf("failed to start local server: %w", err)
	}

	// Set up the handler for the main callback endpoint
	http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		// Check if this is a direct callback with a hash fragment
		// If so, we need to serve the HTML that will extract the token from the hash
		if !strings.Contains(r.URL.RawQuery, "access_token") &&
			!strings.Contains(r.URL.RawQuery, "error") {
			// This is likely a callback with a hash fragment
			// Serve a special HTML page that will extract the token from the hash and redirect
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(templates.HashParamCallbackHTML))
			return
		}

		// Get the access token from the query parameters
		token := r.URL.Query().Get("access_token")

		// Check for error parameters
		errorParam := r.URL.Query().Get("error")
		errorCode := r.URL.Query().Get("error_code")
		errorDescription := r.URL.Query().Get("error_description")

		if errorParam != "" {
			// Handle error case
			errorDetails := map[string]string{
				"error":             errorParam,
				"error_code":        errorCode,
				"error_description": errorDescription,
			}

			// Format the error message
			errorMessage := "Authentication failed."
			if errorDescription != "" {
				errorMessage = errorDescription
			}

			// Return the error HTML
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf(templates.ErrorHTML, errorMessage, errorParam, errorCode)))

			// Send the error to the channel
			resultCh <- AuthResult{
				Error:        fmt.Errorf("authentication failed: %s", errorParam),
				ErrorDetails: errorDetails,
			}

			// Shutdown the server after a short delay
			go func() {
				time.Sleep(1 * time.Second)
				server.Shutdown(context.Background())
			}()

			return
		}

		if token == "" {
			// No token found
			w.Header().Set("Content-Type", "text/plain")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Access token not found in the callback URL"))
			resultCh <- AuthResult{Error: fmt.Errorf("access token not found in the callback URL")}
			return
		}

		// Return the success HTML
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(templates.SuccessHTML))

		// Send the token to the channel
		resultCh <- AuthResult{Token: token}

		// Shutdown the server after a short delay to allow the response to be sent
		go func() {
			time.Sleep(1 * time.Second)
			server.Shutdown(context.Background())
		}()
	})

	// Set up a handler for the root path to handle hash parameters
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If this is the root path, serve the hash parameter handler HTML
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(templates.HashParamCallbackHTML))
			return
		}

		// For any other path, return 404
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 page not found"))
	})

	// Start the server in a goroutine
	go func() {
		if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
			resultCh <- AuthResult{Error: fmt.Errorf("server error: %w", err)}
		}
	}()

	// Set up a timeout
	var timeoutCh <-chan time.Time
	if deadline, ok := ctx.Deadline(); ok {
		timeoutCh = time.After(time.Until(deadline))
	} else {
		timeoutCh = time.After(DefaultTimeout)
	}

	// Wait for the result or timeout
	select {
	case result := <-resultCh:
		if result.Error != nil {
			// If we have error details, format a more descriptive error message
			if result.ErrorDetails != nil && result.ErrorDetails["error_description"] != "" {
				return "", fmt.Errorf("%s: %s", result.Error, result.ErrorDetails["error_description"])
			}
			return "", result.Error
		}
		return result.Token, nil
	case <-timeoutCh:
		server.Shutdown(context.Background())
		return "", fmt.Errorf("authentication timed out after %v", DefaultTimeout)
	case <-ctx.Done():
		server.Shutdown(context.Background())
		return "", ctx.Err()
	}
}

// GetRedirectURI returns the redirect URI for the authentication flow
func GetRedirectURI() string {
	return fmt.Sprintf("http://localhost:%d/callback", DefaultPort)
}
