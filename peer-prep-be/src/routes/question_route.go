package routes

import (
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/controllers"
	"github.com/labstack/echo/v4"
)

func QuestionRoute(e *echo.Echo) {
	e.GET("/questions/:questionId", controllers.GetQuestion)
	e.GET("/questions", controllers.GetQuestions)
	e.GET("/questions/search", controllers.SearchQuestion)
	e.POST("/questions", controllers.CreateQuestion)
	e.PUT("/questions/:questionId", controllers.UpdateQuestion)
	e.DELETE("/questions/:questionId", controllers.DeleteQuestion)
	e.GET("/questions/categories", controllers.GetDistinctQuestionCategories)
}
