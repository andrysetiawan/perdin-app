package role

// CreateRoleInput carries the data needed to create a new role.
type CreateRoleInput struct {
	Name string `json:"name" validate:"required,min=2,max=50"`
}
