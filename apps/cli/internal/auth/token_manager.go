package auth

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/silvabyte/godeploy/internal/logging"
)

// TokenManager manages token lifecycle including expiration checks and refresh
type TokenManager struct {
	// apiClient is injected to avoid circular dependencies
	refreshFunc func(refreshToken string) (string, string, error)
}

// NewTokenManager creates a new TokenManager with a refresh function
func NewTokenManager(refreshFunc func(string) (string, string, error)) *TokenManager {
	return &TokenManager{
		refreshFunc: refreshFunc,
	}
}

// JWTClaims represents the claims in a JWT token
type JWTClaims struct {
	Exp int64 `json:"exp"`
}

// EnsureValidToken returns a valid access token, refreshing if needed
// This is the main entry point for getting an authenticated token
func (tm *TokenManager) EnsureValidToken() (string, error) {
	logging.Debug().Msg("ensuring valid token")

	token, err := GetAuthToken()
	if err != nil {
		logging.Err(err, "failed to get auth token")
		return "", err
	}

	if token == "" {
		logging.Debug().Msg("no authentication token found")
		return "", fmt.Errorf("no authentication token found")
	}

	logging.Debug().Msg("checking token expiration")

	// Check if token is expired or expiring soon (within 5 minutes)
	expired, err := tm.IsTokenExpired(token, 5*time.Minute)
	if err != nil {
		logging.Warn().Err(err).Msg("failed to check token expiration, attempting refresh")
		// If we can't parse the token, try to refresh anyway
		if refreshErr := tm.RefreshAccessToken(); refreshErr != nil {
			logging.Err(refreshErr, "token parse failed and refresh failed")
			return "", fmt.Errorf("token may be invalid and refresh failed: %w", refreshErr)
		}
		logging.Info().Msg("token refreshed after parse failure")
		// Get the new token after refresh
		return GetAuthToken()
	}

	logging.Debug().Bool("expired", expired).Msg("token expiration check complete")

	if expired {
		logging.Info().Msg("token expired or expiring soon, refreshing")
		// Token is expired or expiring soon, refresh it
		if err := tm.RefreshAccessToken(); err != nil {
			logging.Err(err, "token refresh failed")
			return "", fmt.Errorf("token expired and refresh failed: %w", err)
		}
		logging.Info().Msg("token refreshed successfully")
		// Get the new token after refresh
		return GetAuthToken()
	}

	logging.Debug().Msg("token is valid")
	return token, nil
}

// IsTokenExpired checks if a JWT token is expired or expiring within the buffer duration
// This decodes the JWT without verification to read the exp claim
func (tm *TokenManager) IsTokenExpired(token string, buffer time.Duration) (bool, error) {
	// Parse JWT to get exp claim
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return true, fmt.Errorf("invalid JWT format")
	}

	// Decode the payload (second part)
	payload, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return true, fmt.Errorf("failed to decode JWT payload: %w", err)
	}

	var claims JWTClaims
	if err := json.Unmarshal(payload, &claims); err != nil {
		return true, fmt.Errorf("failed to parse JWT claims: %w", err)
	}

	// Check if token is expired or expiring within buffer
	expirationTime := time.Unix(claims.Exp, 0)
	return time.Now().Add(buffer).After(expirationTime), nil
}

// RefreshAccessToken exchanges the refresh token for a new access token
func (tm *TokenManager) RefreshAccessToken() error {
	logging.Debug().Msg("starting token refresh")

	refreshToken, err := GetRefreshToken()
	if err != nil {
		logging.Err(err, "failed to get refresh token from storage")
		return fmt.Errorf("failed to get refresh token: %w", err)
	}

	if refreshToken == "" {
		logging.Warn().Msg("no refresh token found in storage")
		return fmt.Errorf("no refresh token found, please login again")
	}

	logging.Debug().Msg("calling refresh API")

	// Call the refresh function (injected from API client)
	newAccessToken, newRefreshToken, err := tm.refreshFunc(refreshToken)
	if err != nil {
		logging.Error().Err(err).Msg("refresh API call failed")
		return fmt.Errorf("failed to refresh token: %w", err)
	}

	logging.Debug().Msg("saving new tokens")

	// Save the new tokens
	if err := SetTokens(newAccessToken, newRefreshToken); err != nil {
		logging.Err(err, "failed to save refreshed tokens")
		return fmt.Errorf("failed to save refreshed tokens: %w", err)
	}

	logging.Info().Msg("tokens refreshed and saved successfully")
	return nil
}
