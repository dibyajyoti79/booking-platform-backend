package router

import (
	"net/http"

	"AuthService/controllers"
	"AuthService/middlewares"

	"github.com/go-chi/chi/v5"
)

type UserRouter struct {
	userController   *controllers.UserController
	jwtAuthMiddleware func(http.Handler) http.Handler
}

func NewUserRouter(_userController *controllers.UserController, jwtAuth func(http.Handler) http.Handler) Router {
	return &UserRouter{
		userController:   _userController,
		jwtAuthMiddleware: jwtAuth,
	}
}

func (ur *UserRouter) Register(r chi.Router) {
	r.With(ur.jwtAuthMiddleware).Get("/profile", ur.userController.GetUserById)
	r.With(ur.jwtAuthMiddleware).Post("/profile/become-host", ur.userController.BecomeHost)
	r.With(middlewares.SignupRequestValidator).Post("/signup", ur.userController.Signup)
	r.With(middlewares.UserLoginRequestValidator).Post("/login", ur.userController.LoginUser)
	r.Get("/verify-email", ur.userController.VerifyEmail)
}
