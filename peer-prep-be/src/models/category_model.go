package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Category struct {
	Category_id   primitive.ObjectID `json:"category_id,omitempty"`
	Category_name string             `json:"category_name" validate:"required"`
}
