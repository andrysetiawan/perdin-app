package dto

// TokenResponse is the HTTP response body for login and refresh-token endpoints.
type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}
