package auth

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"
)

const (
	// DefaultPort is the default port for the local auth server
	DefaultPort = 38389

	// DefaultTimeout is the default timeout for the local auth server
	DefaultTimeout = 10 * time.Minute
)

// SuccessHTML is the HTML template for the success page
const SuccessHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>GoDeploy Authentication</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
            max-width: 500px;
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .success-icon {
            color: #4CAF50;
            font-size: 64px;
            margin-bottom: 20px;
        }
        .close-text {
            font-size: 14px;
            color: #999;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon">✓</div>
        <h1>Authentication Successful!</h1>
        <p>You have successfully authenticated with GoDeploy. You can now close this window and return to the CLI.</p>
        <p class="close-text">This window will automatically close in a few seconds...</p>
    </div>
    <script>
        // Auto-close the window after 7 seconds
        setTimeout(function() {
            window.close();
        }, 7000);
    </script>
</body>
</html>
`

// AuthResult represents the result of the authentication process
type AuthResult struct {
	Token string
	Error error
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

	// Set up the handler
	http.HandleFunc("/callback", func(w http.ResponseWriter, r *http.Request) {
		// Get the access token from the query parameters
		token := r.URL.Query().Get("access_token")
		if token == "" {
			http.Error(w, "Access token not found in the callback URL", http.StatusBadRequest)
			resultCh <- AuthResult{Error: fmt.Errorf("access token not found in the callback URL")}
			return
		}

		// Return the success HTML
		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(SuccessHTML))

		// Send the token to the channel
		resultCh <- AuthResult{Token: token}

		// Shutdown the server after a short delay to allow the response to be sent
		go func() {
			time.Sleep(1 * time.Second)
			server.Shutdown(context.Background())
		}()
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
