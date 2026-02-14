package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"AuthService/clients/notification"
	db "AuthService/db/repositories"
	"AuthService/dto"
	"AuthService/models"
	"AuthService/utils"
)

// Sentinel errors for signup/verification flow.
var (
	ErrEmailAlreadyRegistered   = errors.New("email already registered")
	ErrInvalidVerificationToken = errors.New("invalid or expired verification token")
	ErrVerificationTokenExpired = errors.New("verification link has expired; please request a new one")
	ErrEmailNotVerified         = errors.New("please verify your email before signing in")
)

type UserService interface {
	GetUserById(id string) (*models.User, error)
	Signup(ctx context.Context, payload *dto.SignupRequestDTO) error
	LoginUser(payload *dto.LoginUserRequestDTO) (*dto.LoginResponseDTO, error)
	VerifyEmail(token string) error
}

type UserServiceImpl struct {
	userRepository      db.UserRepository
	notificationClient  notification.Client
	verificationBaseURL string
}

func NewUserService(_userRepository db.UserRepository, _notificationClient notification.Client, verificationBaseURL string) UserService {
	return &UserServiceImpl{
		userRepository:      _userRepository,
		notificationClient:  _notificationClient,
		verificationBaseURL: verificationBaseURL,
	}
}

func (u *UserServiceImpl) GetUserById(id string) (*models.User, error) {
	fmt.Println("Fetching user in UserService")
	user, err := u.userRepository.GetByID(id)
	if err != nil {
		fmt.Println("Error fetching user:", err)
		return nil, err
	}
	return user, nil
}

// Signup registers a new user (or resends verification for existing unverified user) and queues verification email.
// Edge cases: already verified -> ErrEmailAlreadyRegistered; unverified same email -> refresh token and resend.
func (u *UserServiceImpl) Signup(ctx context.Context, payload *dto.SignupRequestDTO) error {
	hashedPassword, err := utils.HashPassword(payload.Password)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	existing, err := u.userRepository.GetByEmail(payload.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("get user by email: %w", err)
	}

	if existing != nil {
		if existing.EmailVerified {
			return ErrEmailAlreadyRegistered
		}
		// Unverified: update token and password, resend email (user may have tried again after days).
		token, expiresAt, err := utils.GenerateEmailVerificationToken()
		if err != nil {
			return fmt.Errorf("generate verification token: %w", err)
		}
		if err := u.userRepository.UpdateVerificationToken(existing.Id, token, expiresAt, hashedPassword); err != nil {
			return fmt.Errorf("update verification token: %w", err)
		}
		return u.sendVerificationEmail(ctx, payload.Email, payload.Name, token)
	}

	token, expiresAt, err := utils.GenerateEmailVerificationToken()
	if err != nil {
		return fmt.Errorf("generate verification token: %w", err)
	}
	user := &models.User{
		Name:                            payload.Name,
		Email:                           payload.Email,
		Password:                        hashedPassword,
		Role:                            "guest",
		EmailVerified:                   false,
		EmailVerificationToken:          &token,
		EmailVerificationTokenExpiresAt: &expiresAt,
	}
	if _, err := u.userRepository.Create(user); err != nil {
		return fmt.Errorf("create user: %w", err)
	}
	return u.sendVerificationEmail(ctx, payload.Email, payload.Name, token)
}

func (u *UserServiceImpl) sendVerificationEmail(ctx context.Context, email, name, token string) error {
	link := u.verificationBaseURL + "?token=" + token
	req := &notification.SendEmailRequest{
		To:         email,
		Subject:    "Verify your email",
		TemplateID: "email-verification",
		Params: map[string]string{
			"verificationLink": link,
			"name":             name,
		},
	}
	if err := u.notificationClient.SendEmail(ctx, req); err != nil {
		return fmt.Errorf("send verification email: %w", err)
	}
	return nil
}

// VerifyEmail marks the user as verified when they click the link. Returns error if token invalid or expired.
func (u *UserServiceImpl) VerifyEmail(token string) error {
	if token == "" {
		return ErrInvalidVerificationToken
	}
	user, err := u.userRepository.GetByVerificationToken(token)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrInvalidVerificationToken
		}
		return fmt.Errorf("get by verification token: %w", err)
	}
	if user.EmailVerified {
		return nil // idempotent: already verified
	}
	if user.EmailVerificationTokenExpiresAt != nil {
		if t := *user.EmailVerificationTokenExpiresAt; t.Before(utils.VerificationTokenNow()) {
			return ErrVerificationTokenExpired
		}
	}
	if err := u.userRepository.MarkEmailVerified(user.Id); err != nil {
		return fmt.Errorf("mark email verified: %w", err)
	}
	return nil
}

func (u *UserServiceImpl) LoginUser(payload *dto.LoginUserRequestDTO) (*dto.LoginResponseDTO, error) {
	email := payload.Email
	password := payload.Password

	user, err := u.userRepository.GetByEmail(email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("invalid email or password")
		}
		return nil, fmt.Errorf("error fetching user by email: %w", err)
	}
	if user == nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	if !user.EmailVerified {
		return nil, ErrEmailNotVerified
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, fmt.Errorf("invalid email or password")
	}

	accessToken, err := utils.GenerateAccessToken(user.Email, user.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	return &dto.LoginResponseDTO{
		Token: accessToken,
	}, nil
}
