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

// Config holds the configuration for the server.
type Config struct {
	Addr string // PORT
}

type Application struct {
	Config Config
}

// Constructor for Config
func NewConfig() Config {

	port := env.GetString("PORT", ":8080")

	return Config{
		Addr: port,
	}
}

// Constructor for Application
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
		ReadTimeout:  10 * time.Second, // Set read timeout to 10 seconds
		WriteTimeout: 10 * time.Second, // Set write timeout to 10 seconds
	}

	fmt.Println("Starting server on", app.Config.Addr)

	return server.ListenAndServe()
}
