package middleware

import "net/http"

// MaxBodySize limits the request body to the given number of bytes.
// Prevents clients from sending excessively large payloads.
const DefaultMaxBodySize = 1 << 20 // 1 MB

func BodyLimitMiddleware(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}
