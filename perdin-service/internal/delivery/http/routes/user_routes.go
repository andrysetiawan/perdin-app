package routes

import (
	"perdin-service/internal/delivery/http/handler"
	"perdin-service/internal/delivery/http/middleware"
	"perdin-service/internal/domain/port"

	"github.com/go-chi/chi/v5"
)

func RegisterUserRoutes(r chi.Router, h *handler.UserHandler, tokenService port.TokenService) {
	// ── Profile routes (any authenticated user) ──────────────────────────
	r.Route("/profile", func(r chi.Router) {
		r.Use(middleware.JWTMiddleware(tokenService))

		r.Get("/", h.GetProfile)
		r.Put("/password", h.ChangePassword)
	})

	// ── Admin user management ────────────────────────────────────────────
	r.Route("/users", func(r chi.Router) {
		r.Use(middleware.JWTMiddleware(tokenService))
		r.Use(middleware.RoleMiddleware("admin"))

		r.Get("/", h.GetAll)
		r.Post("/", h.Create)
		r.Get("/{id}", h.GetByID)
		r.Put("/{id}", h.Update)
		r.Delete("/{id}", h.Delete)

		// Role assignment
		r.Post("/{id}/roles/{roleId}", h.AssignRole)
		r.Delete("/{id}/roles/{roleId}", h.RemoveRole)
	})
}
