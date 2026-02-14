package middlewares

import (
	env "AuthService/config/env"
	db "AuthService/db/repositories"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Context keys for auth data (use typed key to avoid collisions).
type contextKey string

const ContextKeyUser contextKey = "user"

func NewJWTAuthMiddleware(userRepo db.UserRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeUnauthorized(w, "Authorization header is required")
				return
			}
			if !strings.HasPrefix(authHeader, "Bearer ") {
				writeUnauthorized(w, "Authorization header must start with Bearer")
				return
			}
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			if tokenStr == "" {
				writeUnauthorized(w, "Token is required")
				return
			}

			claims := jwt.MapClaims{}
			_, err := jwt.ParseWithClaims(tokenStr, &claims, func(token *jwt.Token) (interface{}, error) {
				return []byte(env.GetString("JWT_SECRET", "TOKEN")), nil
			})
			if err != nil {
				writeUnauthorized(w, "Invalid or expired token")
				return
			}

			userIdFloat, okId := claims["id"].(float64)
			_, okEmail := claims["email"].(string)
			if !okId || !okEmail {
				writeUnauthorized(w, "Invalid token claims")
				return
			}

			userID := strconv.FormatFloat(userIdFloat, 'f', 0, 64)
			user, err := userRepo.GetByID(userID)
			if err != nil {
				if err == sql.ErrNoRows {
					writeUnauthorized(w, "User not found")
					return
				}
				writeUnauthorized(w, "Unauthorized")
				return
			}
			if user == nil {
				writeUnauthorized(w, "User not found")
				return
			}

			ctx := context.WithValue(r.Context(), ContextKeyUser, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func writeUnauthorized(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "error",
		"message": message,
	})
}
