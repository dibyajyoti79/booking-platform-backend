package app

import (
	"AuthService/clients/notification"
	config "AuthService/config/db"
	env "AuthService/config/env"
	"AuthService/controllers"
	db "AuthService/db/repositories"
	"AuthService/middlewares"
	"AuthService/router"
	"AuthService/services"
	"fmt"
	"net/http"
	"time"
)

type Config struct {
	Addr string
}

type Application struct {
	Config Config
}

func NewConfig() Config {

	port := env.GetString("PORT", ":8080")

	return Config{
		Addr: port,
	}
}

func NewApplication(cfg Config) *Application {
	return &Application{
		Config: cfg,
	}
}

func (app *Application) Run() error {
	userRepository := db.NewUserRepository(config.DB)
	notificationBaseURL := env.GetString("NOTIFICATION_SERVICE_URL", "http://localhost:8002")
	verificationLinkBaseURL := env.GetString("VERIFICATION_LINK_BASE_URL", "http://localhost:8080/verify-email")
	notificationClient := notification.NewHTTPClient(notificationBaseURL)
	userService := services.NewUserService(userRepository, notificationClient, verificationLinkBaseURL)
	userController := controllers.NewUserController(userService)
	jwtAuth := middlewares.NewJWTAuthMiddleware(userRepository)
	userRouter := router.NewUserRouter(userController, jwtAuth)

	server := &http.Server{
		Addr:         app.Config.Addr,
		Handler:      router.SetupRouter(userRouter, jwtAuth),
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	fmt.Println("Starting server on", app.Config.Addr)

	return server.ListenAndServe()
}
