package main

import (
	"AuthService/app"
	dbConfig "AuthService/config/db"
	config "AuthService/config/env"
)

func main() {

	config.Load()
	dbConfig.InitDB()

	cfg := app.NewConfig()
	app := app.NewApplication(cfg)

	app.Run()
}
