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

	hotelServiceURL := "http://localhost:8001"
	chiRouter.Route("/hotel", func(r chi.Router) {
		r.Get("/search", utils.ProxyToService(hotelServiceURL))
		r.Group(func(r chi.Router) {
			r.Use(jwtAuth)
			r.HandleFunc("/*", utils.ProxyToService(hotelServiceURL))
		})
	})

	return chiRouter
}
