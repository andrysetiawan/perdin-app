package dto

import "perdin-service/internal/domain/entity"

// UserResponse is the HTTP response body for user endpoints.
type UserResponse struct {
	ID    string         `json:"id"`
	Name  string         `json:"name"`
	Email string         `json:"email"`
	Roles []RoleResponse `json:"roles"`
}

func ToUserResponse(user *entity.User) UserResponse {
	roles := make([]RoleResponse, len(user.Roles))
	for i, r := range user.Roles {
		roles[i] = RoleResponse{ID: r.ID, Name: r.Name}
	}
	return UserResponse{
		ID:    user.ID,
		Name:  user.Name,
		Email: user.Email,
		Roles: roles,
	}
}

func ToUserResponses(users []*entity.User) []UserResponse {
	responses := make([]UserResponse, len(users))
	for i, user := range users {
		responses[i] = ToUserResponse(user)
	}
	return responses
}
