package role

import (
	"context"
	"perdin-service/internal/domain/entity"
)

// UseCase is the interface the HTTP handler depends on.
type UseCase interface {
	GetAll(ctx context.Context) ([]*entity.Role, error)
	Create(ctx context.Context, input CreateRoleInput) (*entity.Role, error)
	Delete(ctx context.Context, id string) error
}
