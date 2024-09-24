package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g01/peer-prep-be/models"
)

var questionCollection *mongo.Collection

func main() {
	key := "MONGODB_URI"
	err := godotenv.Load("../.env")
	if err != nil {
		panic("Error loading .env file")
	}

	uri := os.Getenv(key)
	fmt.Println(uri)

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)
	// Create a new client and connect to the server
	client, err := mongo.Connect(context.TODO(), opts)

	if err != nil {
		panic(err)
	}
	defer func() {
		if err = client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()
	// Send a ping to confirm a successful connection
	var result bson.M
	if err := client.Database("admin").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Decode(&result); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")

	questionCollection = client.Database("peerprep").Collection("questions")

	e := echo.New()

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.POST("/questions", createQuestion)
	e.GET("/questions", getQuestions)

	e.Logger.Fatal(e.Start(":1323"))
}

func createQuestion(c echo.Context) error {
	fmt.Println("Received POST /questions request")
	var question models.Question

    if err := c.Bind(&question); err != nil {
        return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid input"})
    }

    // Generate a new ObjectID
    question.ID = primitive.NewObjectID()

    _, err := questionCollection.InsertOne(context.TODO(), question)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to create question"})
    }

	fmt.Println("Successfully inserted question")
    return c.JSON(http.StatusCreated, question)

}

func getQuestions(c echo.Context) error {
	fmt.Println("Received GET /questions request")
    var questions []models.Question

    cursor, err := questionCollection.Find(context.TODO(), bson.M{})
    if err != nil {
        fmt.Println("Failed to retrieve questions")
        return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Failed to retrieve questions"})
    }
    defer cursor.Close(context.TODO())

    for cursor.Next(context.TODO()) {
        var question models.Question
        cursor.Decode(&question)
        questions = append(questions, question)
    }

    if err := cursor.Err(); err != nil {
        fmt.Println("Error while decoding")
        return c.JSON(http.StatusInternalServerError, echo.Map{"error": "Error while decoding"})
    }

    fmt.Println("Successfully retrieved questions")
    return c.JSON(http.StatusOK, questions)
}
