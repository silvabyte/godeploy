package auth

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHashParamCallbackHTML(t *testing.T) {
	// Test that the HashParamCallbackHTML contains the necessary JavaScript functions
	if !strings.Contains(HashParamCallbackHTML, "getHashParam") {
		t.Error("HashParamCallbackHTML does not contain getHashParam function")
	}
	if !strings.Contains(HashParamCallbackHTML, "processAuth") {
		t.Error("HashParamCallbackHTML does not contain processAuth function")
	}
	if !strings.Contains(HashParamCallbackHTML, "window.location.hash") {
		t.Error("HashParamCallbackHTML does not contain code to access window.location.hash")
	}
	if !strings.Contains(HashParamCallbackHTML, "/callback?access_token=") {
		t.Error("HashParamCallbackHTML does not contain redirect to callback endpoint")
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
			w.Write([]byte(HashParamCallbackHTML))
			return
		}
		http.NotFound(w, r)
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

	// Check that the response contains the HashParamCallbackHTML
	if !strings.Contains(w.Body.String(), "Processing Authentication") {
		t.Error("Response does not contain expected HTML content")
	}
}

func TestCallbackHandler(t *testing.T) {
	// Create a request to the callback path with an access_token
	req := httptest.NewRequest("GET", "/callback?access_token=test-token", nil)
	w := httptest.NewRecorder()

	// Create a handler function that simulates the callback handler in StartLocalServer
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("access_token")
		if token == "" {
			http.Error(w, "Access token not found in the callback URL", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(SuccessHTML))
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

	// Check that the response contains the SuccessHTML
	if !strings.Contains(w.Body.String(), "Authentication Successful") {
		t.Error("Response does not contain expected HTML content")
	}
}

func TestMissingTokenHandler(t *testing.T) {
	// Create a request to the callback path without an access_token
	req := httptest.NewRequest("GET", "/callback", nil)
	w := httptest.NewRecorder()

	// Create a handler function that simulates the callback handler in StartLocalServer
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("access_token")
		if token == "" {
			http.Error(w, "Access token not found in the callback URL", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(SuccessHTML))
	})

	// Call the handler
	handler.ServeHTTP(w, req)

	// Check the response
	resp := w.Result()
	defer resp.Body.Close()

	// Check the status code
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status code %d, got %d", http.StatusBadRequest, resp.StatusCode)
	}
}

func TestErrorHandling(t *testing.T) {
	// Create a request to the callback path with error parameters
	req := httptest.NewRequest("GET", "/callback?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired", nil)
	w := httptest.NewRecorder()

	// Create a handler function that simulates the callback handler in StartLocalServer
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

			// Return the error HTML
			w.Header().Set("Content-Type", "text/html")
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(fmt.Sprintf(
				ErrorHTML,
				errorMessage,
				errorParam,
				errorCode,
			)))
			return
		}

		// If no error, check for token
		token := r.URL.Query().Get("access_token")
		if token == "" {
			http.Error(w, "Access token not found in the callback URL", http.StatusBadRequest)
			return
		}

		w.Header().Set("Content-Type", "text/html")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(SuccessHTML))
	})

	// Call the handler
	handler.ServeHTTP(w, req)

	// Check the response
	resp := w.Result()
	defer resp.Body.Close()

	// Check the status code
	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("Expected status code %d, got %d", http.StatusBadRequest, resp.StatusCode)
	}

	// Check the content type
	contentType := resp.Header.Get("Content-Type")
	if contentType != "text/html" {
		t.Errorf("Expected content type %s, got %s", "text/html", contentType)
	}

	// Check that the response contains the error information
	body := w.Body.String()
	if !strings.Contains(body, "Authentication Failed") {
		t.Error("Response does not contain expected error title")
	}
	if !strings.Contains(body, "Email link is invalid or has expired") {
		t.Error("Response does not contain expected error description")
	}
	if !strings.Contains(body, "access_denied") {
		t.Error("Response does not contain expected error type")
	}
	if !strings.Contains(body, "otp_expired") {
		t.Error("Response does not contain expected error code")
	}
}

func TestHashParamErrorHandling(t *testing.T) {
	// Test that the HashParamCallbackHTML handles error parameters correctly
	if !strings.Contains(HashParamCallbackHTML, "getHashParam('error')") {
		t.Error("HashParamCallbackHTML does not check for error parameter")
	}
	if !strings.Contains(HashParamCallbackHTML, "getHashParam('error_code')") {
		t.Error("HashParamCallbackHTML does not check for error_code parameter")
	}
	if !strings.Contains(HashParamCallbackHTML, "getHashParam('error_description')") {
		t.Error("HashParamCallbackHTML does not check for error_description parameter")
	}
	if !strings.Contains(HashParamCallbackHTML, "'/callback?error='") {
		t.Error("HashParamCallbackHTML does not contain redirect for error case")
	}
}
