package port

import "time"

// TokenClaims holds the parsed claims from an access token.
type TokenClaims struct {
	UserID string
	Email  string
	Roles  []string
}

// TokenService abstracts JWT (or any token) operations so the usecase
// and middleware layers never depend on a concrete infrastructure type.
type TokenService interface {
	GenerateAccessToken(userID, email string, roles []string) (string, error)
	GenerateRefreshToken(userID string) (string, error)
	Validate(tokenString string) (*TokenClaims, error)
	RefreshExpiry() time.Duration
}
