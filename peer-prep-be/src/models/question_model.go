package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Question struct {
	Question_id primitive.ObjectID `json:"question_id,omitempty"`
	Question_title string `json:"question_title" validate:"required"`
	Question_description string `json:"question_description" validate:"required"`
	Question_categories []string `json:"question_categories" validate:"required"`
	Question_complexity string `json:"question_complexity" validate:"required"`
}