package router

import (
	"AuthService/controllers"
	"AuthService/middlewares"

	"github.com/go-chi/chi/v5"
)

type UserRouter struct {
	userController *controllers.UserController
}

func NewUserRouter(_userController *controllers.UserController) Router {
	return &UserRouter{
		userController: _userController,
	}
}

func (ur *UserRouter) Register(r chi.Router) {
	r.With(middlewares.JWTAuthMiddleware).Get("/profile", ur.userController.GetUserById)
	r.With(middlewares.SignupRequestValidator).Post("/signup", ur.userController.Signup)
	r.With(middlewares.UserLoginRequestValidator).Post("/login", ur.userController.LoginUser)
	r.Get("/verify-email", ur.userController.VerifyEmail)
}
