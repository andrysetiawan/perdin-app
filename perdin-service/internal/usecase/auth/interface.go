package auth

import "context"

// UseCase is the interface the HTTP handler depends on.
// Handlers never import the concrete AuthUseCase struct.
type UseCase interface {
	Login(ctx context.Context, input LoginInput) (TokenOutput, error)
	RefreshToken(ctx context.Context, input RefreshTokenInput) (TokenOutput, error)
	Logout(ctx context.Context, input LogoutInput) error
}
