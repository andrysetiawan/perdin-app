package auth

import (
	"context"
	"errors"
	"fmt"
	"perdin-service/internal/common/security"
	"perdin-service/internal/common/validator"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/port"
	"perdin-service/internal/domain/repository"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Compile-time assertion: AuthUseCase must satisfy the UseCase interface.
var _ UseCase = (*AuthUseCase)(nil)

type AuthUseCase struct {
	userRepo         repository.UserRepository
	refreshTokenRepo repository.RefreshTokenRepository
	tokenService     port.TokenService
	validator        *validator.Validator
}

func NewAuthUseCase(
	userRepo repository.UserRepository,
	refreshTokenRepo repository.RefreshTokenRepository,
	tokenService port.TokenService,
	validator *validator.Validator,
) *AuthUseCase {
	return &AuthUseCase{
		userRepo:         userRepo,
		refreshTokenRepo: refreshTokenRepo,
		tokenService:     tokenService,
		validator:        validator,
	}
}

func (u *AuthUseCase) Login(ctx context.Context, input LoginInput) (TokenOutput, error) {
	if err := u.validator.Struct(input); err != nil {
		return TokenOutput{}, err
	}

	user, err := u.userRepo.GetByEmail(ctx, input.Email)
	if err != nil {
		return TokenOutput{}, errors.New("invalid credentials")
	}

	if err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return TokenOutput{}, errors.New("invalid credentials")
	}

	roles := extractRoleNames(user.Roles)

	accessToken, err := u.tokenService.GenerateAccessToken(user.ID, user.Email, roles)
	if err != nil {
		return TokenOutput{}, fmt.Errorf("generate access token: %w", err)
	}

	refreshToken, err := u.tokenService.GenerateRefreshToken(user.ID)
	if err != nil {
		return TokenOutput{}, fmt.Errorf("generate refresh token: %w", err)
	}

	if err = u.storeRefreshToken(ctx, user.ID, refreshToken, input.UserAgent, input.IPAddress); err != nil {
		return TokenOutput{}, fmt.Errorf("store refresh token: %w", err)
	}

	return TokenOutput{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (u *AuthUseCase) RefreshToken(ctx context.Context, input RefreshTokenInput) (TokenOutput, error) {
	if err := u.validator.Struct(input); err != nil {
		return TokenOutput{}, err
	}

	hashedToken := security.HashToken(input.RefreshToken)

	stored, err := u.refreshTokenRepo.GetByTokenHash(ctx, hashedToken)
	if err != nil {
		return TokenOutput{}, errors.New("invalid refresh token")
	}

	if stored.Revoked {
		return TokenOutput{}, errors.New("refresh token revoked")
	}

	if stored.ExpiresAt.Before(time.Now()) {
		return TokenOutput{}, errors.New("refresh token expired")
	}

	user, err := u.userRepo.GetByID(ctx, stored.UserID)
	if err != nil {
		return TokenOutput{}, errors.New("user not found")
	}

	// Rotate: revoke old token before issuing new one.
	if err = u.refreshTokenRepo.Revoke(ctx, hashedToken); err != nil {
		return TokenOutput{}, fmt.Errorf("revoke old refresh token: %w", err)
	}

	roles := extractRoleNames(user.Roles)

	accessToken, err := u.tokenService.GenerateAccessToken(user.ID, user.Email, roles)
	if err != nil {
		return TokenOutput{}, fmt.Errorf("generate access token: %w", err)
	}

	newRefreshToken, err := u.tokenService.GenerateRefreshToken(user.ID)
	if err != nil {
		return TokenOutput{}, fmt.Errorf("generate refresh token: %w", err)
	}

	if err = u.storeRefreshToken(ctx, user.ID, newRefreshToken, input.UserAgent, input.IPAddress); err != nil {
		return TokenOutput{}, fmt.Errorf("store refresh token: %w", err)
	}

	return TokenOutput{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (u *AuthUseCase) Logout(ctx context.Context, input LogoutInput) error {
	if err := u.validator.Struct(input); err != nil {
		return err
	}

	hashedToken := security.HashToken(input.RefreshToken)
	if err := u.refreshTokenRepo.Revoke(ctx, hashedToken); err != nil {
		return fmt.Errorf("revoke refresh token: %w", err)
	}
	return nil
}

// ── helpers ──────────────────────────────────────────────────────────────────

func (u *AuthUseCase) storeRefreshToken(ctx context.Context, userID, rawToken, userAgent, ipAddress string) error {
	return u.refreshTokenRepo.Create(ctx, &entity.RefreshToken{
		ID:        uuid.NewString(),
		UserID:    userID,
		TokenHash: security.HashToken(rawToken),
		UserAgent: userAgent,
		IPAddress: ipAddress,
		ExpiresAt: time.Now().Add(u.tokenService.RefreshExpiry()),
		Revoked:   false,
	})
}

func extractRoleNames(roles []entity.Role) []string {
	names := make([]string, len(roles))
	for i, r := range roles {
		names[i] = r.Name
	}
	return names
}
