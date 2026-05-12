package postgres

import (
	"context"
	"perdin-service/internal/domain/entity"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RefreshTokenRepository struct {
	pool *pgxpool.Pool
}

func NewRefreshTokenRepository(pool *pgxpool.Pool) *RefreshTokenRepository {
	return &RefreshTokenRepository{pool: pool}
}

func (r *RefreshTokenRepository) Create(ctx context.Context, token *entity.RefreshToken) error {
	query := `
	INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked, user_agent, ip_address)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.pool.Exec(ctx, query,
		token.ID,
		token.UserID,
		token.TokenHash,
		token.ExpiresAt,
		token.Revoked,
		token.UserAgent,
		token.IPAddress,
	)
	return err
}

func (r *RefreshTokenRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*entity.RefreshToken, error) {
	query := `
	SELECT id, user_id, token_hash, expires_at, revoked, user_agent, ip_address, created_at, revoked_at
	FROM refresh_tokens
	WHERE token_hash = $1 AND revoked = false
	`
	var token entity.RefreshToken
	err := r.pool.QueryRow(ctx, query, tokenHash).Scan(
		&token.ID,
		&token.UserID,
		&token.TokenHash,
		&token.ExpiresAt,
		&token.Revoked,
		&token.UserAgent,
		&token.IPAddress,
		&token.CreatedAt,
		&token.RevokedAt,
	)
	if err != nil {
		return nil, err
	}
	return &token, nil
}

func (r *RefreshTokenRepository) Revoke(ctx context.Context, tokenHash string) error {
	query := `
	UPDATE refresh_tokens
	SET revoked = true, revoked_at = $2
	WHERE token_hash = $1
	`
	now := time.Now()
	_, err := r.pool.Exec(ctx, query, tokenHash, now)
	return err
}
