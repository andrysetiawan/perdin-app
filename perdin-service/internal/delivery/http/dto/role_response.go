package dto

import "perdin-service/internal/domain/entity"

// RoleResponse is the HTTP response body for role endpoints.
type RoleResponse struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func ToRoleResponse(role *entity.Role) RoleResponse {
	return RoleResponse{
		ID:   role.ID,
		Name: role.Name,
	}
}

func ToRoleResponses(roles []*entity.Role) []RoleResponse {
	responses := make([]RoleResponse, len(roles))
	for i, role := range roles {
		responses[i] = ToRoleResponse(role)
	}
	return responses
}
