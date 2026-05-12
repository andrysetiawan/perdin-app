package routes

import (
	"perdin-service/internal/delivery/http/handler"
	"perdin-service/internal/delivery/http/middleware"
	"perdin-service/internal/domain/port"

	"github.com/go-chi/chi/v5"
)

func RegisterRoleRoutes(r chi.Router, h *handler.RoleHandler, tokenService port.TokenService) {
	r.Route("/roles", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(middleware.JWTMiddleware(tokenService))
			r.Use(middleware.RoleMiddleware("admin"))

			r.Get("/", h.GetAll)
			r.Post("/", h.Create)
			r.Delete("/{id}", h.Delete)
		})
	})
}
