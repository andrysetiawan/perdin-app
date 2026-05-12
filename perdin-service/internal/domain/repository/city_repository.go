package repository

import (
	"context"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/domain/entity"
)

type CityRepository interface {
	GetByID(ctx context.Context, id string) (*entity.City, error)
	GetAll(ctx context.Context, pagination pagination.Request) ([]*entity.City, int64, error)
	Create(ctx context.Context, city *entity.City) (*entity.City, error)
	Update(ctx context.Context, city *entity.City) (*entity.City, error)
	Delete(ctx context.Context, id string) error
}
