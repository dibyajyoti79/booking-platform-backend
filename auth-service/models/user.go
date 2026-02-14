package models

import "time"

type User struct {
	Id                              int64      `json:"id"`
	Name                            string     `json:"name"`
	Email                           string     `json:"email"`
	Password                        string     `json:"-"` // never expose in API responses
	Role                            string     `json:"role"` // "guest" or "host", default "guest"
	EmailVerified                   bool       `json:"email_verified"`
	EmailVerificationToken          *string    `json:"-"`
	EmailVerificationTokenExpiresAt *time.Time `json:"-"`
	CreatedAt                       string     `json:"created_at"`
	UpdatedAt                       string     `json:"updated_at"`
}
