package dto

import "perdin-service/internal/domain/entity"

// TravelResponse is the HTTP response body for travel endpoints.
type TravelResponse struct {
	ID                string  `json:"id"`
	UserID            string  `json:"user_id"`
	UserName          string  `json:"user_name"`
	Purpose           string  `json:"purpose"`
	OriginCityID      string  `json:"origin_city_id"`
	OriginCityName    string  `json:"origin_city_name"`
	DestinationCityID string  `json:"destination_city_id"`
	DestCityName      string  `json:"destination_city_name"`
	StartDate         string  `json:"start_date"`
	EndDate           string  `json:"end_date"`
	DurationDays      int     `json:"duration_days"`
	DistanceKM        float64 `json:"distance_km"`
	AllowancePerDay   float64 `json:"allowance_per_day"`
	TotalAllowance    float64 `json:"total_allowance"`
	Status            string  `json:"status"`
	ApprovedBy        string  `json:"approved_by,omitempty"`
	ApprovedAt        string  `json:"approved_at,omitempty"`
}

func ToTravelResponse(travel *entity.Travel) TravelResponse {
	r := TravelResponse{
		ID:                travel.ID,
		UserID:            travel.UserID,
		UserName:          travel.UserName,
		Purpose:           travel.Purpose,
		OriginCityID:      travel.OriginCityID,
		OriginCityName:    travel.OriginCityName,
		DestinationCityID: travel.DestinationCityID,
		DestCityName:      travel.DestCityName,
		StartDate:         travel.StartDate.Format("2006-01-02"),
		EndDate:           travel.EndDate.Format("2006-01-02"),
		DurationDays:      travel.DurationDays,
		DistanceKM:        travel.DistanceKM,
		AllowancePerDay:   travel.AllowancePerDay,
		TotalAllowance:    travel.TotalAllowance,
		Status:            travel.Status,
		ApprovedBy:        travel.ApprovedBy,
	}
	if !travel.ApprovedAt.IsZero() {
		r.ApprovedAt = travel.ApprovedAt.Format("2006-01-02")
	}
	return r
}

func ToTravelResponses(travels []*entity.Travel) []TravelResponse {
	responses := make([]TravelResponse, len(travels))
	for i, travel := range travels {
		responses[i] = ToTravelResponse(travel)
	}
	return responses
}
