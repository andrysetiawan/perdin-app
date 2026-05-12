package repository

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"
)

type UserRepository interface {
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByEmail(ctx context.Context, email string) (*entity.User, error)
	GetAll(ctx context.Context, pagination pagination.Request) ([]*entity.User, int64, error)
	Create(ctx context.Context, user *entity.User) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) (*entity.User, error)
	UpdatePassword(ctx context.Context, id, hashedPassword string) error
	Delete(ctx context.Context, id string) error
	AssignRole(ctx context.Context, userID, roleID string) error
	RemoveRole(ctx context.Context, userID, roleID string) error
}
