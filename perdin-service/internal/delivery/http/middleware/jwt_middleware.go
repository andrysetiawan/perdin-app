package middleware

import (
	"context"
	"net/http"
	"perdin-service/internal/common/response"
	"perdin-service/internal/domain/port"
	"strings"
)

// JWTMiddleware validates the Bearer token and stores claims in the request context.
// It depends on the port.TokenService interface, not on any concrete infrastructure type.
func JWTMiddleware(tokenService port.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.HandleError(w, response.ErrUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, "Bearer ", 2)
			if len(parts) != 2 || strings.TrimSpace(parts[1]) == "" {
				response.HandleError(w, response.ErrUnauthorized)
				return
			}

			claims, err := tokenService.Validate(strings.TrimSpace(parts[1]))
			if err != nil {
				response.HandleError(w, response.ErrUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, EmailKey, claims.Email)
			ctx = context.WithValue(ctx, RolesKey, claims.Roles)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
