package routes

import (
	"perdin-service/internal/delivery/http/handler"
	"perdin-service/internal/delivery/http/middleware"
	"perdin-service/internal/domain/port"

	"github.com/go-chi/chi/v5"
)

func RegisterCityRoutes(r chi.Router, h *handler.CityHandler, tokenService port.TokenService) {
	r.Route("/cities", func(r chi.Router) {
		r.Use(middleware.JWTMiddleware(tokenService))

		// All authenticated users can read cities.
		r.Get("/", h.GetAll)
		r.Get("/{id}", h.GetByID)

		// Only admin can create, update, delete.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("admin"))

			r.Post("/", h.Create)
			r.Put("/{id}", h.Update)
			r.Delete("/{id}", h.Delete)
		})
	})
}
