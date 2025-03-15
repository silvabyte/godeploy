package auth

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"
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

// HashParamCallbackHTML is the HTML template for handling hash parameters
const HashParamCallbackHTML = `
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
        .processing-text {
            font-size: 16px;
            color: #666;
            margin-top: 20px;
        }
        .error-text {
            color: #e74c3c;
            font-weight: bold;
        }
        .debug-info {
            font-family: monospace;
            font-size: 12px;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            text-align: left;
            max-height: 200px;
            overflow: auto;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Processing Authentication</h1>
        <p class="processing-text">Please wait while we complete your authentication...</p>
    </div>
    <script>
        // Function to parse hash parameters
        function getHashParam(name) {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            return params.get(name);
        }

        // Function to extract token and redirect
        function processAuth() {
            // Get the full hash without the # character
            const hash = window.location.hash.substring(1);
            
            // Try URLSearchParams first (standard approach)
            const token = getHashParam('access_token');
            const error = getHashParam('error');
            const errorCode = getHashParam('error_code');
            const errorDescription = getHashParam('error_description');
            
            if (token) {
                // Redirect to the callback endpoint with the token as a query parameter
                window.location.href = '/callback?access_token=' + encodeURIComponent(token);
                return;
            } 
            
            if (error) {
                // Redirect to the callback endpoint with the error parameters
                let errorUrl = '/callback?error=' + encodeURIComponent(error);
                if (errorCode) {
                    errorUrl += '&error_code=' + encodeURIComponent(errorCode);
                }
                if (errorDescription) {
                    errorUrl += '&error_description=' + encodeURIComponent(errorDescription);
                }
                window.location.href = errorUrl;
                return;
            }
            
            // If URLSearchParams didn't work, try manual parsing
            // Some OAuth providers use a different format
            if (hash) {
                const hashParts = hash.split('&');
                for (const part of hashParts) {
                    if (part.startsWith('access_token=')) {
                        const extractedToken = part.substring('access_token='.length);
                        if (extractedToken) {
                            window.location.href = '/callback?access_token=' + encodeURIComponent(extractedToken);
                            return;
                        }
                    }
                }
            }
            
            // No token or error found in hash, display error
            document.querySelector('.container').innerHTML = 
                '<h1>Authentication Error</h1>' +
                '<p>No access token or error information found in the URL. Please try again.</p>' +
                '<div class="debug-info">Hash received: ' + hash + '</div>';
        }

        // Process the authentication immediately
        processAuth();
    </script>
</body>
</html>
`

// ErrorHTML is the HTML template for the error page
const ErrorHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>GoDeploy Authentication Error</title>
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
            color: #e74c3c;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .error-icon {
            color: #e74c3c;
            font-size: 64px;
            margin-bottom: 20px;
        }
        .error-details {
            background-color: #f9f9f9;
            border-radius: 4px;
            padding: 15px;
            text-align: left;
            margin-bottom: 20px;
            font-family: monospace;
            font-size: 14px;
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
        <div class="error-icon">✗</div>
        <h1>Authentication Failed</h1>
        <p>%s</p>
        <div class="error-details">
            <strong>Error:</strong> %s<br>
            <strong>Code:</strong> %s
        </div>
        <p class="close-text">This window will automatically close in a few seconds...</p>
    </div>
    <script>
        // Auto-close the window after 10 seconds
        setTimeout(function() {
            window.close();
        }, 10000);
    </script>
</body>
</html>
`

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
			w.Write([]byte(HashParamCallbackHTML))
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
			w.Write([]byte(fmt.Sprintf(
				ErrorHTML,
				errorMessage,
				errorParam,
				errorCode,
			)))

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

	// Set up a handler for the root path to handle hash parameters
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If this is the root path, serve the hash parameter handler HTML
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(HashParamCallbackHTML))
			return
		}

		// For any other path, return 404
		http.NotFound(w, r)
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
