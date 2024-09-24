package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Question struct {
    ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
    Title       string             `json:"title"`
    Description string             `json:"description"`
    Category    string             `json:"category"`
    Complexity  string             `json:"complexity"`
}