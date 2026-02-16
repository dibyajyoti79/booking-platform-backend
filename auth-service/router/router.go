package router

import (
	"net/http"

	env "AuthService/config/env"
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

	hotelServiceURL := env.GetString("HOTEL_SERVICE_URL", "http://localhost:8000")
	hotelServiceProxy := utils.ProxyToServiceWithPathRewrite(hotelServiceURL, "/hotel-api", "/api/v1")
	chiRouter.Route("/hotel-api", func(r chi.Router) {
		r.Get("/hotels", hotelServiceProxy)
		r.Group(func(r chi.Router) {
			r.Use(jwtAuth)
			r.Handle("/", hotelServiceProxy)
			r.Handle("/*", hotelServiceProxy)
		})
	})

	bookingServiceURL := env.GetString("BOOKING_SERVICE_URL", "http://localhost:3001")
	bookingServiceProxy := utils.ProxyToServiceWithPathRewrite(bookingServiceURL, "/booking-api", "/api/v1")
	chiRouter.Route("/booking-api", func(r chi.Router) {
		r.Use(jwtAuth)
		r.Handle("/", bookingServiceProxy)
		r.Handle("/*", bookingServiceProxy)
	})

	return chiRouter
}
