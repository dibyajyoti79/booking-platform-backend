package utils

import (
	"crypto/rand"
	"encoding/hex"
	env "AuthService/config/env"
	"fmt"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const VerificationTokenBytes = 32
const VerificationTokenExpiry = 24 * time.Hour

var VerificationTokenNow = time.Now

func GenerateEmailVerificationToken() (token string, expiresAt time.Time, err error) {
	b := make([]byte, VerificationTokenBytes)
	if _, err = rand.Read(b); err != nil {
		return "", time.Time{}, fmt.Errorf("generate verification token: %w", err)
	}
	return hex.EncodeToString(b), VerificationTokenNow().Add(VerificationTokenExpiry), nil
}

func HashPassword(plainPassword string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plainPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error hashing password:", err)
		return "", err
	}
	return string(hash), nil
}

func CheckPasswordHash(plainPassword string, hashedPassword string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(plainPassword))
	return err == nil
}

func GenerateAccessToken(email string, userID int64) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"id":    userID,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(env.GetString("JWT_SECRET", "TOKEN")))
}

func GenerateMFAToken(email string, userID int64) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"id":    userID,
		"exp":   time.Now().Add(5 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(env.GetString("MFA_JWT_SECRET", "TOKEN")))
}

func VerifyMFAToken(mfaToken string) (string, error) {
	parsedToken, err := jwt.Parse(mfaToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(env.GetString("MFA_JWT_SECRET", "TOKEN")), nil
	})

	if err != nil || !parsedToken.Valid {
		return "", fmt.Errorf("invalid or expired MFA token")
	}

	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok || !parsedToken.Valid {
		return "", fmt.Errorf("invalid token claims")
	}

	userIdFloat, ok := claims["id"].(float64)
	if !ok {
		return "", fmt.Errorf("invalid user ID in token")
	}

	userId := strconv.FormatFloat(userIdFloat, 'f', 0, 64)

	return userId, nil

}
