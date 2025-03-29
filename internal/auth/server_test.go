package auth

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/audetic/godeploy/internal/auth/templates"
)

func TestHashParamCallbackHTML(t *testing.T) {
	// Test that the template contains the necessary JavaScript functions
	if !strings.Contains(templates.HashParamCallbackHTML, "getHashParam") {
		t.Error("Template does not contain getHashParam function")
	}
	if !strings.Contains(templates.HashParamCallbackHTML, "processAuth") {
		t.Error("Template does not contain processAuth function")
	}
	if !strings.Contains(templates.HashParamCallbackHTML, "window.location.hash") {
		t.Error("Template does not contain code to access window.location.hash")
	}
	if !strings.Contains(templates.HashParamCallbackHTML, "/callback?access_token=") {
		t.Error("Template does not contain redirect to callback endpoint")
	}
}

func TestRootHandler(t *testing.T) {
	// Create a request to the root path
	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()

	// Create a handler function that simulates the root handler in StartLocalServer
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(templates.HashParamCallbackHTML))
			return
		}
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404 page not found"))
	})

	// Call the handler
	handler.ServeHTTP(w, req)

	// Check the response
	resp := w.Result()
	defer resp.Body.Close()

	// Check the status code
	if resp.StatusCode != http.StatusOK {
		t.Errorf("Expected status code %d, got %d", http.StatusOK, resp.StatusCode)
	}

	// Check the content type
	contentType := resp.Header.Get("Content-Type")
	if contentType != "text/html" {
		t.Errorf("Expected content type %s, got %s", "text/html", contentType)
	}

	// Check that the response contains the expected content
	if !strings.Contains(w.Body.String(), "Processing Authentication") {
		t.Error("Response does not contain expected HTML content")
	}
}

func TestCallbackHandler(t *testing.T) {
	tests := []struct {
		name           string
		url            string
		expectedStatus int
		expectedBody   string
	}{
		{
			name:           "success with token",
			url:            "/callback?access_token=test-token",
			expectedStatus: http.StatusOK,
			expectedBody:   "Authentication Successful",
		},
		{
			name:           "missing token",
			url:            "/callback",
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Authentication Failed",
		},
		{
			name:           "error response",
			url:            "/callback?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired",
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Authentication Failed",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", tt.url, nil)
			w := httptest.NewRecorder()

			// Create a handler function that simulates the callback handler in StartLocalServer
			handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// Get the access token from the query parameters
				token := r.URL.Query().Get("access_token")

				// Check for error parameters
				errorParam := r.URL.Query().Get("error")
				errorCode := r.URL.Query().Get("error_code")
				errorDescription := r.URL.Query().Get("error_description")

				if errorParam != "" {
					// Handle error case
					errorMessage := "Authentication failed."
					if errorDescription != "" {
						errorMessage = errorDescription
					}

					w.Header().Set("Content-Type", "text/html")
					w.WriteHeader(http.StatusBadRequest)
					w.Write([]byte(fmt.Sprintf(templates.ErrorHTML, errorMessage, errorParam, errorCode)))
					return
				}

				if token == "" {
					// Handle missing token case with HTML error page
					w.Header().Set("Content-Type", "text/html")
					w.WriteHeader(http.StatusBadRequest)
					w.Write([]byte(fmt.Sprintf(templates.ErrorHTML, "Access token not found in the callback URL", "missing_token", "")))
					return
				}

				// Check if this is a direct callback with a hash fragment
				if !strings.Contains(r.URL.RawQuery, "access_token") &&
					!strings.Contains(r.URL.RawQuery, "error") {
					w.Header().Set("Content-Type", "text/html")
					w.WriteHeader(http.StatusOK)
					w.Write([]byte(templates.HashParamCallbackHTML))
					return
				}

				w.Header().Set("Content-Type", "text/html")
				w.WriteHeader(http.StatusOK)
				w.Write([]byte(templates.SuccessHTML))
			})

			// Call the handler
			handler.ServeHTTP(w, req)

			// Check the response
			resp := w.Result()
			defer resp.Body.Close()

			// Check the status code
			if resp.StatusCode != tt.expectedStatus {
				t.Errorf("Expected status code %d, got %d", tt.expectedStatus, resp.StatusCode)
			}

			// Check the content type
			contentType := resp.Header.Get("Content-Type")
			if tt.expectedStatus == http.StatusOK || tt.expectedStatus == http.StatusBadRequest {
				if contentType != "text/html" {
					t.Errorf("Expected content type text/html, got %s", contentType)
				}
			} else {
				if contentType != "text/plain" {
					t.Errorf("Expected content type text/plain, got %s", contentType)
				}
			}

			// Check that the response contains the expected content
			if !strings.Contains(w.Body.String(), tt.expectedBody) {
				t.Errorf("Response does not contain expected content: %s", tt.expectedBody)
			}
		})
	}
}

func TestHashParamErrorHandling(t *testing.T) {
	// Test that the template handles error parameters correctly
	if !strings.Contains(templates.HashParamCallbackHTML, "getHashParam('error')") {
		t.Error("Template does not check for error parameter")
	}
	if !strings.Contains(templates.HashParamCallbackHTML, "getHashParam('error_code')") {
		t.Error("Template does not check for error_code parameter")
	}
	if !strings.Contains(templates.HashParamCallbackHTML, "getHashParam('error_description')") {
		t.Error("Template does not check for error_description parameter")
	}
	if !strings.Contains(templates.HashParamCallbackHTML, "'/callback?error='") {
		t.Error("Template does not contain redirect for error case")
	}
}
