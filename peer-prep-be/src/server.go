package main

import (
	"net/http"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/configs"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/routes"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	//run database
	configs.ConnectDB()

	e := echo.New()
	// Middleware
	e.Use(middleware.Logger())  // Logger
	e.Use(middleware.Recover()) // Recover
	// CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	routes.QuestionRoute(e)
	routes.CategoriesRoute(e)

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})
	e.Logger.Fatal(e.Start(":8080"))
}
