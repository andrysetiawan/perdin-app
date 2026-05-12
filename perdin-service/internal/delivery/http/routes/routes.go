package routes

import (
	"net/http"
	"os"
	"perdin-service/internal/common/response"
	"perdin-service/internal/delivery/http/handler"
	"perdin-service/internal/delivery/http/middleware"
	"perdin-service/internal/domain/port"

	"github.com/go-chi/chi/v5"
)

// Handlers groups all HTTP handlers and shared infrastructure needed by routes.
type Handlers struct {
	Auth         *handler.AuthHandler
	City         *handler.CityHandler
	Travel       *handler.TravelHandler
	User         *handler.UserHandler
	Role         *handler.RoleHandler
	TokenService port.TokenService
}

func RegisterAllRoutes(r chi.Router, h *Handlers) {
	// Global middleware
	r.Use(middleware.LoggerMiddleware)
	r.Use(middleware.BodyLimitMiddleware(middleware.DefaultMaxBodySize))

	// Serve API docs (Swagger UI)
	r.Get("/docs", serveSwaggerUI)
	r.Get("/docs/index.html", serveSwaggerUI)
	r.Get("/docs/openapi.yaml", serveOpenAPISpec)

	r.Route("/api/v1", func(r chi.Router) {

		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			response.Success(w, map[string]string{"status": "ok"})
		})

		RegisterAuthRoutes(r, h.Auth)
		RegisterCityRoutes(r, h.City, h.TokenService)
		RegisterTravelRoutes(r, h.Travel, h.TokenService)
		RegisterUserRoutes(r, h.User, h.TokenService)
		RegisterRoleRoutes(r, h.Role, h.TokenService)
	})
}

func serveOpenAPISpec(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile("docs/openapi.yaml")
	if err != nil {
		http.Error(w, "OpenAPI spec not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/yaml")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}

func serveSwaggerUI(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile("docs/index.html")
	if err != nil {
		http.Error(w, "Swagger UI not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(data)
}
