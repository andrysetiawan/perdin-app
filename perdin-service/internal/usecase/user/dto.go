package user

// CreateUserInput carries the data needed to register a new user.
type CreateUserInput struct {
	Name     string `json:"name"     validate:"required,min=2,max=100"`
	Email    string `json:"email"    validate:"required,email"`
	Password string `json:"password" validate:"required,min=6,max=72"`
}

// UpdateUserInput carries the fields to update on an existing user.
type UpdateUserInput struct {
	Name  *string `json:"name"  validate:"omitempty,min=2,max=100"`
	Email *string `json:"email" validate:"omitempty,email"`
}

// ChangePasswordInput carries the data needed to change a user's password.
type ChangePasswordInput struct {
	OldPassword string `json:"old_password" validate:"required,min=6"`
	NewPassword string `json:"new_password" validate:"required,min=6,max=72"`
}

// AssignRoleInput carries the role to assign to a user.
type AssignRoleInput struct {
	RoleID string `json:"role_id" validate:"required,uuid4"`
}
