package user

import (
	"context"
	"errors"
	"fmt"
	"perdin-service/internal/common/pagination"
	"perdin-service/internal/common/validator"
	"perdin-service/internal/domain/entity"
	"perdin-service/internal/domain/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Compile-time assertion.
var _ UseCase = (*UserUseCase)(nil)

type UserUseCase struct {
	userRepo  repository.UserRepository
	roleRepo  repository.RoleRepository
	validator *validator.Validator
}

func NewUserUseCase(
	userRepo repository.UserRepository,
	roleRepo repository.RoleRepository,
	validator *validator.Validator,
) *UserUseCase {
	return &UserUseCase{
		userRepo:  userRepo,
		roleRepo:  roleRepo,
		validator: validator,
	}
}

func (u *UserUseCase) GetByID(ctx context.Context, id string) (*entity.User, error) {
	user, err := u.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (u *UserUseCase) GetAll(ctx context.Context, req pagination.Request) ([]*entity.User, int64, error) {
	req.Normalize()
	users, total, err := u.userRepo.GetAll(ctx, req)
	if err != nil {
		return nil, 0, fmt.Errorf("get all users: %w", err)
	}
	return users, total, nil
}

func (u *UserUseCase) Create(ctx context.Context, input CreateUserInput) (*entity.User, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	existing, _ := u.userRepo.GetByEmail(ctx, input.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user := &entity.User{
		ID:       uuid.NewString(),
		Name:     input.Name,
		Email:    input.Email,
		Password: string(hashedPassword),
	}

	result, err := u.userRepo.Create(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return result, nil
}

func (u *UserUseCase) Update(ctx context.Context, id string, input UpdateUserInput) (*entity.User, error) {
	if err := u.validator.Struct(input); err != nil {
		return nil, err
	}

	user, err := u.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("user not found")
	}

	if input.Name != nil {
		user.Name = *input.Name
	}
	if input.Email != nil {
		if *input.Email != user.Email {
			existing, _ := u.userRepo.GetByEmail(ctx, *input.Email)
			if existing != nil {
				return nil, errors.New("email already registered")
			}
		}
		user.Email = *input.Email
	}

	result, err := u.userRepo.Update(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}

	return result, nil
}

func (u *UserUseCase) Delete(ctx context.Context, id string) error {
	if _, err := u.userRepo.GetByID(ctx, id); err != nil {
		return errors.New("user not found")
	}
	return u.userRepo.Delete(ctx, id)
}

func (u *UserUseCase) ChangePassword(ctx context.Context, id string, input ChangePasswordInput) error {
	if err := u.validator.Struct(input); err != nil {
		return err
	}

	user, err := u.userRepo.GetByID(ctx, id)
	if err != nil {
		return errors.New("user not found")
	}

	// Verify old password.
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)); err != nil {
		return errors.New("old password is incorrect")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	return u.userRepo.UpdatePassword(ctx, id, string(hashedPassword))
}

func (u *UserUseCase) AssignRole(ctx context.Context, userID string, roleID string) error {
	if _, err := u.userRepo.GetByID(ctx, userID); err != nil {
		return errors.New("user not found")
	}
	if _, err := u.roleRepo.GetByID(ctx, roleID); err != nil {
		return errors.New("role not found")
	}

	return u.userRepo.AssignRole(ctx, userID, roleID)
}

func (u *UserUseCase) RemoveRole(ctx context.Context, userID, roleID string) error {
	if _, err := u.userRepo.GetByID(ctx, userID); err != nil {
		return errors.New("user not found")
	}
	if _, err := u.roleRepo.GetByID(ctx, roleID); err != nil {
		return errors.New("role not found")
	}
	return u.userRepo.RemoveRole(ctx, userID, roleID)
}
