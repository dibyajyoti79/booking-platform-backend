package middlewares

import (
	env "AuthService/config/env"
	"AuthService/contextkeys"
	db "AuthService/db/repositories"
	"AuthService/models"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

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

			ctx := context.WithValue(r.Context(), contextkeys.ContextKeyUser, user)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireRole(allowedRoles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedRoles))
	for _, r := range allowedRoles {
		allowed[r] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, _ := r.Context().Value(contextkeys.ContextKeyUser).(*models.User)
			if user == nil {
				writeUnauthorized(w, "Unauthorized")
				return
			}
			if _, ok := allowed[user.Role]; !ok {
				writeForbidden(w, "Forbidden: insufficient role")
				return
			}
			next.ServeHTTP(w, r)
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

func writeForbidden(w http.ResponseWriter, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusForbidden)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"status":  "error",
		"message": message,
	})
}
