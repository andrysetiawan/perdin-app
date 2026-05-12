package routes

import (
	"perdin-service/internal/delivery/http/handler"
	"perdin-service/internal/delivery/http/middleware"
	"perdin-service/internal/domain/port"

	"github.com/go-chi/chi/v5"
)

func RegisterTravelRoutes(r chi.Router, h *handler.TravelHandler, tokenService port.TokenService) {
	r.Route("/travels", func(r chi.Router) {
		// All travel routes require authentication.
		r.Use(middleware.JWTMiddleware(tokenService))

		// ── Employee routes ──────────────────────────────────────────────
		// Employees can create, view, update (while pending), and delete their own requests.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("employee", "admin"))

			r.Post("/", h.Create)
			r.Put("/{id}", h.Update)
			r.Delete("/{id}", h.Delete)
		})

		// ── HR routes ────────────────────────────────────────────────────
		// HR can approve or reject pending travel requests.
		r.Group(func(r chi.Router) {
			r.Use(middleware.RoleMiddleware("hr", "admin"))

			r.Post("/{id}/approve", h.Approve)
			r.Post("/{id}/reject", h.Reject)
		})

		// ── Shared routes ────────────────────────────────────────────────
		// All authenticated users can view travel requests.
		r.Get("/", h.GetAll)
		r.Get("/{id}", h.GetByID)
	})
}
