package routes

import (
	"perdin-service/internal/delivery/http/handler"

	"github.com/go-chi/chi/v5"
)

func RegisterAuthRoutes(r chi.Router, h *handler.AuthHandler) {
	r.Route("/auth", func(r chi.Router) {

		// LOGIN
		r.Post("/login", h.Login)

		// REFRESH TOKEN
		r.Post("/refresh", h.RefreshToken)

		// LOGOUT
		r.Post("/logout", h.Logout)

	})
}
