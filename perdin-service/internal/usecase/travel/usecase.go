package travel

import (
	"context"
	"errors"
	"fmt"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/common/validator"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/query"
	"perdin-service/internal/domain/repository"
	"perdin-service/internal/domain/service"
	"time"

	"github.com/google/uuid"
)

// Compile-time assertion: TravelUseCase must satisfy the UseCase interface.
var _ UseCase = (*TravelUseCase)(nil)

type TravelUseCase struct {
	repo      repository.TravelRepository
	cityRepo  repository.CityRepository
	validator *validator.Validator
}

func NewTravelUseCase(
	repo repository.TravelRepository,
	cityRepo repository.CityRepository,
	validator *validator.Validator,
) *TravelUseCase {
	return &TravelUseCase{
		repo:      repo,
		cityRepo:  cityRepo,
		validator: validator,
	}
}

func (u *TravelUseCase) GetByID(ctx context.Context, id string) (*entity.Travel, error) {
	travel, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("travel not found")
	}
	return travel, nil
}

func (u *TravelUseCase) GetAll(ctx context.Context, input ListTravelInput) ([]*entity.Travel, int64, error) {
	pag := pagination.Request{
		Page:  input.Page,
		Limit: input.Limit,
	}
	pag.Normalize()

	filter := query.TravelFilter{}
	if input.UserID != nil {
		filter.UserID = *input.UserID
	}
	if input.Status != nil {
		filter.Status = *input.Status
	}

	travels, total, err := u.repo.GetAll(ctx, pag, filter)
	if err != nil {
		return nil, 0, fmt.Errorf("get all travels: %w", err)
	}
	return travels, total, nil
}

func (u *TravelUseCase) Create(ctx context.Context, input CreateTravelInput) (*entity.Travel, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	if !input.EndDate.After(input.StartDate) {
		return nil, errors.New("end_date must be after start_date")
	}

	origin, err := u.cityRepo.GetByID(ctx, input.OriginCityID)
	if err != nil {
		return nil, errors.New("origin city not found")
	}

	destination, err := u.cityRepo.GetByID(ctx, input.DestinationCityID)
	if err != nil {
		return nil, errors.New("destination city not found")
	}

	distanceKM := service.Haversine(origin.Latitude, origin.Longitude, destination.Latitude, destination.Longitude)
	allowancePerDay := service.CalculateAllowance(distanceKM, *origin, *destination)
	durationDays := int(input.EndDate.Sub(input.StartDate).Hours()/24) + 1

	travel := &entity.Travel{
		ID:                uuid.NewString(),
		UserID:            input.UserID,
		Purpose:           input.Purpose,
		StartDate:         input.StartDate,
		EndDate:           input.EndDate,
		OriginCityID:      input.OriginCityID,
		DestinationCityID: input.DestinationCityID,
		DurationDays:      durationDays,
		DistanceKM:        distanceKM,
		AllowancePerDay:   allowancePerDay,
		TotalAllowance:    allowancePerDay * float64(durationDays),
		Status:            "pending",
	}

	return u.repo.Create(ctx, travel)
}

func (u *TravelUseCase) Update(ctx context.Context, id string, input UpdateTravelInput) (*entity.Travel, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	travel, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("travel not found")
	}

	// Only pending travel requests can be edited by the employee.
	if travel.Status != "pending" {
		return nil, errors.New("only pending travel requests can be updated")
	}

	if input.Purpose != nil {
		travel.Purpose = *input.Purpose
	}
	if input.StartDate != nil {
		travel.StartDate = *input.StartDate
	}
	if input.EndDate != nil {
		travel.EndDate = *input.EndDate
	}
	if input.OriginCityID != nil {
		travel.OriginCityID = *input.OriginCityID
	}
	if input.DestinationCityID != nil {
		travel.DestinationCityID = *input.DestinationCityID
	}

	// Recompute derived fields whenever city or dates change.
	if input.OriginCityID != nil || input.DestinationCityID != nil || input.StartDate != nil || input.EndDate != nil {
		origin, err := u.cityRepo.GetByID(ctx, travel.OriginCityID)
		if err != nil {
			return nil, errors.New("origin city not found")
		}
		destination, err := u.cityRepo.GetByID(ctx, travel.DestinationCityID)
		if err != nil {
			return nil, errors.New("destination city not found")
		}

		distanceKM := service.Haversine(origin.Latitude, origin.Longitude, destination.Latitude, destination.Longitude)
		allowancePerDay := service.CalculateAllowance(distanceKM, *origin, *destination)
		durationDays := int(travel.EndDate.Sub(travel.StartDate).Hours()/24) + 1

		travel.DistanceKM = distanceKM
		travel.AllowancePerDay = allowancePerDay
		travel.DurationDays = durationDays
		travel.TotalAllowance = allowancePerDay * float64(durationDays)
	}

	return u.repo.Update(ctx, travel)
}

// Approve allows SDM to approve a pending travel request.
func (u *TravelUseCase) Approve(ctx context.Context, id string, input ApproveInput) (*entity.Travel, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	travel, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("travel not found")
	}

	if travel.Status != "pending" {
		return nil, errors.New("only pending travel requests can be approved")
	}

	travel.Status = input.Status
	travel.ApprovedBy = input.ApprovedBy
	travel.ApprovedAt = time.Now()

	return u.repo.Update(ctx, travel)
}

func (u *TravelUseCase) Reject(ctx context.Context, id string, input ChangeStatusInput) (*entity.Travel, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	travel, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("travel not found")
	}

	if travel.Status != "pending" {
		return nil, errors.New("only pending travel requests can be rejected")
	}
	travel.Status = input.Status

	return u.repo.Update(ctx, travel)
}

func (u *TravelUseCase) Delete(ctx context.Context, id string) error {
	travel, err := u.repo.GetByID(ctx, id)
	if err != nil {
		return errors.New("travel not found")
	}

	// Only pending travel requests can be deleted.
	if travel.Status != "pending" {
		return errors.New("only pending travel requests can be deleted")
	}

	return u.repo.Delete(ctx, id)
}
