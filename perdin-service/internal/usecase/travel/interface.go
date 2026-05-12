package travel

import (
	"context"
	"perdin-service/internal/domain/entity"
)

// UseCase is the interface the HTTP handler depends on.
type UseCase interface {
	GetByID(ctx context.Context, id string) (*entity.Travel, error)
	GetAll(ctx context.Context, input ListTravelInput) ([]*entity.Travel, int64, error)
	Create(ctx context.Context, input CreateTravelInput) (*entity.Travel, error)
	Update(ctx context.Context, id string, input UpdateTravelInput) (*entity.Travel, error)
	Approve(ctx context.Context, id string, input ApproveInput) (*entity.Travel, error)
	Reject(ctx context.Context, id string, input ChangeStatusInput) (*entity.Travel, error)
	Delete(ctx context.Context, id string) error
}
