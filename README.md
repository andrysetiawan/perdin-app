# Perdin Apps

A business travel allowance management system. Employees submit travel requests, and HR/Admin can approve or reject them. The system automatically calculates travel distance and daily allowances.

## Applications

| App | Description | Tech |
|-----|-------------|------|
| [perdin-service](./perdin-service) | Backend REST API | Go, Chi, PostgreSQL, JWT |
| [perdin-web](./perdin-web) | Frontend web app | React, TypeScript, Vite, Tailwind CSS |

## Quick Start

### 1. Start the database

```bash
cd perdin-service
cp .env.example .env
docker compose up -d
```

### 2. Seed initial data

```bash
cd perdin-service
go run cmd/seed/main.go
```

### 3. Run the API server

```bash
cd perdin-service
go run cmd/api/main.go
```

Server runs at `http://localhost:8080`

### 4. Run the web app

```bash
cd perdin-web
cp .env.example .env
npm install
npm run dev
```

## Default Accounts

| Role     | Email            | Password    |
|----------|------------------|-------------|
| Admin    | admin@perdin.com | password123 |
| HR       | hr@perdin.com    | password123 |
| Employee | john@perdin.com  | password123 |
| Employee | jane@perdin.com  | password123 |
