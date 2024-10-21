package routes

import (
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/controllers"
	"github.com/labstack/echo/v4"
)

func CategoriesRoute(e *echo.Echo) {
	e.GET("/categories", controllers.GetCategories) // Need a get Category by categoryId?
	e.PUT("/categories/:categoryId", controllers.UpdateCategory)
	e.POST("/categories", controllers.CreateCategory)
	e.DELETE("/categories/:categoryId", controllers.DeleteCategory)
}
