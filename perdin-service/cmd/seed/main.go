package main

import (
	"context"
	"log/slog"
	"os"
	"time"

	"perdin-service/config"
	"perdin-service/internal/infrastructure/postgres"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg := config.Load()

	db, err := postgres.NewPostgresDB(cfg)
	if err != nil {
		slog.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	slog.Info("running seed...")

	seedSQL, err := os.ReadFile("db/seed/seed.sql")
	if err != nil {
		slog.Error("failed to read seed file", "error", err)
		os.Exit(1)
	}

	if _, err := db.Pool.Exec(ctx, string(seedSQL)); err != nil {
		slog.Error("failed to run seed", "error", err)
		os.Exit(1)
	}

	slog.Info("seed completed successfully")
	slog.Info("seeded accounts (password: password123)")
	slog.Info("  admin    → admin@perdin.com")
	slog.Info("  hr       → hr@perdin.com")
	slog.Info("  employee → john@perdin.com")
	slog.Info("  employee → jane@perdin.com")
}
