package controllers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/configs"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/models"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/src/responses"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var questionCollection *mongo.Collection = configs.GetCollection(configs.DB, "questions")
var validate = validator.New()
var errMessage = "error"
var successMessage = "success"

// Helper Functions
// Takes in the sortField and sortOrder from the query string and returns the FindOptions object
func ProcessSortParams(sortField string, sortOrder string) *options.FindOptions {
	var findOptions *options.FindOptions

	if sortField != "" {
		order := 1 // Default to ascending order
		if sortOrder == "desc" {
			order = -1 // If 'desc' is provided, sort in descending order
		}

		// Set the sorting options
		findOptions = options.Find().SetCollation(&options.Collation{Locale: "en_US"}).SetSort(bson.D{{Key: sortField, Value: order}})
	} else {
		// No sorting specified, natural MongoDB order
		findOptions = options.Find()
	}

	return findOptions
}

func ProcessFilterParams(filterField string, filterValues string) bson.D {
	filter := bson.D{{}}

	if filterField != "" && filterValues != "" {
		values := strings.Split(filterValues, ",")

		if len(values) == 1 {
			filter = bson.D{{Key: filterField, Value: values[0]}}
		} else {
			filterConditions := bson.A{}
			for _, value := range values {
				filterConditions = append(filterConditions, bson.D{{Key: filterField, Value: value}})
			}

			filter = bson.D{
				{
					Key:   "$or",
					Value: filterConditions,
				},
			}
		}

	}

	return filter
}

// Services
func CreateQuestion(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	var existingQuestion models.Question
	var question models.Question
	defer cancel()

	// Validate the request body
	if err := c.Bind(&question); err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	// Validate fields that are indicated as "Required" in model
	if validationErr := validate.Struct(&question); validationErr != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": validationErr.Error()}})
	}

	err := questionCollection.FindOne(ctx, bson.M{
		"question_title": bson.M{
			"$regex":  strings.TrimSpace(question.Question_title),
			"$options": "i",
		},
	}).Decode(&existingQuestion)

	// Only want to throw this error if there's a duplicate found, meaning FindOne has no error
	if err == nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": "Question with the same title already exists."}})
	}

	newQuestionId := primitive.NewObjectID()

	newQuestion := models.Question{
		Question_id:          newQuestionId,
		Question_title:       question.Question_title,
		Question_description: question.Question_description,
		Question_categories:  question.Question_categories,
		Question_complexity:  question.Question_complexity,
	}

	result, err := questionCollection.InsertOne(ctx, newQuestion)
	if err != nil {
		cancel()
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	result.InsertedID = newQuestionId
	return c.JSON(http.StatusCreated, responses.StatusResponse{Status: http.StatusCreated, Message: successMessage, Data: &echo.Map{"data": result}})
}

func GetQuestion(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	questionId := c.Param("questionId") // URL param from GET route
	var question models.Question
	defer cancel()

	objId, _ := primitive.ObjectIDFromHex(questionId) // Convert to ObjectID (how MongoDB stores Ids)

	err := questionCollection.FindOne(ctx, bson.M{"question_id": objId}).Decode(&question)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{Status: http.StatusOK, Message: successMessage, Data: &echo.Map{"data": question}})
}

func GetQuestions(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	var questions []models.Question
	defer cancel()

	// Retrieve sorting params from query string
	sortField := c.QueryParam("sortBy")  // currently only for question_title, included for future extension
	sortOrder := c.QueryParam("orderBy") // currently expected to only sort in ascending order, included for future extension
	filterField := c.QueryParam("filterBy")
	filterValues := c.QueryParam("filterValues")

	// Process the sorting options (if any)
	filter := ProcessFilterParams(filterField, filterValues)
	findOptions := ProcessSortParams(sortField, sortOrder) // Note: sorting of strings is case-sensitive by default

	cur, err := questionCollection.Find(ctx, filter, findOptions)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{
			Status:  http.StatusInternalServerError,
			Message: "Error fetching questions",
			Data:    &echo.Map{"data": err.Error()},
		})
	}

	for cur.Next(ctx) {
		var doc models.Question
		err := cur.Decode(&doc)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
		}
		questions = append(questions, doc)
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{Status: http.StatusOK, Message: successMessage, Data: &echo.Map{"data": questions}})
}

func UpdateQuestion(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	// questionId in URL param is in hex format
	questionId := c.Param("questionId")
	var existingQuestion models.Question
	var question models.Question
	defer cancel()

	// Convert questionId to ObjectID
	objId, err := primitive.ObjectIDFromHex(questionId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	// Bind the request body to the question model
	if err := c.Bind(&question); err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	// After binding, validate the fields of question variable
	if validationErr := validate.Struct(&question); validationErr != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": validationErr.Error()}})
	}

	err = questionCollection.FindOne(ctx, bson.M{
		"question_title": bson.M{
			"$regex":  strings.TrimSpace(question.Question_title),
			"$options": "i",
		},
	}).Decode(&existingQuestion)

	// Only want to throw this error if there's a duplicate found, meaning FindOne has no error
	if err == nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": "Question with the same title already exists."}})
	}

	// Update the question in the database
	update := bson.M{
		"$set": bson.M{
			"question_title":       question.Question_title,
			"question_description": question.Question_description,
			"question_categories":  question.Question_categories,
			"question_complexity":  question.Question_complexity,
		},
	}

	// Perform the Update operation
	result, err := questionCollection.UpdateOne(ctx, bson.M{"question_id": objId}, update)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{Status: http.StatusOK, Message: successMessage, Data: &echo.Map{"data": result}})
}

func DeleteQuestion(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	questionId := c.Param("questionId")
	defer cancel()

	objId, err := primitive.ObjectIDFromHex(questionId)
	if err != nil {
		return c.JSON(http.StatusBadRequest, responses.StatusResponse{Status: http.StatusBadRequest, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	result, err := questionCollection.DeleteOne(ctx, bson.M{"question_id": objId})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{Status: http.StatusOK, Message: successMessage, Data: &echo.Map{"data": result}})
}

func SearchQuestion(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	var questions []models.Question
	defer cancel()

	searchTerm := c.QueryParam("prefix")
	fmt.Println(searchTerm)

	indexModel := mongo.IndexModel{
		Keys: bson.D{{Key: "question_title", Value: "text"}},
	}

	indexName, err := questionCollection.Indexes().CreateOne(context.TODO(), indexModel)

	fmt.Println(indexName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	filter := bson.D{
		{Key: "question_title", Value: bson.D{
			{Key: "$regex", Value: searchTerm},
			{Key: "$options", Value: "i"}, // Case-insensitive search
		}},
	}

	cur, err := questionCollection.Find(ctx, filter)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	for cur.Next(ctx) {
		var doc models.Question
		err := cur.Decode(&doc)

		if err != nil {
			return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
		}
		questions = append(questions, doc)
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{Status: http.StatusOK, Message: successMessage, Data: &echo.Map{"data": questions}})
}

func GetDistinctQuestionCategories(c echo.Context) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get the distinct categories from the questions collection
	categories, err := questionCollection.Distinct(ctx, "question_categories", bson.M{})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, responses.StatusResponse{Status: http.StatusInternalServerError, Message: errMessage, Data: &echo.Map{"data": err.Error()}})
	}

	return c.JSON(http.StatusOK, responses.StatusResponse{Status: http.StatusOK, Message: successMessage, Data: &echo.Map{"data": categories}})
}
