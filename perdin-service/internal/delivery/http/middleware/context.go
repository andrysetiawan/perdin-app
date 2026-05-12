package middleware

type ContextKey string

const (
	UserIDKey ContextKey = "user_id"

	EmailKey ContextKey = "email"

	RolesKey ContextKey = "roles"
)
