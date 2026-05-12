package city

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"
)

// UseCase is the interface the HTTP handler depends on.
type UseCase interface {
	GetByID(ctx context.Context, id string) (*entity.City, error)
	GetAll(ctx context.Context, req pagination.Request) ([]*entity.City, int64, error)
	Create(ctx context.Context, input CreateCityInput) (*entity.City, error)
	Update(ctx context.Context, id string, input UpdateCityInput) (*entity.City, error)
	Delete(ctx context.Context, id string) error
}
