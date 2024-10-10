package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/configs"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/models"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/responses"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var categoriesCollection *mongo.Collection = configs.GetCollection(configs.DB, "categories")

func GetCategories(c echo.Context) error {

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := categoriesCollection.Find(ctx, bson.M{})

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{
			Status: http.StatusInternalServerError,
			Message: err.Error(),
		})
	}

	var categories []models.Category
	if err = cursor.All(ctx, &categories); err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{
			Status: http.StatusInternalServerError,
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{
		Status: http.StatusOK,
		Message: "Success",
		Data:    &echo.Map{"data": categories},
	})
}

func CreateCategory(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	// var existingCategory models.Category
	var category models.Category
	defer cancel()

	if err := c.Bind(&category); err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
	}

	// Validate Category Name
	if validationErr := validate.Struct(&category); validationErr != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{
			Status:  http.StatusBadRequest,
			Message: errMessage,
			Data:    &echo.Map{"data": validationErr.Error()},
		})
	}

	// Duplicate handling
	// err := categoriesCollection.FindOne(ctx, bson.M{"categoryName": category.CategoryName}).Decode(&existingCategory)
	// if err == nil {
	// 	return c.JSON(http.StatusBadRequest, responses.StatusResponse{Message: "Category already exists"})
	// }

	newCategoryId := primitive.NewObjectID()

	newCategory := models.Category{
		Category_id:   newCategoryId,
		Category_name: category.Category_name,
	}

	// Insert new if it does not exist, case insensitive
	updateResult, err := categoriesCollection.UpdateOne(ctx,
		bson.M{"category_name": newCategory.Category_name}, // Filter by category_name only, not the obj
		bson.M{"$setOnInsert": bson.M{
			"category_id":   newCategory.Category_id,
			"category_name": newCategory.Category_name,
		}},
		options.Update().SetUpsert(true).SetCollation(&options.Collation{
			Locale:   "en",
			Strength: 2, // Case-insensitive comparison
		}),
	)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{
			Status: http.StatusInternalServerError,
			Message: err.Error(),
		})
	}
	
	updateResult.UpsertedID = newCategoryId;

	// Check if a new category was created or if it was already existing
	if updateResult.UpsertedCount > 0 {
		// A new category was created
		return c.JSON(http.StatusCreated, responses.StatusResponse{
			Status: http.StatusCreated,
			Message: "Category created successfully",
			Data: &echo.Map{"data": updateResult},
		})
	}

	return c.JSON(http.StatusConflict, responses.StatusResponse{
		Status: http.StatusConflict,
		Message: "Category already exists",
	})
}

// Updates a category, e.g. singular -> plural
func UpdateCategory(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	categoryId := c.Param("categoryId")
	objId, err := primitive.ObjectIDFromHex(categoryId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{
			Status:  http.StatusBadRequest,
			Message: "Invalid category ID: " + err.Error(),
		})
	}

	var category models.Category
	if err := c.Bind(&category); err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{
			Status:  http.StatusBadRequest,
			Message: err.Error(),
		})
	}

	update := bson.M{
		"$set": bson.M{
			"category_name": category.Category_name,
		},
	}

	// Perform the Update operation
	updateResult, err := categoriesCollection.UpdateOne(ctx, bson.M{"category_id": objId}, update)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{
		Status:  http.StatusOK,
		Message: "Category updated successfully",
		Data: &echo.Map{"data": updateResult},
	})
}

func DeleteCategory(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	categoryId := c.Param("categoryId")
	objId, err := primitive.ObjectIDFromHex(categoryId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{
			Status:  http.StatusBadRequest,
			Message: "Invalid category ID: " + err.Error(),
		})
	}

	_, err = categoriesCollection.DeleteOne(ctx, bson.M{"category_id": objId})

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{
			Status:  http.StatusInternalServerError,
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{
		Status:  http.StatusOK,
		Message: "Category deleted successfully",
	})
}
