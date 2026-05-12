package dto

// CreateTravelRequest is the HTTP request body for POST /travels.
type CreateTravelRequest struct {
	Purpose           string `json:"purpose"`
	OriginCityID      string `json:"origin_city_id"`
	DestinationCityID string `json:"destination_city_id"`
	StartDate         string `json:"start_date"`
	EndDate           string `json:"end_date"`
}

// UpdateTravelRequest is the HTTP request body for PUT /travels/:id.
// Only the employee who owns the travel can update it while it's pending.
type UpdateTravelRequest struct {
	Purpose           *string `json:"purpose"`
	OriginCityID      *string `json:"origin_city_id"`
	DestinationCityID *string `json:"destination_city_id"`
	StartDate         *string `json:"start_date"`
	EndDate           *string `json:"end_date"`
}

// ApproveTravelRequest is the HTTP request body for PATCH /travels/:id/approve.
// Only SDM can approve or reject a travel request.
type ApproveTravelRequest struct {
	Status string `json:"status"`
}
