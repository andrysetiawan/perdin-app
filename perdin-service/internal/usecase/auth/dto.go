package auth

// LoginInput carries the credentials needed to authenticate a user.
type LoginInput struct {
	Email     string `json:"email"    validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	UserAgent string `json:"-"`
	IPAddress string `json:"-"`
}

// RefreshTokenInput carries the raw refresh token for rotation.
type RefreshTokenInput struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
	UserAgent    string `json:"-"`
	IPAddress    string `json:"-"`
}

// LogoutInput carries the raw refresh token to be revoked.
type LogoutInput struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// TokenOutput is the result of a successful login or token refresh.
type TokenOutput struct {
	AccessToken  string
	RefreshToken string
}
