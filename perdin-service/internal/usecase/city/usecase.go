package city

import (
	"context"
	"errors"
	"fmt"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/common/validator"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/repository"

	"github.com/google/uuid"
)

// Compile-time assertion: CityUseCase must satisfy the UseCase interface.
var _ UseCase = (*CityUseCase)(nil)

type CityUseCase struct {
	repo      repository.CityRepository
	validator *validator.Validator
}

func NewCityUseCase(repo repository.CityRepository, validator *validator.Validator) *CityUseCase {
	return &CityUseCase{
		repo:      repo,
		validator: validator,
	}
}

func (u *CityUseCase) GetByID(ctx context.Context, id string) (*entity.City, error) {
	city, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("city not found")
	}
	return city, nil
}

func (u *CityUseCase) GetAll(ctx context.Context, req pagination.Request) ([]*entity.City, int64, error) {
	req.Normalize()
	cities, total, err := u.repo.GetAll(ctx, req)
	if err != nil {
		return nil, 0, fmt.Errorf("get all cities: %w", err)
	}
	return cities, total, nil
}

func (u *CityUseCase) Create(ctx context.Context, input CreateCityInput) (*entity.City, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	city := &entity.City{
		ID:         uuid.NewString(),
		Name:       input.Name,
		Latitude:   input.Latitude,
		Longitude:  input.Longitude,
		Province:   input.Province,
		Island:     input.Island,
		IsOverseas: input.IsOverseas,
	}
	return u.repo.Create(ctx, city)
}

func (u *CityUseCase) Update(ctx context.Context, id string, input UpdateCityInput) (*entity.City, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	city, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("city not found")
	}

	if input.Name != nil {
		city.Name = *input.Name
	}
	if input.Latitude != nil {
		city.Latitude = *input.Latitude
	}
	if input.Longitude != nil {
		city.Longitude = *input.Longitude
	}
	if input.Province != nil {
		city.Province = *input.Province
	}
	if input.Island != nil {
		city.Island = *input.Island
	}
	if input.IsOverseas != nil {
		city.IsOverseas = *input.IsOverseas
	}
	return u.repo.Update(ctx, city)
}

func (u *CityUseCase) Delete(ctx context.Context, id string) error {
	return u.repo.Delete(ctx, id)
}
