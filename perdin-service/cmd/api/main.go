package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"perdin-service/config"
	"perdin-service/internal/common/validator"
	"perdin-service/internal/delivery/http/handler"
	"perdin-service/internal/delivery/http/routes"
	"perdin-service/internal/infrastructure/jwt"
	"perdin-service/internal/infrastructure/postgres"
	authUsecase "perdin-service/internal/usecase/auth"
	cityUsecase "perdin-service/internal/usecase/city"
	roleUsecase "perdin-service/internal/usecase/role"
	travelUsecase "perdin-service/internal/usecase/travel"
	userUsecase "perdin-service/internal/usecase/user"

	"github.com/go-chi/chi/v5"
)

func main() {
	// =========================
	// 1. INIT LOGGER
	// =========================
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	// =========================
	// 2. LOAD CONFIG
	// =========================
	cfg := config.Load()

	// =========================
	// 3. INIT DATABASE
	// =========================
	db, err := postgres.NewPostgresDB(cfg)
	if err != nil {
		slog.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	slog.Info("database connected")

	// =========================
	// 4. INIT INFRASTRUCTURE
	// =========================
	tokenService := jwt.NewJWTService(cfg.JWTSecret, cfg.JWTAccessExpiry, cfg.JWTRefreshExpiry)
	v := validator.New()

	// =========================
	// 5. INIT REPOSITORIES
	// =========================
	userRepo := postgres.NewUserRepository(db.Pool)
	refreshTokenRepo := postgres.NewRefreshTokenRepository(db.Pool)
	cityRepo := postgres.NewCityRepository(db.Pool)
	travelRepo := postgres.NewTravelRepository(db.Pool)
	roleRepo := postgres.NewRoleRepository(db.Pool)

	// =========================
	// 6. INIT USE CASES
	// =========================
	authUC := authUsecase.NewAuthUseCase(userRepo, refreshTokenRepo, tokenService, v)
	cityUC := cityUsecase.NewCityUseCase(cityRepo, v)
	travelUC := travelUsecase.NewTravelUseCase(travelRepo, cityRepo, v)
	userUC := userUsecase.NewUserUseCase(userRepo, roleRepo, v)
	roleUC := roleUsecase.NewRoleUseCase(roleRepo, v)

	// =========================
	// 7. INIT HANDLERS
	// =========================
	authHandler := handler.NewAuthHandler(authUC)
	cityHandler := handler.NewCityHandler(cityUC)
	travelHandler := handler.NewTravelHandler(travelUC)
	userHandler := handler.NewUserHandler(userUC)
	roleHandler := handler.NewRoleHandler(roleUC)

	// =========================
	// 8. REGISTER ROUTES
	// =========================
	router := chi.NewRouter()

	routes.RegisterAllRoutes(router, &routes.Handlers{
		Auth:         authHandler,
		City:         cityHandler,
		Travel:       travelHandler,
		User:         userHandler,
		Role:         roleHandler,
		TokenService: tokenService,
	})

	// =========================
	// 9. HTTP SERVER
	// =========================
	server := &http.Server{
		Addr:         ":" + cfg.AppPort,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		slog.Info("server started", "port", cfg.AppPort)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// =========================
	// 10. GRACEFUL SHUTDOWN
	// =========================
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("server forced to shutdown", "error", err)
		os.Exit(1)
	}

	slog.Info("server exited properly")
}
