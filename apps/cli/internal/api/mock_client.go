package api

// MockClient is a mock implementation of the API client for testing
type MockClient struct {
	// VerifyTokenFunc is a function that will be called by VerifyToken
	VerifyTokenFunc func(token string) (*VerifyResponse, error)
	// DeployFunc is a function that will be called by Deploy
	DeployFunc func(project string, spaConfigData []byte, archiveData []byte, commitSHA string, commitBranch string, commitMessage string, commitURL string, clearCache bool) (*DeployResponse, error)
}

// NewMockClient creates a new mock API client
func NewMockClient() *MockClient {
	return &MockClient{
		VerifyTokenFunc: func(token string) (*VerifyResponse, error) {
			return &VerifyResponse{
				Valid: true,
				User: struct {
					ID       string `json:"id"`
					Email    string `json:"email"`
					TenantID string `json:"tenant_id"`
				}{
					ID:       "mock-user-id",
					Email:    "mock@example.com",
					TenantID: "mock-tenant-id",
				},
			}, nil
		},
		DeployFunc: func(project string, spaConfigData []byte, archiveData []byte, commitSHA string, commitBranch string, commitMessage string, commitURL string, clearCache bool) (*DeployResponse, error) {
			return &DeployResponse{
				Success: true,
				URL:     "https://" + project + ".godeploy.app",
			}, nil
		},
	}
}

// VerifyToken calls the mock VerifyTokenFunc
func (m *MockClient) VerifyToken(token string) (*VerifyResponse, error) {
	return m.VerifyTokenFunc(token)
}

// Deploy calls the mock DeployFunc
func (m *MockClient) Deploy(project string, spaConfigData []byte, archiveData []byte, commitSHA string, commitBranch string, commitMessage string, commitURL string, clearCache bool) (*DeployResponse, error) {
	return m.DeployFunc(project, spaConfigData, archiveData, commitSHA, commitBranch, commitMessage, commitURL, clearCache)
}
