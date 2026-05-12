package repository

import (
	"context"
	"perdin-service/internal/domain/entity"
)

type RoleRepository interface {
	GetByID(ctx context.Context, id string) (*entity.Role, error)
	GetByName(ctx context.Context, name string) (*entity.Role, error)
	GetAll(ctx context.Context) ([]*entity.Role, error)
	Create(ctx context.Context, role *entity.Role) (*entity.Role, error)
	Delete(ctx context.Context, id string) error
}
