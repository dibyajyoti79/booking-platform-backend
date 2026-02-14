package controllers

import (
	"errors"
	"fmt"
	"net/http"

	"AuthService/contextkeys"
	"AuthService/dto"
	"AuthService/models"
	"AuthService/services"
	"AuthService/utils"
)

type UserController struct {
	UserService services.UserService
}

func NewUserController(_userService services.UserService) *UserController {
	return &UserController{
		UserService: _userService,
	}
}

func (uc *UserController) GetUserById(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(contextkeys.ContextKeyUser).(*models.User)
	utils.WriteJsonSuccessResponse(w, http.StatusOK, "User fetched successfully", user)
}

func (uc *UserController) Signup(w http.ResponseWriter, r *http.Request) {
	payload := r.Context().Value("signup_payload").(dto.SignupRequestDTO)

	err := uc.UserService.Signup(r.Context(), &payload)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEmailAlreadyRegistered):
			utils.WriteJsonErrorResponse(w, http.StatusConflict, "Email already registered", err)
			return
		default:
			utils.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Failed to sign up", err)
			return
		}
	}

	utils.WriteJsonSuccessResponse(w, http.StatusCreated, "Please check your email for the verification link", nil)
}

func (uc *UserController) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	err := uc.UserService.VerifyEmail(token)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrInvalidVerificationToken):
			utils.WriteJsonErrorResponse(w, http.StatusBadRequest, "Invalid verification link", err)
			return
		case errors.Is(err, services.ErrVerificationTokenExpired):
			utils.WriteJsonErrorResponse(w, http.StatusGone, "Verification link has expired; please request a new one", err)
			return
		default:
			utils.WriteJsonErrorResponse(w, http.StatusInternalServerError, "Verification failed", err)
			return
		}
	}
	utils.WriteJsonSuccessResponse(w, http.StatusOK, "Email verified successfully", nil)
}

func (uc *UserController) LoginUser(w http.ResponseWriter, r *http.Request) {

	fmt.Println("Logging in user in UserController")

	payload := r.Context().Value("payload").(dto.LoginUserRequestDTO)

	fmt.Println("Payload received:", payload)

	response, err := uc.UserService.LoginUser(&payload)
	if err != nil {
		if errors.Is(err, services.ErrEmailNotVerified) {
			utils.WriteJsonErrorResponse(w, http.StatusForbidden, "Please verify your email before signing in", err)
			return
		}
		utils.WriteJsonErrorResponse(w, http.StatusUnauthorized, "Invalid email or password", err)
		return
	}

	utils.WriteJsonSuccessResponse(w, http.StatusOK, "Success", response)

}
