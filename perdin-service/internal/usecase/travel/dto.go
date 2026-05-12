package travel

import "time"

// ListTravelInput carries pagination and filter parameters for listing travels.
type ListTravelInput struct {
	UserID *string
	Status *string
	Page   int
	Limit  int
}

// CreateTravelInput carries the data needed to create a new travel request.
type CreateTravelInput struct {
	UserID            string    `validate:"required"`
	Purpose           string    `validate:"required,min=5,max=255"`
	OriginCityID      string    `validate:"required,uuid4"`
	DestinationCityID string    `validate:"required,uuid4"`
	StartDate         time.Time `validate:"required"`
	EndDate           time.Time `validate:"required"`
}

// UpdateTravelInput carries the fields to update on an existing travel request.
// Nil pointer means "leave unchanged".
type UpdateTravelInput struct {
	Purpose           *string `validate:"omitempty,min=5,max=255"`
	OriginCityID      *string `validate:"omitempty,uuid4"`
	DestinationCityID *string `validate:"omitempty,uuid4"`
	StartDate         *time.Time
	EndDate           *time.Time
}

// ApproveInput carries the data needed to approve or reject a travel request.
type ApproveInput struct {
	Status     string `validate:"required,oneof=approved rejected"`
	ApprovedBy string `validate:"required"`
}

type ChangeStatusInput struct {
	Status string `validate:"required,oneof=approved rejected pending"`
}
