package middleware

import (
	"net/http"
	"perdin-service/internal/common/response"
)

// RoleMiddleware checks that the authenticated user has at least one of the allowed roles.
// Must be used after JWTMiddleware.
func RoleMiddleware(allowedRoles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			roles, ok := r.Context().Value(RolesKey).([]string)
			if !ok || len(roles) == 0 {
				response.HandleError(w, response.ErrForbidden)
				return
			}

			for _, allowed := range allowedRoles {
				for _, userRole := range roles {
					if userRole == allowed {
						next.ServeHTTP(w, r)
						return
					}
				}
			}

			response.HandleError(w, response.ErrForbidden)
		})
	}
}
