package entity

import "time"

type Travel struct {
	ID                string    `json:"id"`
	UserID            string    `json:"user_id"`
	UserName          string    `json:"user_name"`
	Purpose           string    `json:"purpose"`
	OriginCityID      string    `json:"origin_city_id"`
	OriginCityName    string    `json:"origin_city_name"`
	DestinationCityID string    `json:"destination_city_id"`
	DestCityName      string    `json:"destination_city_name"`
	StartDate         time.Time `json:"start_date"`
	EndDate           time.Time `json:"end_date"`
	DurationDays      int       `json:"duration_days"`
	DistanceKM        float64   `json:"distance_km"`
	AllowancePerDay   float64   `json:"allowance_per_day"`
	TotalAllowance    float64   `json:"total_allowance"`
	Status            string    `json:"status"`
	ApprovedBy        string    `json:"approved_by,omitempty"`
	ApprovedAt        time.Time `json:"approved_at,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}
