package repository

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/query"
)

type TravelRepository interface {
	GetByID(ctx context.Context, id string) (*entity.Travel, error)
	GetAll(ctx context.Context, pagination pagination.Request, filter query.TravelFilter) ([]*entity.Travel, int64, error)
	Create(ctx context.Context, travel *entity.Travel) (*entity.Travel, error)
	Update(ctx context.Context, travel *entity.Travel) (*entity.Travel, error)
	Delete(ctx context.Context, id string) error
}
