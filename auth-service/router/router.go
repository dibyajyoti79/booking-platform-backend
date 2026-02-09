package router

import (
	"AuthService/controllers"

	"github.com/go-chi/chi/v5"
)

type Router interface {
	Register(r chi.Router)
}

func SetupRouter() *chi.Mux {

	chiRouter := chi.NewRouter()

	chiRouter.Get("/ping", controllers.PingHandler)

	return chiRouter

}
