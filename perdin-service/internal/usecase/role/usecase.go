package role

import (
	"context"
	"errors"
	"fmt"
	"perdin-service/internal/common/validator"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/repository"

	"github.com/google/uuid"
)

// Compile-time assertion.
var _ UseCase = (*RoleUseCase)(nil)

type RoleUseCase struct {
	repo      repository.RoleRepository
	validator *validator.Validator
}

func NewRoleUseCase(repo repository.RoleRepository, validator *validator.Validator) *RoleUseCase {
	return &RoleUseCase{repo: repo, validator: validator}
}

func (u *RoleUseCase) GetAll(ctx context.Context) ([]*entity.Role, error) {
	roles, err := u.repo.GetAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("get all roles: %w", err)
	}
	return roles, nil
}

func (u *RoleUseCase) Create(ctx context.Context, input CreateRoleInput) (*entity.Role, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	existing, _ := u.repo.GetByName(ctx, input.Name)
	if existing != nil {
		return nil, errors.New("role name already exists")
	}

	role := &entity.Role{
		ID:   uuid.NewString(),
		Name: input.Name,
	}

	result, err := u.repo.Create(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("create role: %w", err)
	}

	return result, nil
}

func (u *RoleUseCase) Delete(ctx context.Context, id string) error {
	if _, err := u.repo.GetByID(ctx, id); err != nil {
		return errors.New("role not found")
	}
	return u.repo.Delete(ctx, id)
}
