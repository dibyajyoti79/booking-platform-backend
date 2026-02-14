package router

import (
	"net/http"

	"AuthService/controllers"
	"AuthService/utils"

	"github.com/go-chi/chi/v5"
)

type Router interface {
	Register(r chi.Router)
}

func SetupRouter(userRouter Router, jwtAuth func(http.Handler) http.Handler) *chi.Mux {
	chiRouter := chi.NewRouter()

	chiRouter.Get("/ping", controllers.PingHandler)

	userRouter.Register(chiRouter)

	hotelServiceURL := "http://localhost:8000"
	hotelServiceProxy := utils.ProxyToServiceWithPathRewrite(hotelServiceURL, "/hotel-api", "/api/v1")
	chiRouter.Route("/hotel-api", func(r chi.Router) {
		r.Use(jwtAuth)
		r.Handle("/", hotelServiceProxy)
		r.Handle("/*", hotelServiceProxy)
	})

	return chiRouter
}
