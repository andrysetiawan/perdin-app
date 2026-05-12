# Perdin Service

A backend REST API service for managing business travel allowances. Built with Go using Clean Architecture principles

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Applications](#applications)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

---

## Overview

Perdin Service provides a complete travel request management system for organizations. Employees submit travel requests specifying origin/destination cities and travel dates. The system automatically calculates the travel distance (using the Haversine formula) and determines the daily allowance based on configurable rules. HR managers or admins can then approve or reject requests.

**Key capabilities:**

- JWT-based authentication with access/refresh token rotation
- Role-based access control (Admin, HR, Employee)
- Full CRUD for users, roles, cities, and travel requests
- Automatic distance calculation between cities using GPS coordinates
- Tiered allowance calculation based on distance, province, island, and overseas status
- Travel request approval workflow (pending → approved / rejected)
- Paginated list endpoints with filtering support
- Request body size limiting and structured JSON error responses
- Swagger UI for interactive API exploration

---

## Tech Stack

| Component        | Technology                                                    |
|------------------|---------------------------------------------------------------|
| Language         | Go 1.26                                                       |
| HTTP Router      | [chi](https://github.com/go-chi/chi) v5                      |
| Database         | PostgreSQL 16                                                 |
| DB Driver        | [pgx](https://github.com/jackc/pgx) v5 (connection pooling)  |
| Authentication   | [golang-jwt](https://github.com/golang-jwt/jwt) v5           |
| Validation       | [go-playground/validator](https://github.com/go-playground/validator) v10 |
| Password Hashing | bcrypt (golang.org/x/crypto)                                  |
| Configuration    | Environment variables via [godotenv](https://github.com/joho/godotenv) |
| Hot Reload       | [Air](https://github.com/air-verse/air)                       |
| Containerization | Docker Compose                                                |

---

## Architecture

The project follows **Clean Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                   Delivery Layer                     │
│         (HTTP Handlers, Routes, Middleware, DTOs)    │
├─────────────────────────────────────────────────────┤
│                   Use Case Layer                     │
│              (Business Logic / Application)          │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                       │
│     (Entities, Repository Interfaces, Services)     │
├─────────────────────────────────────────────────────┤
│                Infrastructure Layer                  │
│         (PostgreSQL Repositories, JWT Service)       │
└─────────────────────────────────────────────────────┘
```

- **Domain Layer** — Contains entities (User, City, Travel, Role, RefreshToken), repository interfaces, port interfaces, and domain services (distance calculation, allowance rules).
- **Use Case Layer** — Implements application-specific business rules. Each use case has its own DTO, interface, and implementation file.
- **Delivery Layer** — HTTP handlers, route registration, middleware (JWT auth, role check, body limit, logging), and request/response DTOs.
- **Infrastructure Layer** — Concrete implementations of repository and service interfaces using PostgreSQL (pgx) and JWT.

---

## Applications

This project contains two runnable applications under the `cmd/` directory:

### 1. API Server (`cmd/api`)

The main HTTP server that exposes all REST API endpoints. It initializes the full dependency graph (config → database → repositories → use cases → handlers → routes) and runs with graceful shutdown support.

**Highlights:**

- Structured JSON logging via `slog`
- Configurable read/write/idle timeouts
- Graceful shutdown on SIGINT/SIGTERM
- Connection pooling with configurable min/max connections
- Global middleware: request logging, body size limit (1 MB)

**Run:**

```bash
go run cmd/api/main.go
```

---

### 2. Database Seeder (`cmd/seed`)

A standalone CLI tool that populates the database with initial reference data. It reads and executes the SQL file at `db/seed/seed.sql`.

**What gets seeded:**

| Category | Data |
|----------|------|
| Roles    | `admin`, `hr`, `employee` |
| Users    | 4 users with pre-assigned roles |
| Cities   | 10 cities across Indonesia + 1 overseas (Singapore) |

**Seeded User Accounts:**

| Name           | Email            | Role     | Password    |
|----------------|------------------|----------|-------------|
| Admin User     | admin@perdin.com | admin    | password123 |
| HR Manager     | hr@perdin.com    | hr       | password123 |
| John Employee  | john@perdin.com  | employee | password123 |
| Jane Employee  | jane@perdin.com  | employee | password123 |

**Run:**

```bash
go run cmd/seed/main.go
```

---

## Getting Started

### Prerequisites

- **Go** 1.26 or later
- **Docker** & **Docker Compose** (for PostgreSQL)
- **Air** (optional, for hot reload during development)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd perdin-service
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your `DB_PASSWORD` and `JWT_SECRET` values.

3. **Start PostgreSQL:**

   ```bash
   docker compose up -d
   ```

   This starts a PostgreSQL 16 container with a health check. The database name, user, and password are read from your `.env` file.

4. **Run the database seeder:**

   ```bash
   go run cmd/seed/main.go
   ```

   This creates the initial roles, users, and cities.

5. **Start the API server:**

   ```bash
   go run cmd/api/main.go
   ```

   The server starts at `http://localhost:8080`.

6. **Verify it's running:**

   ```bash
   curl http://localhost:8080/api/v1/health
   ```

   Expected response:
   ```json
   {"success": true, "data": {"status": "ok"}}
   ```

### Development with Hot Reload

Install [Air](https://github.com/air-verse/air) and run:

```bash
air
```

Air watches for `.go`, `.toml`, and `.yaml` file changes, rebuilds the API binary, and restarts the server automatically.

---

## Environment Variables

| Variable                    | Default   | Description                                      |
|-----------------------------|-----------|--------------------------------------------------|
| `APP_PORT`                  | `8080`    | Port the HTTP server listens on                  |
| `DB_HOST`                   | `localhost` | PostgreSQL host                                |
| `DB_PORT`                   | `5432`    | PostgreSQL port                                  |
| `DB_USER`                   | `postgres` | PostgreSQL username                             |
| `DB_PASSWORD`               | —         | PostgreSQL password (required)                   |
| `DB_NAME`                   | `perdin_db` | PostgreSQL database name                       |
| `DB_SSLMODE`                | `disable` | PostgreSQL SSL mode                              |
| `DB_MAX_CONNS`              | `20`      | Maximum connections in the pool                  |
| `DB_MIN_CONNS`              | `5`       | Minimum idle connections in the pool             |
| `JWT_SECRET`                | —         | Secret key for signing JWT tokens (required)     |
| `JWT_ACCESS_EXPIRY_MINUTES` | `15`      | Access token lifetime in minutes                 |
| `JWT_REFRESH_EXPIRY_DAYS`   | `7`       | Refresh token lifetime in days                   |

---

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Health

| Method | Endpoint  | Description  | Access |
|--------|-----------|--------------|--------|
| GET    | `/health` | Health check | Public |

### Authentication

| Method | Endpoint        | Description                    | Access |
|--------|-----------------|--------------------------------|--------|
| POST   | `/auth/login`   | Login with email and password  | Public |
| POST   | `/auth/refresh` | Refresh access token           | Public |
| POST   | `/auth/logout`  | Revoke refresh token (logout)  | Public |

### Profile

| Method | Endpoint            | Description          | Access        |
|--------|---------------------|----------------------|---------------|
| GET    | `/profile`          | Get own user profile | Authenticated |
| PUT    | `/profile/password` | Change own password  | Authenticated |

### Users (Admin only)

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/users`                    | List all users (paginated) |
| POST   | `/users`                    | Create a new user        |
| GET    | `/users/{id}`               | Get user by ID           |
| PUT    | `/users/{id}`               | Update user details      |
| DELETE | `/users/{id}`               | Delete a user            |
| POST   | `/users/{id}/roles`         | Assign a role to user    |
| DELETE | `/users/{id}/roles/{roleId}` | Remove a role from user |

### Roles (Admin only)

| Method | Endpoint      | Description       |
|--------|---------------|-------------------|
| GET    | `/roles`      | List all roles    |
| POST   | `/roles`      | Create a new role |
| DELETE | `/roles/{id}` | Delete a role     |

### Cities

| Method | Endpoint       | Description                | Access        |
|--------|----------------|----------------------------|---------------|
| GET    | `/cities`      | List cities (paginated)    | Authenticated |
| POST   | `/cities`      | Create a new city          | Admin         |
| GET    | `/cities/{id}` | Get city by ID             | Authenticated |
| PUT    | `/cities/{id}` | Update city                | Admin         |
| DELETE | `/cities/{id}` | Delete city                | Admin         |

### Travel Requests

| Method | Endpoint                | Description                          | Access         |
|--------|-------------------------|--------------------------------------|----------------|
| GET    | `/travels`              | List travel requests (with filters)  | Authenticated  |
| POST   | `/travels`              | Create a travel request              | Employee/Admin |
| GET    | `/travels/{id}`         | Get travel request by ID             | Authenticated  |
| PUT    | `/travels/{id}`         | Update a pending travel request      | Employee/Admin |
| DELETE | `/travels/{id}`         | Delete a pending travel request      | Employee/Admin |
| POST   | `/travels/{id}/approve` | Approve a pending travel request     | HR/Admin       |
| POST   | `/travels/{id}/reject`  | Reject a pending travel request      | HR/Admin       |

**Filtering options for `GET /travels`:**

- `user_id` — Filter by user (HR/Admin only)
- `status` — Filter by status: `pending`, `approved`, `rejected`
- `page` / `limit` — Pagination controls

---

## Project Structure

```
perdin-service/
├── cmd/
│   ├── api/                    # Main API server entry point
│   │   └── main.go
│   └── seed/                   # Database seeder entry point
│       └── main.go
├── config/
│   └── config.go               # Environment configuration loader
├── db/
│   └── seed/
│       └── seed.sql            # Initial seed data (roles, users, cities)
├── docs/
│   ├── index.html              # Swagger UI
│   └── openapi.yaml            # OpenAPI 3.0 specification
├── internal/
│   ├── common/                 # Shared utilities
│   │   ├── datetime/           # Date parsing helpers
│   │   ├── pagination/         # Pagination logic
│   │   ├── query/              # Query parameter parsing
│   │   ├── response/           # Standardized JSON responses & errors
│   │   ├── security/           # Password hashing (bcrypt)
│   │   └── validator/          # Request validation wrapper
│   ├── delivery/
│   │   └── http/
│   │       ├── dto/            # Request/Response DTOs for HTTP layer
│   │       ├── handler/        # HTTP handlers (controllers)
│   │       ├── middleware/     # JWT auth, role check, body limit, logger
│   │       └── routes/         # Route registration
│   ├── domain/
│   │   ├── entity/             # Domain entities (User, City, Travel, Role, etc.)
│   │   ├── port/               # Interface ports (TokenService)
│   │   ├── query/              # Query filter objects
│   │   ├── repository/         # Repository interfaces
│   │   └── service/            # Domain services (distance, allowance)
│   ├── infrastructure/
│   │   ├── jwt/                # JWT token service implementation
│   │   └── postgres/           # PostgreSQL repository implementations
│   └── usecase/
│       ├── auth/               # Authentication use case
│       ├── city/               # City management use case
│       ├── role/               # Role management use case
│       ├── travel/             # Travel request use case
│       └── user/               # User management use case
├── .air.toml                   # Air hot reload configuration
├── .env.example                # Environment variable template
├── docker-compose.yml          # PostgreSQL container setup
├── go.mod                      # Go module definition
└── go.sum                      # Dependency checksums
```

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:8080/docs
```

The raw OpenAPI 3.0 specification is served at:

```
http://localhost:8080/docs/openapi.yaml
```
