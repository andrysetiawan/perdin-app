package user

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"
)

// UseCase is the interface the HTTP handler depends on.
type UseCase interface {
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetAll(ctx context.Context, req pagination.Request) ([]*entity.User, int64, error)
	Create(ctx context.Context, input CreateUserInput) (*entity.User, error)
	Update(ctx context.Context, id string, input UpdateUserInput) (*entity.User, error)
	ChangePassword(ctx context.Context, id string, input ChangePasswordInput) error
	Delete(ctx context.Context, id string) error
	AssignRole(ctx context.Context, userID string, roleID string) error
	RemoveRole(ctx context.Context, userID, roleID string) error
}
