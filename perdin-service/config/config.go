package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort string

	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	DBMaxConns        int32
	DBMinConns        int32
	DBMaxConnLifetime time.Duration

	JWTSecret       string
	JWTAccessExpiry time.Duration
	JWTRefreshExpiry time.Duration
}

func Load() *Config {
	_ = godotenv.Load()

	return &Config{
		AppPort: os.Getenv("APP_PORT"),

		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBName:     os.Getenv("DB_NAME"),
		DBSSLMode:  os.Getenv("DB_SSLMODE"),

		DBMaxConns:        int32(getInt("DB_MAX_CONNS", 20)),
		DBMinConns:        int32(getInt("DB_MIN_CONNS", 5)),
		DBMaxConnLifetime: time.Hour,

		JWTSecret:        os.Getenv("JWT_SECRET"),
		JWTAccessExpiry:  time.Duration(getInt("JWT_ACCESS_EXPIRY_MINUTES", 15)) * time.Minute,
		JWTRefreshExpiry: time.Duration(getInt("JWT_REFRESH_EXPIRY_DAYS", 7)) * 24 * time.Hour,
	}
}

func getInt(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	i, err := strconv.Atoi(val)
	if err != nil {
		return fallback
	}
	return i
}
